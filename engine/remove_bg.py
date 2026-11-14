import argparse
import json
import sys
from core.bg_remover import remove_background

def main():
    parser = argparse.ArgumentParser(
        description="CLI tool untuk menghapus background gambar menggunakan rembg."
    )
    parser.add_argument(
        "--input",
        "-i",
        required=True,
        help="Path menuju file gambar input (.jpg, .png, .webp)",
    )
    parser.add_argument(
        "--output",
        "-o",
        required=True,
        help="Path tujuan file output (.png)",
    )
    parser.add_argument(
        "--model",
        "-m",
        default="isnet-general-use",
        help="Model rembg yang digunakan (default: isnet-general-use)",
    )
    parser.add_argument(
        "--no-alpha-matting",
        action="store_true",
        help="Nonaktifkan alpha matting untuk proses lebih cepat",
    )

    args = parser.parse_args()

    try:
        result = remove_background(
            input_path=args.input,
            output_path=args.output,
            model_name=args.model,
            use_alpha_matting=not args.no_alpha_matting,
        )
        print(json.dumps({"success": True, "data": result}))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()