"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, MapPin, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

const SAMPLE_SCENE = {
  id: 1,
  storyId: 1,
  title: "The Discovery",
  chapter: 1,
  pov: "Captain Elena Voss",
  location: "Bridge of the Starship Endeavor",
  generatedText: `The stars stretched endlessly before them, a canvas of infinite possibilities. Captain Elena Voss stood at the viewport, her reflection ghostlike against the cosmic backdrop. Behind her, the bridge hummed with quiet efficiency—the familiar symphony of a starship at work.

"Captain, we're detecting an anomaly," Lieutenant Sarah Park announced from her station, fingers dancing across holographic displays. "Energy signature unlike anything in our database."

Elena turned, her expression measured but curious. "Show me."

The main viewscreen flickered to life, revealing a pulsing distortion in the fabric of space itself. Dr. Marcus Chen moved closer, his analytical mind already racing through possibilities. "That's... fascinating. The readings suggest it's not natural."

Elena's first officer, Commander Hayes, stepped forward, his jaw set in familiar concern. "Captain, regulations suggest we report this and wait for reinforcement before—"

"Before we investigate," Elena finished with a slight smile. "I know the protocols, Commander." She studied the anomaly, weighing risk against discovery. This was why they were out here—not to play it safe, but to push humanity's understanding further into the unknown.

She straightened, decision made. "But sometimes the greatest discoveries require calculated risks. Helm, set course for that anomaly. All hands to stations. Let's see what the universe wants to show us."`,
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

export default function SceneDetailClientPage({
  params,
}: {
  params: { storyId: string; sceneId: string }
}) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await fetch("https://example.com/api/scenes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneId: params.sceneId }),
      })

      router.push(`/stories/${params.storyId}`)
    } catch (error) {
      console.error("Failed to delete scene:", error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/stories/${params.storyId}?tab=scenes`}
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
              <Link href={`/stories/${params.storyId}/scenes/${params.sceneId}/edit`}>
                <Button variant="outline" className="border-border hover:bg-surface-light bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Link href={`/stories/${params.storyId}/scenes/${params.sceneId}/regenerate`}>
                <Button
                  variant="outline"
                  className="border-border hover:bg-primary-muted hover:text-primary bg-transparent"
                >
                  Regenerate
                </Button>
              </Link>
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

        <div className="space-y-6">
          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-3">Generated Scene</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{SAMPLE_SCENE.generatedText}</p>
            </div>
          </Card>

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

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        itemType="scene"
        itemName={SAMPLE_SCENE.title}
      />
    </div>
  )
}
