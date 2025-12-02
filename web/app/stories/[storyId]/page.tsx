import StoryDetailClientPage from "./client-page";

export default async function StoryDetailPage({ params }: { params: Promise<{ storyId: string }> }) {
  return (
    <StoryDetailClientPage params={await params} />
  );
}