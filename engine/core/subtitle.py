import os
import re

def time_to_ass_stamp(time_str: str) -> str:
    """Konversi HH:MM:SS atau detik desimal ke format ASS: H:MM:SS.cs"""
    parts = time_str.split(":")
    if len(parts) == 3:
        h, m, s = int(parts[0]), int(parts[1]), float(parts[2])
    elif len(parts) == 2:
        h, m, s = 0, int(parts[0]), float(parts[1])
    else:
        sec = float(time_str)
        h = int(sec // 3600)
        m = int((sec % 3600) // 60)
        s = sec % 60

    cs = int(round((s - int(s)) * 100))
    return f"{h}:{m:02d}:{int(s):02d}.{cs:02d}"

def seconds_to_ass_stamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    cs = int(round((s - int(s)) * 100))
    return f"{h}:{m:02d}:{int(s):02d}.{cs:02d}"


def parse_time_to_seconds(time_str: str) -> float:
    parts = time_str.split(":")
    if len(parts) == 3:
        return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    elif len(parts) == 2:
        return int(parts[0]) * 60 + float(parts[1])
    return float(time_str)


def generate_ass_subtitles(
    raw_transcript: list, start_time_str: str, end_time_str: str, output_ass_path: str
):
    """
    Menyaring dialog subtitle yang masuk dalam rentang klip,
    menghitung offset relatif ke 00:00:00, dan membuat file .ass bergaya Shorts.
    """
    clip_start = parse_time_to_seconds(start_time_str)
    clip_end = parse_time_to_seconds(end_time_str)

    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: TikTokStyle,Arial,65,&H0000FFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,1,8,4,2,60,60,540,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    dialogue_lines = []

    for item in raw_transcript:
        start_sec = getattr(item, "start", None) or (
            item.get("start") if isinstance(item, dict) else 0
        )
        dur_sec = getattr(item, "duration", None) or (
            item.get("duration") if isinstance(item, dict) else 2.5
        )
        text = getattr(item, "text", None) or (
            item.get("text") if isinstance(item, dict) else ""
        )

        text = text.replace("\n", " ").strip()
        if not text:
            continue

        item_end = start_sec + dur_sec

        if item_end > clip_start and start_sec < clip_end:
            rel_start = max(0.0, start_sec - clip_start)
            rel_end = min(clip_end - clip_start, item_end - clip_start)

            if rel_end > rel_start:
                start_stamp = seconds_to_ass_stamp(rel_start)
                end_stamp = seconds_to_ass_stamp(rel_end)
                clean_text = text.upper()
                line = f"Dialogue: 0,{start_stamp},{end_stamp},TikTokStyle,,0,0,0,,{clean_text}"
                dialogue_lines.append(line)

    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("\n".join(dialogue_lines) + "\n")
