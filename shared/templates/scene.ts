export type scenePreview = {
  id: number;
  version: number;
  title: string;
  scene_text: string;
  scene_order: number;
  overview?: string | null;
  created_at: string;
  edited_at: string;
};