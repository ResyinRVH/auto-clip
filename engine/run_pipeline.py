import argparse
import json
import os
import sys
from dotenv import load_dotenv

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from core.youtube import get_video_id, get_video_duration, get_raw_transcript_data
from core.segmenter import generate_interval_segments, extract_highlights
from core.renderer import (
    download_full_video,
    render_clip_from_local,
    rerender_clip_subtitles,
)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def main():
    parser = argparse.ArgumentParser(description="AutoClip Pipeline Orchestrator")
    parser.add_argument(
        "--rerender", action="store_true", help="Mode fast re-render subtitle"
    )
    parser.add_argument("--url", default="")
    parser.add_argument("--layout", default="splitPotrait")
    parser.add_argument(
        "--subtitle_style",
        default="bold-yellow",
        choices=["bold-yellow", "clean-white", "boxed-dark", "none"],
    )
    parser.add_argument("--pos_x", type=int, default=None)
    parser.add_argument("--pos_y", type=int, default=None)
    parser.add_argument("--mode", default="ai", choices=["ai", "interval"])
    parser.add_argument("--interval", type=int, default=2)
    parser.add_argument("--clips", type=int, default=0)
    parser.add_argument("--min_dur", type=int, default=30)
    parser.add_argument("--max_dur", type=int, default=60)
    parser.add_argument("--outdir", default="")
    parser.add_argument("--raw_file", default="")
    parser.add_argument("--output_file", default="")
    parser.add_argument("--subtitles_json", default="")

    args = parser.parse_args()

    if args.rerender:
        try:
            if not args.raw_file or not args.output_file:
                raise ValueError(
                    "--raw_file dan --output_file wajib diisi pada mode --rerender."
                )

            if args.subtitles_json:
                if os.path.exists(args.subtitles_json):
                    with open(args.subtitles_json, "r", encoding="utf-8") as f:
                        segments = json.load(f)
                else:
                    segments = json.loads(args.subtitles_json)
            else:
                segments = []

            updated_file = rerender_clip_subtitles(
                raw_video_path=args.raw_file,
                output_video_path=args.output_file,
                segments=segments,
                subtitle_style=args.subtitle_style,
                pos_x=args.pos_x,
                pos_y=args.pos_y,
            )
            print(json.dumps({"success": True, "file": updated_file}))
            return
        except Exception as exc:
            print(json.dumps({"success": False, "error": str(exc)}))
            sys.exit(1)

    master_video_path = None

    try:
        if not args.url or not args.outdir:
            raise ValueError("--url dan --outdir wajib diisi.")

        os.makedirs(args.outdir, exist_ok=True)
        video_id = get_video_id(args.url)
        if not video_id:
            raise ValueError(f"URL YouTube tidak valid: {args.url}")

        clean_url = f"https://www.youtube.com/watch?v={video_id}"
        raw_transcript, transcript_text = get_raw_transcript_data(video_id)

        if args.mode == "interval":
            interval_sec = args.interval * 60
            total_duration = get_video_duration(clean_url)

            limit_clips = args.clips if args.clips > 0 else None

            clips_to_process = generate_interval_segments(
                total_duration,
                interval_seconds=interval_sec,
                max_clips=limit_clips,
            )
            if not clips_to_process:
                raise ValueError(
                    "Durasi video tidak mencukupi untuk interval yang dipilih."
                )
        else:
            if not transcript_text:
                raise ValueError(
                    "Transkrip video tidak tersedia. Tidak dapat menggunakan AI highlight."
                )

            ai_clips = args.clips if args.clips > 0 else 1
            clips_to_process = extract_highlights(
                GEMINI_API_KEY, transcript_text, ai_clips, args.min_dur, args.max_dur
            )

        master_video_path = os.path.join(args.outdir, f"temp_master_{video_id}.mp4")
        download_full_video(clean_url, master_video_path)

        results = []
        for idx, clip in enumerate(clips_to_process, 1):
            filename, raw_filename, clip_subtitles = render_clip_from_local(
                master_video_path=master_video_path,
                start_time=clip["start_time"],
                end_time=clip["end_time"],
                title=clip["title"],
                index=idx,
                layout=args.layout,
                output_dir=args.outdir,
                raw_transcript=raw_transcript,
                subtitle_style=args.subtitle_style,
                pos_x=args.pos_x,
                pos_y=args.pos_y,
            )
            results.append(
                {
                    "title": clip["title"],
                    "start": clip["start_time"],
                    "end": clip["end_time"],
                    "file": filename,
                    "rawFile": raw_filename,
                    "subtitles": clip_subtitles,
                }
            )

        if master_video_path and os.path.exists(master_video_path):
            os.remove(master_video_path)

        print(json.dumps({"success": True, "clips": results}))

    except Exception as exc:
        if master_video_path and os.path.exists(master_video_path):
            try:
                os.remove(master_video_path)
            except Exception:
                pass

        print(json.dumps({"success": False, "error": str(exc)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
