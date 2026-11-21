import os
import re
import shutil
import subprocess
import uuid
from core.subtitle import generate_ass_subtitles, write_ass_from_segments
from core.youtube import get_ytdlp_cmd

def download_full_video(clean_url: str, output_path: str) -> str:
    """Mengunduh video master sekali saja ke storage lokal."""
    if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
        return output_path

    print("Mengunduh video master utuh sekali jalan...")
    cmd = get_ytdlp_cmd() + [
        "--no-part",
        "--force-overwrites",
        "--extractor-args",
        "youtube:player_client=android,web",
        "-f",
        "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]/best",
        "--merge-output-format",
        "mp4",
        "-o",
        output_path,
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
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "color=c=black:s=256x256:d=0.1",
            "-c:v",
            "h264_nvenc",
            "-f",
            "null",
            "-",
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
    subtitle_style: str = "bold-yellow",
    pos_x: int | None = None,
    pos_y: int | None = None,
) -> tuple[str, str, list[dict]]:
    clean_title = re.sub(r"[^a-zA-Z0-9_]", "", title)
    ass_path = os.path.join(output_dir, f"temp_sub_{index}.ass")
    raw_output = os.path.join(output_dir, f"clip_{index}_{clean_title}_raw.mp4")
    final_output = os.path.join(output_dir, f"clip_{index}_{clean_title}.mp4")

    segments = generate_ass_subtitles(
        raw_transcript,
        start_time,
        end_time,
        ass_path,
        style=subtitle_style,
        pos_x=pos_x,
        pos_y=pos_y,
    )

    has_subtitles = (
        subtitle_style != "none"
        and os.path.exists(ass_path)
        and os.path.getsize(ass_path) > 0
    )

    if layout == "splitPotrait":
        base_layout = (
            f"[0:v]split=2[cam_in][game_in];"
            f"[cam_in]crop=iw*0.28:ih*0.42:iw*0.02:ih*0.56,scale=1080:800:force_original_aspect_ratio=increase,crop=1080:800[top_cam];"
            f"[game_in]crop=iw*0.62:ih:iw*0.19:0,scale=1080:1120:force_original_aspect_ratio=increase,crop=1080:1120[bottom_game];"
            f"[top_cam][bottom_game]vstack=inputs=2[composed]"
        )
    elif layout == "landscape":
        base_layout = (
            f"[0:v]split=2[bg][fg];"
            f"[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=15:3[bgblur];"
            f"[fg]scale=1080:-1[mainvid];"
            f"[bgblur][mainvid]overlay=(W-w)/2:(H-h)/2[composed]"
        )
    elif layout == "centerPotrait":
        base_layout = (
            f"[0:v]scale=1080:1920:force_original_aspect_ratio=increase,"
            f"crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2[composed]"
        )
    else:
        base_layout = f"[0:v]scale=-1:1920,crop=1080:1920:(iw-1080)/2:0[composed]"

    ass_escaped = ass_path.replace("\\", "/").replace(":", "\\:")
    sub_filter = (
        f"subtitles='{ass_escaped}':original_size=1080x1920[outv]"
        if has_subtitles
        else "null[outv]"
    )

    vf = f"{base_layout};[composed]split=2[rawv][sub_in];[sub_in]{sub_filter}"

    encoder, preset = get_fastest_encoder()

    ff_cmd = [
        "ffmpeg",
        "-y",
        "-ss",
        start_time,
        "-to",
        end_time,
        "-i",
        master_video_path,
        "-filter_complex",
        vf,
        "-map",
        "[rawv]",
        "-map",
        "0:a?",
        "-c:v",
        encoder,
        "-preset",
        preset,
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        raw_output,
        "-map",
        "[outv]",
        "-map",
        "0:a?",
        "-c:v",
        encoder,
        "-preset",
        preset,
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        final_output,
    ]

    proc = subprocess.run(ff_cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(
            f"Gagal render FFmpeg part {index}: {proc.stderr or proc.stdout}"
        )

    if os.path.exists(ass_path):
        os.remove(ass_path)

    return os.path.basename(final_output), os.path.basename(raw_output), segments


def rerender_clip_subtitles(
    raw_video_path: str,
    output_video_path: str,
    segments: list[dict],
    subtitle_style: str = "bold-yellow",
    pos_x: int | None = None,
    pos_y: int | None = None,
) -> str:
    """
    Membakar ulang subtitle hasil edit (teks, timeframe, dan koordinat) ke atas
    video raw tanpa mengunduh ulang sumber YouTube.
    """
    if not os.path.exists(raw_video_path):
        raise FileNotFoundError(f"File video raw tidak ditemukan: {raw_video_path}")

    out_dir = os.path.dirname(os.path.abspath(output_video_path))
    os.makedirs(out_dir, exist_ok=True)

    if subtitle_style == "none" or not segments:
        shutil.copyfile(raw_video_path, output_video_path)
        return os.path.basename(output_video_path)

    temp_id = uuid.uuid4().hex[:8]
    ass_path = os.path.join(out_dir, f"temp_rerender_{temp_id}.ass")
    temp_out = os.path.join(out_dir, f"temp_out_{temp_id}.mp4")

    has_subtitles = write_ass_from_segments(
        segments=segments,
        output_ass_path=ass_path,
        style=subtitle_style,
        pos_x=pos_x,
        pos_y=pos_y,
    )

    if not has_subtitles:
        if os.path.exists(ass_path):
            os.remove(ass_path)
        shutil.copyfile(raw_video_path, output_video_path)
        return os.path.basename(output_video_path)

    ass_escaped = ass_path.replace("\\", "/").replace(":", "\\:")
    encoder, preset = get_fastest_encoder()

    ff_cmd = [
        "ffmpeg",
        "-y",
        "-i",
        raw_video_path,
        "-vf",
        f"subtitles='{ass_escaped}':original_size=1080x1920",
        "-c:v",
        encoder,
        "-preset",
        preset,
        "-c:a",
        "copy",
        temp_out,
    ]

    try:
        proc = subprocess.run(ff_cmd, capture_output=True, text=True)
        if proc.returncode != 0:
            raise RuntimeError(f"Gagal re-render FFmpeg: {proc.stderr or proc.stdout}")
        os.replace(temp_out, output_video_path)
    finally:
        if os.path.exists(ass_path):
            os.remove(ass_path)
        if os.path.exists(temp_out):
            os.remove(temp_out)

    return os.path.basename(output_video_path)