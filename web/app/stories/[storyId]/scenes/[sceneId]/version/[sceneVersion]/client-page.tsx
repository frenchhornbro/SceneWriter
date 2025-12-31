"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2, MapPin, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { serverRequest } from "@/lib/requests"
import { Loading } from "@/components/loading"
import { ErrorPage } from "@/components/errorPage"

export default function SceneDetailClientPage({
  params,
}: {
  params: { storyId: string; sceneId: string; sceneVersion: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [sceneData, setSceneData] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    serverRequest(`api/story/${params.storyId}/scene/${params.sceneId}/version/${params.sceneVersion}`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setSceneData(data)
      },
      async (error) => {
        setErrorMessage(`Failed to load scene: ${error}`)
      },
      async () => {
        setIsLoading(false)
      }
    )
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    serverRequest(`api/story/${params.storyId}/scene/${params.sceneId}/version/${params.sceneVersion}`, {}, "DELETE",
      async (response) => {
        router.push(`/stories/${params.storyId}?tab=scenes`)
      },
      async (error) => {
        console.error("Failed to delete scene:", error)
        setIsDeleting(false)
      }
    )
  }

  if (isLoading) {
    return <Loading itemDescription="scene" />
  }

  if (errorMessage) {
    return <ErrorPage errorMessage={errorMessage} />
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
            Back to {sceneData.storyTitle}
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {sceneData.title && (
                  <h1 className="text-3xl font-bold">{sceneData.title}</h1>
                )}
                {sceneData.chapterNumber && (
                  <span className="text-xs px-2 py-1 rounded bg-primary-muted text-primary font-medium">
                    Chapter {sceneData.chapterNumber}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                {sceneData.pov && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>POV: {sceneData.pov}</span>
                  </div>
                )}
                {sceneData.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{sceneData.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/stories/${params.storyId}/scenes/${params.sceneId}/version/${params.sceneVersion}/edit`}>
                <Button variant="outline" className="border-border hover:bg-surface-light bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Link href={`/stories/${params.storyId}/scenes/${params.sceneId}/version/${params.sceneVersion}/regenerate`}>
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
            <h2 className="text-xl font-semibold mb-3">Scene Text</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{sceneData.sceneText}</p>
            </div>
          </Card>

          {sceneData.overview && (
            <Card className="p-6 bg-surface border-border">
              <h2 className="text-xl font-semibold mb-3">Overview</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{sceneData.overview}</p>
              </div>
            </Card>
          )}

          {sceneData.tone && (
            <Card className="p-6 bg-surface border-border">
              <h2 className="text-xl font-semibold mb-3">Tone</h2>
              <p className="text-muted-foreground">{sceneData.tone}</p>
            </Card>
          )}

          {sceneData.additionalNotes && (
            <Card className="p-6 bg-surface border-border">
              <h2 className="text-xl font-semibold mb-3">Additional Notes</h2>
              <p className="text-muted-foreground leading-relaxed">{sceneData.additionalNotes}</p>
            </Card>
          )}

          {sceneData.connectedCharacters && sceneData.connectedCharacters.length ? (
            <Card className="p-6 bg-surface border-border">
              <h2 className="text-xl font-semibold mb-4">Connected Characters</h2>
              <div className="flex flex-wrap gap-2">
                {sceneData.connectedCharacters.map((character: any, index: number) => (
                  <Link
                    key={character.id}
                    href={`/stories/${params.storyId}/characters/${character.id}`}
                  >
                    <Card className="p-4 bg-background border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{character.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-primary-muted text-primary">{character.role}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">No connected characters</p>
          )}

          {sceneData.connectedPlotPoints && sceneData.connectedPlotPoints.length ? (
            <Card className="p-6 bg-surface border-border">
              <h2 className="text-xl font-semibold mb-4">Connected Plot Points</h2>
              <div className="flex flex-wrap gap-2">
                {sceneData.connectedPlotPoints.map((plotPoint: any, index: number) => (
                  <Link
                    key={plotPoint.id}
                    href={`/stories/${params.storyId}/plotpoints/${plotPoint.id}`}
                  >
                    <Card className="p-4 bg-background border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <h3 className="font-semibold mb-1">{plotPoint.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{plotPoint.startingText}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </Card>
          ) : (
            <p className="text-sm text-muted-foreground">No connected plot points</p>
          )}
        </div>
      </main>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        itemType="scene"
        itemName={sceneData.title}
      />
    </div>
  )
}
