export type LayoutOption = "centerPotrait" | "landscape" | "splitPotrait";
export type ClipMode = "ai" | "interval";

export interface ClipResult {
  title: string;
  start: string;
  end: string;
  file: string;
}