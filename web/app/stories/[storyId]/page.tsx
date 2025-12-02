import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Users, FileText, MapPin, Trash2, Download } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

// TODO: Replace with actual data fetching based on params.storyId
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

const SAMPLE_PLOTPOINTS = [
  {
    id: 1,
    title: "Discovery of Ancient Artifact",
    description: "The crew finds a mysterious artifact that holds the key to the ancient civilization.",
    associatedCharacters: ["Captain Elena Voss", "Dr. Marcus Chen"],
    associatedScenes: ["The Discovery"],
  },
  {
    id: 2,
    title: "Betrayal Revealed",
    description: "A trusted crew member's secret allegiance is exposed, creating tension among the team.",
    associatedCharacters: ["Zara the Wanderer"],
    associatedScenes: ["Confrontation at the Station"],
  },
]

export default function StoryDetailPage({
  params,
}: {
  params: { storyId: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "characters"
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

        // Navigate to appropriate "new" page based on active tab
        switch (activeTab) {
          case "characters":
            router.push(`/stories/${params.storyId}/characters/new`)
            break
          case "scenes":
            router.push(`/stories/${params.storyId}/scenes/new`)
            break
          case "plotpoints":
            router.push(`/stories/${params.storyId}/plotpoints/new`)
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, params.storyId, activeTab])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // TODO: Replace with actual API endpoint
      await fetch("https://example.com/api/stories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: params.storyId }),
      })

      router.push("/stories")
    } catch (error) {
      console.error("Failed to delete story:", error)
      setIsDeleting(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // TODO: Replace with actual API endpoint
      await fetch("https://example.com/api/stories/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId: params.storyId }),
      })
      console.log("Story exported successfully")
    } catch (error) {
      console.error("Failed to export story:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleTabChange = (value: string) => {
    router.push(`/stories/${params.storyId}?tab=${value}`, { scroll: false })
  }

  return (
    <div className="min-h-screen">
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

            <div className="flex gap-2">
              <Link href={`/stories/${params.storyId}/edit`}>
                <Button variant="outline" className="border-border hover:bg-surface-light bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
                className="border-border hover:bg-surface-light bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="border-border hover:bg-red-950 hover:text-red-400 hover:border-red-800 bg-transparent"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-surface border border-border">
            <TabsTrigger
              value="characters"
              className={`data-[state=active]:bg-surface-light ${
                activeTab === "characters" ? "text-white" : "text-muted-foreground"
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Characters
            </TabsTrigger>
            <TabsTrigger
              value="scenes"
              className={`data-[state=active]:bg-surface-light ${
                activeTab === "scenes" ? "text-white" : "text-muted-foreground"
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Scenes
            </TabsTrigger>
            <TabsTrigger
              value="plotpoints"
              className={`data-[state=active]:bg-surface-light ${
                activeTab === "plotpoints" ? "text-white" : "text-muted-foreground"
              }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Plot Points
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Characters</h2>
              <Link href={`/stories/${params.storyId}/characters/new`}>
                <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">
                  Add Character
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAMPLE_CHARACTERS.map((character) => (
                <Link key={character.id} href={`/stories/${params.storyId}/characters/${character.id}`}>
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
              <Link href={`/stories/${params.storyId}/scenes/new`}>
                <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">
                  Add Scene
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {SAMPLE_SCENES.map((scene) => (
                <Link key={scene.id} href={`/stories/${params.storyId}/scenes/${scene.id}`}>
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

          <TabsContent value="plotpoints" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Plot Points</h2>
              <Link href={`/stories/${params.storyId}/plotpoints/new`}>
                <Button size="sm" className="bg-primary hover:bg-primary-hover text-white">
                  Add Plot Point
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {SAMPLE_PLOTPOINTS.map((plotpoint) => (
                <Link key={plotpoint.id} href={`/stories/${params.storyId}/plotpoints/${plotpoint.id}`}>
                  <Card className="p-4 bg-surface border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <h3 className="font-semibold mb-2">{plotpoint.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{plotpoint.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        itemType="story"
        itemName={SAMPLE_STORY.title}
      />
    </div>
  )
}
