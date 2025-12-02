import WritingSampleDetailClientPage from "./client-page";

export default async function WritingSampleDetailPage({ params }: { params: Promise<{ storyId: string, writingId: string }> }) {
  return (
    <WritingSampleDetailClientPage params={await params} />
  );
}