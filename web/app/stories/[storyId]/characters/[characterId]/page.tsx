import CharacterDetailClientPage from "./client-page";

export default async function CharacterDetailPage({ params }: { params: Promise<{ storyId: string, characterId: string }> }) {
  return (
    <CharacterDetailClientPage params={await params} />
  );
}