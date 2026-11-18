"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Loader2,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function BackgroundRemover() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Format file tidak didukung. Pilih gambar JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 15MB.");
      return;
    }

    if (originalPreview) URL.revokeObjectURL(originalPreview);
    if (resultUrl) URL.revokeObjectURL(resultUrl);

    setSelectedFile(file);
    setOriginalPreview(URL.createObjectURL(file));
    setResultUrl(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal memproses gambar.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan tidak terduga."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (originalPreview) URL.revokeObjectURL(originalPreview);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setSelectedFile(null);
    setOriginalPreview(null);
    setResultUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!originalPreview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
            isDragging
              ? "border-neutral-300 bg-neutral-100"
              : "border-neutral-200 hover:border-neutral-500 bg-[#F9F9FB]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-neutral-300 flex items-center justify-center text-white">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-500">
            Upload image or drag and drop here
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Supports JPG, PNG, or WEBP (Max. 15MB)
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-300 bg-white">
            <div className="flex items-center gap-3 text-sm text-neutral-900">
              <ImageIcon className="w-5 h-5 text-neutral-900" />
              <span className="font-medium truncate max-w-[220px]">
                {selectedFile?.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-200 disabled:opacity-50 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Change image
              </button>

              {!resultUrl ? (
                <button
                  onClick={handleRemoveBackground}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-200 disabled:opacity-50 transition"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses AI...
                    </>
                  ) : (
                    <>
                      Remove background
                    </>
                  )}
                </button>
              ) : (
                <a
                  href={resultUrl}
                  download={`no-bg-${selectedFile?.name.replace(/\.[^/.]+$/, "") || "image"}.png`}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </a>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-neutral-300 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-300 text-xs font-medium text-neutral-900 uppercase tracking-wider">
                Original
              </div>
              <div className="p-4 flex items-center justify-center min-h-[320px] ">
                <img
                  src={originalPreview}
                  alt="Original preview"
                  className="max-h-[420px] w-auto object-contain rounded-lg"
                />
              </div>
            </div>


            <div className="rounded-2xl border border-neutral-300 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-300 text-xs font-medium text-neutral-900 uppercase tracking-wider">
                Result PNG (Transparent Background)
              </div>
              <div
                className="p-4 flex items-center justify-center h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
                    linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
                    linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
                  `,
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  backgroundColor: "#ffffff",
                }}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3 text-zinc-400">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    <span className="text-sm">
                      Removing background...
                    </span>
                  </div>
                ) : resultUrl ? (
                  <img
                    src={resultUrl}
                    alt="Background removed result"
                    className="max-h-[420px] w-auto object-contain rounded-lg"
                  />
                ) : (
                  <p className="text-sm text-zinc-500 text-center px-6">
                    Click button <strong className="text-neutral-900">Remove Background</strong> on the top to see the result here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}