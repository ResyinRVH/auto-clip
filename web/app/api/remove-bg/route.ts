import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  let tempInputPath = "";
  let tempOutputPath = "";

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File gambar tidak ditemukan." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar (maksimal 15MB)." },
        { status: 400 }
      );
    }

    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.name) || ".png";
    tempInputPath = path.join(os.tmpdir(), `bg-in-${uniqueId}${ext}`);
    tempOutputPath = path.join(os.tmpdir(), `bg-out-${uniqueId}.png`);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(tempInputPath, Buffer.from(arrayBuffer));

    const engineDir = path.resolve(process.cwd(), "..", "engine");
    const pythonExecutable =
      process.platform === "win32"
        ? path.join(engineDir, ".venv", "Scripts", "python.exe")
        : path.join(engineDir, ".venv", "bin", "python");
    const scriptPath = path.join(engineDir, "remove_bg.py");

    await new Promise<void>((resolve, reject) => {
      const pyProcess = spawn(
        pythonExecutable,
        [scriptPath, "--input", tempInputPath, "--output", tempOutputPath],
        { cwd: engineDir }
      );

      let stderrData = "";

      pyProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      pyProcess.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(
              stderrData || `Proses Python berhenti dengan kode keluar ${code}`
            )
          );
        }
      });

      pyProcess.on("error", (err) => {
        reject(err);
      });
    });

    const outputBuffer = await fs.readFile(tempOutputPath);

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="removed-bg-${uniqueId.slice(0, 8)}.png"`,
      },
    });
  } catch (error: unknown) {
    console.error("Remove BG API Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menghapus background.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (tempInputPath) {
      await fs.unlink(tempInputPath).catch(() => {});
    }
    if (tempOutputPath) {
      await fs.unlink(tempOutputPath).catch(() => {});
    }
  }
}