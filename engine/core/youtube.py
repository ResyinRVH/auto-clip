import json
import os
import re
import subprocess
import sys
import tempfile
import requests
import urllib3
from youtube_transcript_api import YouTubeTranscriptApi

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def get_video_id(url: str) -> str:
    match = re.search(r"(?:v=|\/live\/|\/|youtu\.be\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else ""


def get_ytdlp_cmd() -> list:
    venv_dir = os.path.dirname(sys.executable)
    ytdlp_bin = os.path.join(venv_dir, "yt-dlp.exe")
    base_cmd = (
        [ytdlp_bin] if os.path.exists(ytdlp_bin) else [sys.executable, "-m", "yt_dlp"]
    )
    return base_cmd + ["--no-check-certificates"]


def get_video_duration(clean_url: str) -> float:
    cmd = get_ytdlp_cmd() + [
        "--print",
        "%(duration)s",
        "--no-playlist",
        clean_url,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        err = proc.stderr.strip() or proc.stdout.strip()
        raise RuntimeError(f"Gagal membaca durasi video: {err}")

    output = proc.stdout.strip().split("\n")[0]
    return float(output)


def _fetch_transcript_via_ytdlp(video_id: str) -> list:
    """Fallback mengambil auto-subtitle dari YouTube via yt-dlp (json3)."""
    clean_url = f"https://www.youtube.com/watch?v={video_id}"
    with tempfile.TemporaryDirectory() as tmpdir:
        out_tmpl = os.path.join(tmpdir, "%(id)s")
        cmd = get_ytdlp_cmd() + [
            "--skip-download",
            "--write-sub",
            "--write-auto-sub",
            "--sub-langs",
            "id,en.*",
            "--sub-format",
            "json3",
            "-o",
            out_tmpl,
            clean_url,
        ]
        subprocess.run(cmd, capture_output=True, text=True)

        json3_files = [f for f in os.listdir(tmpdir) if f.endswith(".json3")]
        if not json3_files:
            return []

        chosen = next((f for f in json3_files if ".id." in f), json3_files[0])
        with open(os.path.join(tmpdir, chosen), "r", encoding="utf-8") as f:
            data = json.load(f)

        results = []
        for event in data.get("events", []):
            segs = event.get("segs")
            if not segs:
                continue
            text = "".join(s.get("utf8", "") for s in segs).replace("\n", " ").strip()
            if not text:
                continue
            start_sec = event.get("tStartMs", 0) / 1000.0
            dur_sec = event.get("dDurationMs", 2500) / 1000.0
            results.append({"text": text, "start": start_sec, "duration": dur_sec})

        return results


def get_raw_transcript_data(video_id: str) -> tuple[list, str]:
    raw_data = []
    try:
        session = requests.Session()
        session.verify = False
        ytt = YouTubeTranscriptApi(http_client=session)
        raw_data = ytt.fetch(video_id, languages=["id", "en"])
    except Exception:
        try:
            raw_data = _fetch_transcript_via_ytdlp(video_id)
        except Exception as exc:
            print(
                f"[TRANSCRIPT WARNING]: Transkrip gagal diambil: {exc}", file=sys.stderr
            )
            return [], ""

    if not raw_data:
        print(
            "[TRANSCRIPT WARNING]: Video tidak memiliki subtitle/transkrip.",
            file=sys.stderr,
        )
        return [], ""

    full_dialog = ""
    for item in raw_data:
        start_sec = getattr(item, "start", None) or (
            item.get("start") if isinstance(item, dict) else 0
        )
        text = getattr(item, "text", None) or (
            item.get("text") if isinstance(item, dict) else ""
        )
        m, s = int(start_sec // 60), int(start_sec % 60)
        full_dialog += f"[{m:02d}:{s:02d}] {text}\n"

    return raw_data, full_dialog
