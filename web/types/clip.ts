export type LayoutOption = "centerPotrait" | "landscape" | "splitPotrait";
export type ClipMode = "ai" | "interval";
export type SubtitleStyleOption = "bold-yellow" | "clean-white" | "boxed-dark" | "none";

export interface ClipResult {
  title: string;
  start: string;
  end: string;
  file: string;
  rawFile?: string;
  subtitles?: SubtitleSegment[];
  subtitleStyle?: SubtitleStyleOption;
  posX?: number;
  posY?: number;
  version?: number;
}

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export interface SubtitlePosition {
  x: number;
  y: number;
}