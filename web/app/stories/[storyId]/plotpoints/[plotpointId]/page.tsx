import PlotPointDetailClientPage from "./client-page";

export default async function PlotPointDetailPage({ params }: { params: Promise<{ storyId: string, plotpointId: string }> }) {
  return (
    <PlotPointDetailClientPage params={await params} />
  );
}