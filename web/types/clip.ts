export type LayoutOption = "centerPotrait" | "landscape" | "splitPotrait";
export type ClipMode = "ai" | "interval";
export type SubtitleStyleOption = "bold-yellow" | "clean-white" | "boxed-dark" | "none";

export interface ClipResult {
  title: string;
  start: string;
  end: string;
  file: string;
}