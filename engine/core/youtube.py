import os
import re
import subprocess
import sys
from youtube_transcript_api import YouTubeTranscriptApi

def get_video_id(url: str) -> str:
    match = re.search(r"(?:v=|\/live\/|\/|youtu\.be\/)([0-9A-Za-z_-]{11})", url)
    return match.group(1) if match else ""

def get_ytdlp_cmd() -> list:
    venv_dir = os.path.dirname(sys.executable)
    ytdlp_bin = os.path.join(venv_dir, "yt-dlp.exe")
    return [ytdlp_bin] if os.path.exists(ytdlp_bin) else [sys.executable, "-m", "yt_dlp"]

def get_video_duration(clean_url: str) -> float:
    cmd = get_ytdlp_cmd() + [
        "--print", "%(duration)s",
        "--no-playlist",
        clean_url,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        err = proc.stderr.strip() or proc.stdout.strip()
        raise RuntimeError(f"Gagal membaca durasi video: {err}")

    output = proc.stdout.strip().split("\n")[0]
    return float(output)

def get_raw_transcript_data(video_id: str) -> tuple[list, str]:
    try:
        ytt = YouTubeTranscriptApi()
        if hasattr(ytt, "fetch"):
            raw_data = ytt.fetch(video_id, languages=["id", "en"])
        else:
            raw_data = YouTubeTranscriptApi.get_transcript(video_id, languages=["id", "en"])

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
    except Exception as exc:
        print(f"[TRANSCRIPT WARNING]: Transkrip gagal diambil: {exc}", file=sys.stderr)
        return [], ""