import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Users, FileText, Sparkles } from "lucide-react"
import Link from "next/link"

// TODO: Replace with actual data fetching based on params.id
const SAMPLE_STORY = {
  id: 1,
  title: "The Chronicles of Echoing Stars",
  description:
    "An epic space opera following a crew of misfits as they uncover ancient secrets that could reshape the galaxy.",
  genre: "Science Fiction",
  createdAt: "2025-01-15",
}

const SAMPLE_CHARACTERS = [
  { id: 1, name: "Captain Elena Voss", role: "Protagonist" },
  { id: 2, name: "Dr. Marcus Chen", role: "Supporting" },
  { id: 3, name: "Zara the Wanderer", role: "Antagonist" },
]

const SAMPLE_SCENES = [
  { id: 1, title: "The Discovery", chapter: 1, pov: "Captain Elena Voss" },
  { id: 2, title: "Ancient Warnings", chapter: 1, pov: "Dr. Marcus Chen" },
  { id: 3, title: "Confrontation at the Station", chapter: 2, pov: "Captain Elena Voss" },
]

const SAMPLE_WRITINGS = [
  { id: 1, title: "Chapter 1: The Discovery - Draft", wordCount: 2450 },
  { id: 2, title: "Character Study: Elena", wordCount: 890 },
]

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // TODO: Fetch actual story data based on id

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/stories"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{SAMPLE_STORY.title}</h1>
                <span className="text-xs px-2 py-1 rounded bg-secondary-muted text-secondary font-medium">
                  {SAMPLE_STORY.genre}
                </span>
              </div>
              <p className="text-muted-foreground max-w-3xl leading-relaxed">{SAMPLE_STORY.description}</p>
            </div>

            <Button variant="outline" className="border-border hover:bg-surface-light bg-transparent">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        <Tabs defaultValue="characters" className="space-y-6">
          <TabsList className="bg-surface border border-border">
            <TabsTrigger value="characters" className="data-[state=active]:bg-surface-light">
              <Users className="w-4 h-4 mr-2" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="scenes" className="data-[state=active]:bg-surface-light">
              <FileText className="w-4 h-4 mr-2" />
              Scenes
            </TabsTrigger>
            <TabsTrigger value="writings" className="data-[state=active]:bg-surface-light">
              <Sparkles className="w-4 h-4 mr-2" />
              Writings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Characters</h2>
              <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">
                Add Character
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_CHARACTERS.map((character) => (
                <Link key={character.id} href={`/stories/${id}/characters/${character.id}`}>
                  <Card className="p-4 bg-surface border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <h3 className="font-semibold mb-1">{character.name}</h3>
                    <p className="text-sm text-muted-foreground">{character.role}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scenes" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Scenes</h2>
              <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">
                Add Scene
              </Button>
            </div>

            <div className="space-y-3">
              {SAMPLE_SCENES.map((scene) => (
                <Link key={scene.id} href={`/stories/${id}/scenes/${scene.id}`}>
                  <Card className="p-4 bg-surface border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-primary-muted text-primary font-medium">
                            Ch. {scene.chapter}
                          </span>
                          <h3 className="font-semibold">{scene.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">POV: {scene.pov}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="writings" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Writing Samples</h2>
              <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">
                New Writing
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {SAMPLE_WRITINGS.map((writing) => (
                <Link key={writing.id} href={`/stories/${id}/writings/${writing.id}`}>
                  <Card className="p-4 bg-surface border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <h3 className="font-semibold mb-2">{writing.title}</h3>
                    <p className="text-sm text-muted-foreground">{writing.wordCount.toLocaleString()} words</p>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
