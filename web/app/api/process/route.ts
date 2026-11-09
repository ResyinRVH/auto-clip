import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, layout,mode = "ai",intervalMinutes = 2, maxClips, minDuration, maxDuration } = body;

    if (!url) {
      return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
    }

    const rootDir = path.resolve(process.cwd(), "..");
    const pythonExecutable = path.join(
      rootDir,
      "engine",
      ".venv",
      "Scripts",
      "python.exe"
    );
    const scriptPath = path.join(rootDir, "engine", "run_pipeline.py");
    const outputDir = path.join(process.cwd(), "public", "generated_clips");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const clipsLimit = mode === "interval"
      ? String(maxClips || 0)
      : String(maxClips || 3);
    const args = [
      scriptPath,
      "--url",
      url,
      "--layout",
      layout || "gaming",
      "--mode",
      mode,
      "--interval",
      String(intervalMinutes),
      "--clips",
      clipsLimit,
      "--min_dur",
      String(minDuration || 30),
      "--max_dur",
      String(maxDuration || 60),
      "--outdir",
      outputDir,
    ];

    return new Promise<NextResponse>((resolve) => {
      let hasResolved = false;

      const safeResolve = (response: NextResponse) => {
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
        const text = data.toString();
        console.log("[PYTHON STDOUT]:", text);
        stdoutData += text;
      });

      child.stderr.on("data", (data) => {
        const text = data.toString();
        console.error("[PYTHON STDERR]:", text);
        stderrData += text;
      });

      child.on("error", (err) => {
        console.error("[SPAWN ERROR]:", err);
        safeResolve(
          NextResponse.json(
            {
              error: "Gagal memulai subproses Python",
              details: err.message,
            },
            { status: 500 }
          )
        );
      });

      child.on("close", (code) => {
        console.log(`[PROCESS CLOSED]: Exit code ${code}`);

        if (code !== 0) {
          console.error("Python Execution Error:", stderrData || stdoutData);
          safeResolve(
            NextResponse.json(
              {
                error: "Gagal memproses pipeline Python",
                details: stderrData || stdoutData,
              },
              { status: 500 }
            )
          );
          return;
        }

        try {
          let parsed = null;
          const jsonMatches = stdoutData.match(/\{[\s\S]*\}/g);

          if (jsonMatches && jsonMatches.length > 0) {
            for (let i = jsonMatches.length - 1; i >= 0; i--) {
              try {
                parsed = JSON.parse(jsonMatches[i]);
                break;
              } catch {
              }
            }
          }

          if (!parsed) {
            const lines = stdoutData.trim().split("\n");
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim();
              if (line.startsWith("{") && line.endsWith("}")) {
                try {
                  parsed = JSON.parse(line);
                  break;
                } catch {
                }
              }
            }
          }

          if (!parsed) {
            throw new Error("Format JSON respons Python tidak ditemukan");
          }

          safeResolve(NextResponse.json(parsed));
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Parsing error";
          safeResolve(
            NextResponse.json(
              {
                error: "Gagal mem-parsing output JSON dari Python",
                details: message,
                raw: stdoutData,
              },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan server internal";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}