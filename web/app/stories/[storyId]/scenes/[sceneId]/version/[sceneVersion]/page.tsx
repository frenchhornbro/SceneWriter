import SceneDetailClientPage from "./client-page";

export default async function SceneDetailPage({ params }: { params: Promise<{ storyId: string, sceneId: string, sceneVersion: string }> }) {
  return (
    <SceneDetailClientPage params={await params} />
  );
}