import EditWritingSampleClientPage from "./client-page";

export default async function EditWritingSamplePage({ params }: { params: Promise<{ writingsampleId: string }> }) {
  return (
    <EditWritingSampleClientPage params={await params} />
  );
}