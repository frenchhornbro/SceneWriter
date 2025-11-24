import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, MapPin, User } from "lucide-react"
import Link from "next/link"

// TODO: Replace with actual data fetching based on params
const SAMPLE_SCENE = {
  id: 1,
  storyId: 1,
  title: "The Discovery",
  chapter: 1,
  pov: "Captain Elena Voss",
  location: "Bridge of the Starship Endeavor",
  summary:
    "Captain Elena Voss and her crew detect an unusual energy signature emanating from an uncharted region of space. Against the advice of her cautious first officer, Elena decides to investigate, setting in motion a chain of events that will change the fate of the galaxy. The scene establishes the crew dynamics and Elena's leadership style while introducing the central mystery.",
  notes:
    "This scene should establish Elena's character - brave but not reckless, willing to take calculated risks. The crew's reactions show their respect for her despite their concerns.",
  charactersPresent: ["Captain Elena Voss", "Dr. Marcus Chen", "Lieutenant Sarah Park"],
  mood: "Tense anticipation",
}

const SAMPLE_STORY = {
  id: 1,
  title: "The Chronicles of Echoing Stars",
}

export default async function SceneDetailPage({
  params,
}: {
  params: Promise<{ storyId: string; sceneId: string }>
}) {
  const { storyId, sceneId } = await params

  // TODO: Fetch actual scene data based on sceneId

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
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs px-2 py-1 rounded bg-primary-muted text-primary font-medium">
                  Chapter {SAMPLE_SCENE.chapter}
                </span>
                <h1 className="text-3xl font-bold">{SAMPLE_SCENE.title}</h1>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>POV: {SAMPLE_SCENE.pov}</span>
                </div>
                {SAMPLE_SCENE.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{SAMPLE_SCENE.location}</span>
                  </div>
                )}
              </div>
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
            <h2 className="text-xl font-semibold mb-3">Summary</h2>
            <p className="text-muted-foreground leading-relaxed">{SAMPLE_SCENE.summary}</p>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-4">Characters Present</h2>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_SCENE.charactersPresent.map((character, index) => (
                <Badge key={index} variant="outline" className="bg-secondary-muted text-secondary border-secondary/20">
                  {character}
                </Badge>
              ))}
            </div>
          </Card>

          {SAMPLE_SCENE.mood && (
            <Card className="p-6 bg-surface border-border">
              <h2 className="text-xl font-semibold mb-3">Mood / Tone</h2>
              <p className="text-muted-foreground">{SAMPLE_SCENE.mood}</p>
            </Card>
          )}

          {SAMPLE_SCENE.notes && (
            <Card className="p-6 bg-surface border-border">
              <h2 className="text-xl font-semibold mb-3">Notes</h2>
              <p className="text-muted-foreground leading-relaxed">{SAMPLE_SCENE.notes}</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
