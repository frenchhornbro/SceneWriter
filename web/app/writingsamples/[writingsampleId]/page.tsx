import WritingSampleDetailClientPage from "./client-page";

export default async function WritingSampleDetailPage({ params }: { params: Promise<{ writingsampleId: string }> }) {
  return (
    <WritingSampleDetailClientPage params={await params} />
  );
}