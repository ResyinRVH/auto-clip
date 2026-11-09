import json
from google import genai
from google.genai import types

def format_timestamp(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    return f"{h:02d}:{m:02d}:{s:02d}"

def generate_interval_segments(total_seconds: float, interval_seconds: int, max_clips: int = 0) -> list:
    segments = []
    current_start = 0.0
    clip_num = 1

    while (current_start + 10.0) < total_seconds:
        if max_clips and max_clips > 0 and clip_num > max_clips:
            break

        current_end = min(current_start + interval_seconds, total_seconds)
        if (current_end - current_start) < 15.0 and clip_num > 1:
            break

        segments.append({
            "start_time": format_timestamp(current_start),
            "end_time": format_timestamp(current_end),
            "title": f"Part_{clip_num}",
        })
        current_start = current_end
        clip_num += 1

    return segments


def extract_highlights(api_key: str, transcript_text: str, max_clips: int, min_dur: int, max_dur: int) -> list:
    if not api_key:
        raise ValueError("GEMINI_API_KEY tidak ditemukan. Pastikan sudah disetel di file .env")

    client = genai.Client(api_key=api_key)
    prompt = f"""
    Dari transkrip video berikut, temukan {max_clips} momen paling menarik/lucu/klimaks.
    Durasi setiap momen WAJIB antara {min_dur} sampai {max_dur} detik.
    Format waktu HH:MM:SS (contoh: 00:01:15).
    
    Transkrip:
    {transcript_text[:25000]}
    
    Kembalikan HANYA array JSON:
    [
      {{
        "start_time": "00:01:20",
        "end_time": "00:02:00",
        "title": "judul_singkat"
      }}
    ]
    """
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )
    return json.loads(response.text.strip())