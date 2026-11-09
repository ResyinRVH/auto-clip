# AutoClip — Intelligent Video Highlight & Vertical Clip Generator

> Transform long-form YouTube videos and live streams into engaging 9:16 vertical shorts optimized for TikTok, Reels, and Shorts using Gemini, yt-dlp, and FFmpeg.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.13-yellow?style=flat-square&logo=python)
![FFmpeg](https://img.shields.io/badge/FFmpeg-6.0-green?style=flat-square&logo=ffmpeg)
![Gemini AI](https://img.shields.io/badge/Google%20Gemini-Flash-orange?style=flat-square)

---

## ⚡ Problem & Solution

* **The Problem:** Content creators spend hours manually scrubbing through 1–3 hour live streams to find viral highlights, manually crop them into vertical formats, and type captions.
* **The Solution:** AutoClip automates the end-to-end pipeline: it extracts dialog transcripts, prompts Gemini AI with precise context to find peak moments (30–60s), crops into dual-view vertical templates (talking head + gameplay), and burns dynamic TikTok-style `.ass` captions via FFmpeg.

---

## 🛠️ Architecture & Tech Stack

```text
[ Next.js 15 Client ] 
        ↓ (POST /api/process)
[ API Route Handler ] 
        ↓ (spawn child_process)
[ Python Pipeline Engine ] 
   ├── 1. Transcript Extraction (YouTubeTranscriptApi)
   ├── 2. Semantic Moment Analysis (Gemini Flash API)
   ├── 3. Keyframe-Accurate Partial Download (yt-dlp)
   ├── 4. Dynamic Subtitle Generation (.ass format)
   └── 5. 9:16 Split/Crop Video Composition (FFmpeg)
        ↓ (Real-time JSON response)
[ Interactive Web Dashboard (Video Preview & Export) ]