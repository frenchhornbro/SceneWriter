import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

// TODO: Replace with actual data fetching based on params
const SAMPLE_CHARACTER = {
  id: 1,
  storyId: 1,
  name: "Captain Elena Voss",
  role: "Protagonist",
  age: 38,
  description:
    "A seasoned spaceship captain with a troubled past. Elena lost her family in the War of the Outer Colonies, which drives her relentless pursuit of peace in the galaxy. Despite her hardened exterior, she possesses a deep compassion for her crew and those who cannot defend themselves.",
  physicalDescription:
    "Tall and athletic, with short silver hair and piercing blue eyes. A jagged scar runs across her left cheek from an old battle wound.",
  personality:
    "Stoic, tactical, and fiercely loyal. Elena rarely shows emotion but has a dry sense of humor that surfaces in tense situations.",
  background: "Former military commander turned independent ship captain. Grew up on a frontier colony world.",
  relationships: [
    {
      name: "Dr. Marcus Chen",
      type: "Close Friend",
      description: "Elena trusts Marcus completely and relies on his counsel.",
    },
    {
      name: "Zara the Wanderer",
      type: "Rival",
      description: "Their paths have crossed multiple times, always ending in stalemate.",
    },
  ],
}

const SAMPLE_STORY = {
  id: 1,
  title: "The Chronicles of Echoing Stars",
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ storyId: string; characterId: string }>
}) {
  const { storyId, characterId } = await params

  // TODO: Fetch actual character data based on characterId

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/stories/${storyId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {SAMPLE_STORY.title}
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{SAMPLE_CHARACTER.name}</h1>
                <span className="text-xs px-2 py-1 rounded bg-secondary-muted text-secondary font-medium">
                  {SAMPLE_CHARACTER.role}
                </span>
              </div>
              {SAMPLE_CHARACTER.age && <p className="text-muted-foreground">Age: {SAMPLE_CHARACTER.age}</p>}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="border-border hover:bg-surface-light bg-transparent">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="border-border hover:bg-red-950 hover:text-red-400 hover:border-red-800 bg-transparent"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{SAMPLE_CHARACTER.description}</p>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-3">Physical Appearance</h2>
            <p className="text-muted-foreground leading-relaxed">{SAMPLE_CHARACTER.physicalDescription}</p>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-3">Personality</h2>
            <p className="text-muted-foreground leading-relaxed">{SAMPLE_CHARACTER.personality}</p>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-3">Background</h2>
            <p className="text-muted-foreground leading-relaxed">{SAMPLE_CHARACTER.background}</p>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-4">Relationships</h2>
            <div className="space-y-4">
              {SAMPLE_CHARACTER.relationships.map((rel, index) => (
                <div key={index} className="p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{rel.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary-muted text-primary">{rel.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rel.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
