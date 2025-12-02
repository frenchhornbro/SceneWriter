import EditSceneClientPage from "./client-page";

export default async function EditScenePage({ params }: { params: Promise<{ storyId: string, sceneId: string }> }) {
  return (
    <EditSceneClientPage params={await params} />
  );
}