import os
import re
import subprocess
import sys
from core.subtitle import generate_ass_subtitles
from core.youtube import get_ytdlp_cmd


def download_full_video(clean_url: str, output_path: str) -> str:
    """Mengunduh video master sekali saja ke storage lokal."""
    if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
        return output_path

    print(f"📥 Mengunduh video master utuh sekali jalan...")
    cmd = get_ytdlp_cmd() + [
        "--no-part",
        "--force-overwrites",
        "--extractor-args", "youtube:player_client=android,web",
        "-f", "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]/best",
        "--merge-output-format", "mp4",
        "-o", output_path,
        clean_url,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        err_msg = proc.stderr.strip() or proc.stdout.strip()
        raise RuntimeError(f"Gagal unduh video master: {err_msg}")
    return output_path


def get_fastest_encoder() -> tuple[str, str]:
    """
    Menguji apakah hardware encoder NVENC benar-benar bisa running di sistem.
    Jika driver/CUDA bermasalah, fallback ke CPU ultrafast.
    """
    try:
        test_cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "color=c=black:s=256x256:d=0.1",
            "-c:v", "h264_nvenc",
            "-f", "null", "-"
        ]
        res = subprocess.run(test_cmd, capture_output=True, text=True)
        if res.returncode == 0:
            return "h264_nvenc", "p1"
    except Exception:
        pass

    return "libx264", "ultrafast"


def render_clip_from_local(
    master_video_path: str,
    start_time: str,
    end_time: str,
    title: str,
    index: int,
    layout: str,
    output_dir: str,
    raw_transcript: list,
) -> str:
    clean_title = re.sub(r"[^a-zA-Z0-9_]", "", title)
    ass_path = os.path.join(output_dir, f"temp_sub_{index}.ass")
    final_output = os.path.join(output_dir, f"clip_{index}_{clean_title}.mp4")

    has_subtitles = False
    if raw_transcript:
        try:
            generate_ass_subtitles(raw_transcript, start_time, end_time, ass_path)
            if os.path.exists(ass_path) and os.path.getsize(ass_path) > 0:
                has_subtitles = True
        except Exception:
            pass

    ass_escaped = ass_path.replace("\\", "/").replace(":", "\\:")
    sub_filter = f"ass='{ass_escaped}'[outv]" if has_subtitles else "null[outv]"

    if layout == "gaming":
        vf = (
            f"[0:v]split=2[cam_in][game_in];"
            f"[cam_in]crop=iw*0.28:ih*0.42:iw*0.02:ih*0.56,scale=1080:800:force_original_aspect_ratio=increase,crop=1080:800[top_cam];"
            f"[game_in]crop=iw*0.62:ih:iw*0.19:0,scale=1080:1120:force_original_aspect_ratio=increase,crop=1080:1120[bottom_game];"
            f"[top_cam][bottom_game]vstack=inputs=2[stacked];"
            f"[stacked]{sub_filter}"
        )
    elif layout == "talking_head":
        vf = (
            f"[0:v]split=2[bg][fg];"
            f"[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=15:3[bgblur];"
            f"[fg]scale=1080:-1[mainvid];"
            f"[bgblur][mainvid]overlay=(W-w)/2:(H-h)/2[stacked];"
            f"[stacked]{sub_filter}"
        )
    else:
        vf = f"[0:v]scale=-1:1920,crop=1080:1920:(iw-1080)/2:0[stacked];[stacked]{sub_filter}"

    encoder, preset = get_fastest_encoder()

    ff_cmd = [
        "ffmpeg",
        "-y",
        "-ss", start_time,
        "-to", end_time,
        "-i", master_video_path,
        "-filter_complex", vf,
        "-map", "[outv]",
        "-map", "0:a?",
        "-c:v", encoder,
        "-preset", preset,
        "-c:a", "aac",
        "-b:a", "128k",
        final_output,
    ]

    proc = subprocess.run(ff_cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"Gagal render FFmpeg part {index}: {proc.stderr or proc.stdout}")

    if os.path.exists(ass_path):
        os.remove(ass_path)

    return os.path.basename(final_output)