import os
import re

SUBTITLE_PRESETS = {
    "bold-yellow": {
        "base_font_size": 115,
        "base_outline": 9,
        "base_shadow": 4,
        "style_template": "Style: TikTokStyle,Arial,{font_size},&H0015CCFA,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,1,0,1,{outline},{shadow},5,60,60,0,1",
        "uppercase": True,
    },
    "clean-white": {
        "base_font_size": 54,
        "base_outline": 4,
        "base_shadow": 3,
        "style_template": "Style: TikTokStyle,Arial,{font_size},&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0.5,0,1,{outline},{shadow},2,60,60,380,1",
        "uppercase": False,
    },
    "boxed-dark": {
        "base_font_size": 56,
        "base_outline": 16,
        "base_shadow": 0,
        "style_template": "Style: TikTokStyle,Arial,{font_size},&H00FFFFFF,&H000000FF,&H33000000,&H33000000,-1,0,0,0,100,100,0.5,0,3,{outline},{shadow},2,60,60,420,1",
        "uppercase": True,
    },
}


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


def normalize_non_overlapping_segments(segments: list[dict]) -> list[dict]:
    """
    Mengurutkan segmen secara kronologis, membersihkan noise tag seperti [Musik],
    dan memotong waktu selesai (end) jika menabrak waktu mulai (start) segmen
    berikutnya agar subtitle tidak pernah muncul double atau bertumpuk.
    """
    cleaned = []
    for seg in segments:
        text = re.sub(r"\[[^\]]*\]", "", str(seg.get("text", "")))
        text = re.sub(r"\s+", " ", text).strip()
        start = round(max(0.0, float(seg.get("start", 0))), 2)
        end = round(float(seg.get("end", 0)), 2)
        if text and end > start:
            cleaned.append({"start": start, "end": end, "text": text})

    cleaned.sort(key=lambda item: item["start"])

    resolved = []
    for i, current in enumerate(cleaned):
        start = current["start"]
        end = current["end"]

        if i + 1 < len(cleaned):
            next_start = cleaned[i + 1]["start"]
            if end > next_start:
                end = round(max(start + 0.15, next_start - 0.02), 2)
                if end > next_start:
                    end = next_start

        if end > start:
            resolved.append(
                {
                    "start": start,
                    "end": end,
                    "text": current["text"],
                }
            )

    return resolved


def extract_clip_subtitles(
    raw_transcript: list,
    start_time_str: str,
    end_time_str: str,
) -> list[dict]:
    """
    Menyaring transkrip ke dalam rentang klip, menormalkan overlap timing,
    dan mengembalikan list segmen relatif terhadap 0.0 detik awal klip.
    """
    if not raw_transcript:
        return []

    clip_start = parse_time_to_seconds(start_time_str)
    clip_end = parse_time_to_seconds(end_time_str)
    raw_segments = []

    for item in raw_transcript:
        start_sec = getattr(item, "start", None)
        if start_sec is None and isinstance(item, dict):
            start_sec = item.get("start", 0)
        start_sec = float(start_sec or 0)

        dur_sec = getattr(item, "duration", None)
        if dur_sec is None and isinstance(item, dict):
            dur_sec = item.get("duration", 2.5)
        dur_sec = float(dur_sec or 2.5)

        text = getattr(item, "text", None)
        if text is None and isinstance(item, dict):
            text = item.get("text", "")
        text = str(text or "").replace("\n", " ").strip()

        if not text:
            continue

        item_end = start_sec + dur_sec
        if item_end > clip_start and start_sec < clip_end:
            rel_start = round(max(0.0, start_sec - clip_start), 2)
            rel_end = round(min(clip_end - clip_start, item_end - clip_start), 2)
            if rel_end > rel_start:
                raw_segments.append(
                    {
                        "start": rel_start,
                        "end": rel_end,
                        "text": text,
                    }
                )

    return normalize_non_overlapping_segments(raw_segments)


def write_ass_from_segments(
    segments: list[dict],
    output_ass_path: str,
    style: str = "bold-yellow",
    pos_x: int | None = None,
    pos_y: int | None = None,
    font_scale: float = 1.0,
) -> bool:
    """
    Menulis file .ass dari daftar segmen dengan pencegahan overlap,
    koordinat kustom (pos_x, pos_y), serta skala ukuran font dinamis (font_scale).
    """
    if style == "none" or not segments:
        return False

    normalized = normalize_non_overlapping_segments(segments)
    if not normalized:
        return False

    preset = SUBTITLE_PRESETS.get(style, SUBTITLE_PRESETS["bold-yellow"])
    safe_scale = max(0.4, min(2.5, float(font_scale or 1.0)))

    scaled_font_size = max(18, round(preset["base_font_size"] * safe_scale))
    scaled_outline = max(1, round(preset["base_outline"] * safe_scale))
    scaled_shadow = max(0, round(preset["base_shadow"] * safe_scale))

    style_line = preset["style_template"].format(
        font_size=scaled_font_size,
        outline=scaled_outline,
        shadow=scaled_shadow,
    )

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{style_line}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    pos_tag = ""
    if pos_x is not None and pos_y is not None:
        clamped_x = max(0, min(1080, int(pos_x)))
        clamped_y = max(0, min(1920, int(pos_y)))
        pos_tag = f"{{\\an5\\pos({clamped_x},{clamped_y})}}"

    dialogue_lines = []
    for seg in normalized:
        start_stamp = seconds_to_ass_stamp(seg["start"])
        end_stamp = seconds_to_ass_stamp(seg["end"])
        formatted_text = seg["text"].upper() if preset["uppercase"] else seg["text"]
        line = f"Dialogue: 0,{start_stamp},{end_stamp},TikTokStyle,,0,0,0,,{pos_tag}{formatted_text}"
        dialogue_lines.append(line)

    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("\n".join(dialogue_lines) + "\n")

    return True


def generate_ass_subtitles(
    raw_transcript: list,
    start_time_str: str,
    end_time_str: str,
    output_ass_path: str,
    style: str = "bold-yellow",
    pos_x: int | None = None,
    pos_y: int | None = None,
    font_scale: float = 1.0,
) -> list[dict]:
    """
    Menyaring dialog subtitle yang masuk dalam rentang klip, mencegah overlap,
    menulis file .ass jika style != 'none', dan mengembalikan daftar segmen relatif.
    """
    segments = extract_clip_subtitles(raw_transcript, start_time_str, end_time_str)
    if style != "none" and segments:
        write_ass_from_segments(
            segments=segments,
            output_ass_path=output_ass_path,
            style=style,
            pos_x=pos_x,
            pos_y=pos_y,
            font_scale=font_scale,
        )
    return segments
