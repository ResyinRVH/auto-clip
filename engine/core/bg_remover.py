import io
import os
from pathlib import Path
from PIL import Image
from rembg import new_session, remove

_session = None

def get_session(model_name: str = "isnet-general-use"):
    global _session
    if _session is None:
        _session = new_session(model_name)
    return _session

def remove_background(
    input_path: str,
    output_path: str,
    model_name: str = "isnet-general-use",
    use_alpha_matting: bool = True,
) -> dict:
    """
    Menghapus background gambar dan menyimpannya sebagai PNG transparan.
    """
    in_file = Path(input_path)
    if not in_file.exists() or not in_file.is_file():
        raise FileNotFoundError(f"File input tidak ditemukan: {input_path}")

    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)

    with open(in_file, "rb") as f:
        input_bytes = f.read()

    session = get_session(model_name)

    output_bytes = remove(
        input_bytes,
        session=session,
        alpha_matting=use_alpha_matting,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )

    result_image = Image.open(io.BytesIO(output_bytes)).convert("RGBA")
    result_image.save(out_file, format="PNG")

    return {
        "input": str(in_file.resolve()),
        "output": str(out_file.resolve()),
        "width": result_image.width,
        "height": result_image.height,
        "model": model_name,
    }