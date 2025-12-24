export type scenePreview = {
  id: number;
  version: number;
  title?: string | null;
  scene_text: string;
  overview?: string | null;
  chapter_number?: number | null;
  created_at: string;
  edited_at: string;
};