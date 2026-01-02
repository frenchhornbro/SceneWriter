"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { serverRequest } from "@/lib/requests"
import { Loading } from "@/components/loading"
import { ErrorPage } from "@/components/errorPage"
import { scenePreview } from "@shared/templates/scene"

export default function PlotPointDetailClientPage({
  params,
}: {
  params: { storyId: string; plotpointId: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [plotPointData, setPlotPointData] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "e") {
        e.preventDefault()
        router.push(`/stories/${params.storyId}/plotpoints/${params.plotpointId}/edit`)
      }
      else if (e.key === "Delete" || e.key === "d") {
        e.preventDefault()
        setShowDeleteDialog(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    serverRequest(`api/story/${params.storyId}/plotpoint/${params.plotpointId}`, {}, "DELETE",
      async (response) => {
        router.push(`/stories/${params.storyId}?tab=plotpoints`)
      },
      async (error) => {
        console.error("Failed to delete plot point:", error)
        setIsDeleting(false)
      }
    )
  }

  useEffect(() => {
    setIsLoading(true)
    serverRequest(`api/story/${params.storyId}/plotpoint/${params.plotpointId}`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setPlotPointData(data)
      },
      async (error) => {
        setErrorMessage(`Failed to load plot point: ${error}`)
      },
      async () => {
        setIsLoading(false)
      }
    )
  }, [])

  if (isLoading) {
    return <Loading itemDescription="plot point" />
  }

  if (errorMessage) {
    return <ErrorPage errorMessage={errorMessage} />
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/stories/${params.storyId}?tab=plotpoints`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {plotPointData.storyTitle}
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{plotPointData.title}</h1>
              <p className="text-sm text-muted-foreground">
                Created {new Date(plotPointData.createdAt).toLocaleDateString()}
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
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-surface border-border">
            <div>
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{plotPointData.description}</p>
            </div>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-lg font-semibold mb-3">Connected Characters</h2>
            {plotPointData.connectedCharacters && plotPointData.connectedCharacters.length ? (
              <div className="flex flex-wrap gap-2">
                {plotPointData.connectedCharacters.map((character: any) => (
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
              <p className="text-sm text-muted-foreground">No connected characters</p>
            )}
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-lg font-semibold mb-3">Connected Scenes</h2>
            {plotPointData.connectedScenes && plotPointData.connectedScenes.length ? (
              <div className="flex flex-wrap gap-2">
                {plotPointData.connectedScenes.map((scene: scenePreview) => (
                  <Link
                    key={JSON.stringify({id: scene.id, version: scene.version})}
                    href={`/stories/${params.storyId}/scenes/${scene.id}/version/${scene.version}`}
                    className="px-3 py-1.5 text-sm rounded-md bg-secondary-muted text-secondary border border-secondary/20 hover:border-secondary/50 transition-colors"
                  >
                    {scene.title}
                    {/* TODO: List title, chapter, AND first few words, not just title */}
                    {/* TODO: Display connected scenes and plot points in character pages */}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No connected scenes</p>
            )}
          </Card>
        </div>
      </main>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        itemType="plot point"
        itemName={plotPointData.title}
      />
    </div>
  )
}
