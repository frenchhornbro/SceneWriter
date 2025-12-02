"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

const SAMPLE_PLOTPOINT = {
  id: 1,
  title: "Discovery of Ancient Artifact",
  description:
    "The crew finds a mysterious artifact that holds the key to the ancient civilization. This discovery sets the entire plot in motion and reveals connections to the crew's past.",
  associatedCharacters: [
    { id: 1, name: "Captain Elena Voss" },
    { id: 2, name: "Dr. Marcus Chen" },
  ],
  associatedScenes: [
    { id: 1, title: "The Discovery" },
    { id: 2, title: "Ancient Warnings" },
  ],
  createdAt: "2025-01-20",
}

export default function PlotPointDetailPage({
  params,
}: {
  params: { storyId: string; plotpointId: string }
}) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await fetch("https://example.com/api/plotpoints", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plotpointId: params.plotpointId }),
      })

      router.push(`/stories/${params.storyId}`)
    } catch (error) {
      console.error("Failed to delete plot point:", error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href={`/stories/${params.storyId}?tab=plotpoints`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Story
        </Link>

        <div className="space-y-6">
          <Card className="p-6 bg-surface border-border">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{SAMPLE_PLOTPOINT.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(SAMPLE_PLOTPOINT.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Link href={`/stories/${params.storyId}/plotpoints/${params.plotpointId}/edit`}>
                  <Button variant="outline" size="sm" className="border-border hover:bg-surface-light bg-transparent">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                  className="border-border hover:bg-red-950 hover:text-red-400 hover:border-red-800 bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{SAMPLE_PLOTPOINT.description}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Associated Characters</h2>
                {SAMPLE_PLOTPOINT.associatedCharacters.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PLOTPOINT.associatedCharacters.map((character) => (
                      <Link
                        key={character.id}
                        href={`/stories/${params.storyId}/characters/${character.id}`}
                        className="px-3 py-1.5 text-sm rounded-md bg-primary-muted text-primary border border-primary/20 hover:border-primary/50 transition-colors"
                      >
                        {character.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No associated characters</p>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Associated Scenes</h2>
                {SAMPLE_PLOTPOINT.associatedScenes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PLOTPOINT.associatedScenes.map((scene) => (
                      <Link
                        key={scene.id}
                        href={`/stories/${params.storyId}/scenes/${scene.id}`}
                        className="px-3 py-1.5 text-sm rounded-md bg-secondary-muted text-secondary border border-secondary/20 hover:border-secondary/50 transition-colors"
                      >
                        {scene.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No associated scenes</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        itemType="plot point"
        itemName={SAMPLE_PLOTPOINT.title}
      />
    </div>
  )
}
