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
from core.renderer import download_full_video, render_clip_from_local

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def main():
    parser = argparse.ArgumentParser(description="AutoClip Pipeline Orchestrator")
    parser.add_argument("--url", required=True)
    parser.add_argument("--layout", default="gaming")
    parser.add_argument("--mode", default="ai", choices=["ai", "interval"])
    parser.add_argument("--interval", type=int, default=2)
    parser.add_argument("--clips", type=int, default=0)
    parser.add_argument("--min_dur", type=int, default=30)
    parser.add_argument("--max_dur", type=int, default=60)
    parser.add_argument("--outdir", required=True)
    args = parser.parse_args()

    master_video_path = None

    try:
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
                raise ValueError("Durasi video tidak mencukupi untuk interval yang dipilih.")
        else:
            if not transcript_text:
                raise ValueError("Transkrip video tidak tersedia. Tidak dapat menggunakan AI highlight.")
            
            ai_clips = args.clips if args.clips > 0 else 1
            clips_to_process = extract_highlights(
                GEMINI_API_KEY, transcript_text, ai_clips, args.min_dur, args.max_dur
            )

        master_video_path = os.path.join(args.outdir, f"temp_master_{video_id}.mp4")
        download_full_video(clean_url, master_video_path)

        results = []
        for idx, clip in enumerate(clips_to_process, 1):
            filename = render_clip_from_local(
                master_video_path=master_video_path,
                start_time=clip["start_time"],
                end_time=clip["end_time"],
                title=clip["title"],
                index=idx,
                layout=args.layout,
                output_dir=args.outdir,
                raw_transcript=raw_transcript,
            )
            results.append({
                "title": clip["title"],
                "start": clip["start_time"],
                "end": clip["end_time"],
                "file": filename,
            })

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