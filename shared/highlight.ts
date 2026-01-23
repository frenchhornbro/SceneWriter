export type SceneHighlight = {
  id: number;
  sceneId: number;
  sceneVersion: number;
  startOffset: number;
  endOffset: number;
  exactText: string;
  prefixContext: string;
  suffixContext: string;
  color: string;
  note: string | null;
  isValid: boolean;
  createdAt: string;
  editedAt: string;
};

export type CreateHighlightRequest = {
  sceneId: number;
  sceneVersion: number;
  startOffset: number;
  endOffset: number;
  exactText: string;
  prefixContext: string;
  suffixContext: string;
  color: string;
  note?: string;
};

export type UpdateHighlightRequest = {
  color?: string;
  note?: string;
  startOffset?: number;
  endOffset?: number;
  exactText?: string;
  prefixContext?: string;
  suffixContext?: string;
};

export type TextEdit = {
  id: number;
  sceneId: number;
  sceneVersion: number;
  editPosition: number;
  charsInserted: number;
  charsDeleted: number;
  createdAt: string;
};

export type HighlightSegment = {
  text: string;
  startOffset: number;
  endOffset: number;
  highlights: SceneHighlight[];
};