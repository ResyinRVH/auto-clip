import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const ALLOWED_SUBTITLE_STYLES = [
  "bold-yellow",
  "clean-white",
  "boxed-dark",
  "none",
] as const;

interface IncomingSegment {
  start: number;
  end: number;
  text: string;
}

function resolveClipPath(clipsDir: string, fileName: string): string | null {
  const sanitized = path.basename(fileName);
  if (!sanitized || sanitized !== fileName) {
    return null;
  }
  const fullPath = path.resolve(clipsDir, sanitized);
  if (!fullPath.startsWith(clipsDir + path.sep)) {
    return null;
  }
  return fullPath;
}

export async function POST(req: NextRequest) {
  let tempJsonPath: string | null = null;

  try {
    const body = await req.json();
    const {
      rawFile,
      outputFile,
      subtitles = [],
      subtitleStyle = "bold-yellow",
      posX = 50,
      posY = 50,
    } = body;

    if (!rawFile || !outputFile) {
      return NextResponse.json(
        { error: "rawFile dan outputFile wajib diisi." },
        { status: 400 },
      );
    }

    const clipsDir = path.resolve(process.cwd(), "public", "generated_clips");
    const safeRawPath = resolveClipPath(clipsDir, rawFile);
    const safeOutputPath = resolveClipPath(clipsDir, outputFile);

    if (!safeRawPath || !safeOutputPath) {
      return NextResponse.json(
        { error: "Nama file tidak valid." },
        { status: 400 },
      );
    }

    if (!fs.existsSync(safeRawPath)) {
      return NextResponse.json(
        { error: "File video raw tidak ditemukan di server." },
        { status: 404 },
      );
    }

    if (!Array.isArray(subtitles)) {
      return NextResponse.json(
        { error: "Format subtitles harus berupa array." },
        { status: 400 },
      );
    }

    const sanitizedSegments: IncomingSegment[] = subtitles
      .map((item) => ({
        start: Number(item.start),
        end: Number(item.end),
        text: String(item.text ?? "").trim(),
      }))
      .filter(
        (seg) =>
          Number.isFinite(seg.start) &&
          Number.isFinite(seg.end) &&
          seg.start >= 0 &&
          seg.end > seg.start &&
          seg.text.length > 0,
      );

    const safeStyle = ALLOWED_SUBTITLE_STYLES.includes(subtitleStyle)
      ? subtitleStyle
      : "bold-yellow";

    const clampedX = Math.max(0, Math.min(100, Number(posX) || 50));
    const clampedY = Math.max(0, Math.min(100, Number(posY) || 50));
    const pixelX = Math.round((clampedX / 100) * 1080);
    const pixelY = Math.round((clampedY / 100) * 1920);

    const tempId = crypto.randomBytes(6).toString("hex");
    tempJsonPath = path.join(clipsDir, `temp_subs_${tempId}.json`);
    fs.writeFileSync(tempJsonPath, JSON.stringify(sanitizedSegments), "utf-8");

    const rootDir = path.resolve(process.cwd(), "..");
    const pythonExecutable = path.join(
      rootDir,
      "engine",
      ".venv",
      "Scripts",
      "python.exe",
    );
    const scriptPath = path.join(rootDir, "engine", "run_pipeline.py");

    const args = [
      scriptPath,
      "--rerender",
      "--raw_file",
      safeRawPath,
      "--output_file",
      safeOutputPath,
      "--subtitle_style",
      safeStyle,
      "--pos_x",
      String(pixelX),
      "--pos_y",
      String(pixelY),
      "--subtitles_json",
      tempJsonPath,
    ];

    return await new Promise<NextResponse>((resolve) => {
      let hasResolved = false;

      const safeResolve = (response: NextResponse) => {
        if (tempJsonPath && fs.existsSync(tempJsonPath)) {
          try {
            fs.unlinkSync(tempJsonPath);
          } catch {}
        }
        if (!hasResolved) {
          hasResolved = true;
          resolve(response);
        }
      };

      const child = spawn(pythonExecutable, args, {
        cwd: path.join(rootDir, "engine"),
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
        },
      });

      let stdoutData = "";
      let stderrData = "";

      child.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      child.on("error", (err) => {
        safeResolve(
          NextResponse.json(
            {
              error: "Gagal menjalankan proses re-render.",
              details: err.message,
            },
            { status: 500 },
          ),
        );
      });

      child.on("close", (code) => {
        if (code !== 0) {
          safeResolve(
            NextResponse.json(
              {
                error: "Gagal melakukan re-render subtitle.",
                details: stderrData || stdoutData,
              },
              { status: 500 },
            ),
          );
          return;
        }

        safeResolve(
          NextResponse.json({
            success: true,
            file: path.basename(safeOutputPath),
            version: Date.now(),
          }),
        );
      });
    });
  } catch (error: unknown) {
    if (tempJsonPath && fs.existsSync(tempJsonPath)) {
      try {
        fs.unlinkSync(tempJsonPath);
      } catch {}
    }
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
