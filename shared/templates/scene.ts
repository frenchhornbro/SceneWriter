export type fullScene = {
  id: number;
  version: number;
  story_id: number;
  scene_text: string;
  overview?: string | null;
  scene_order: number;
  chapter_number?: number | null;
  title?: string | null;
  pov?: string | null;
  location?: string | null;
  tone?: string | null;
  additional_notes?: string | null;
  created_at: string;
  edited_at: string;
};

export type scenePreview = {
  id: number;
  version: number;
  title?: string | null;
  scene_text: string;
  chapter_number?: number | null;
  created_at: string;
  edited_at: string;
};