"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2, MapPin, User, Sparkles, Highlighter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { serverRequest } from "@/lib/requests"
import { Loading } from "@/components/loading"
import { ErrorPage } from "@/components/errorPage"
import { keyIsPressed } from "@/lib/utils"
import { HighlightedText } from "@/components/highlighted-text"
import { HighlightDialog } from "@/components/highlight-dialog"
import { captureTextSelection, clearSelection } from "@/lib/highlightUtils"
import type { SceneHighlight, CreateHighlightRequest } from "@shared/highlight"
import { useToast } from "@/hooks/use-toast"

export default function SceneDetailClientPage({
  params,
}: {
  params: { storyId: string; sceneId: string; sceneVersion: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [sceneData, setSceneData] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Highlight-related state
  const [highlights, setHighlights] = useState<SceneHighlight[]>([])
  const [highlightMode, setHighlightMode] = useState(false)
  const [showHighlightDialog, setShowHighlightDialog] = useState(false)
  const [highlightDialogMode, setHighlightDialogMode] = useState<"create" | "edit">("create")
  const [selectedText, setSelectedText] = useState("")
  const [pendingHighlight, setPendingHighlight] = useState<CreateHighlightRequest | null>(null)
  const [editingHighlight, setEditingHighlight] = useState<SceneHighlight | null>(null)
  const sceneTextRef = useRef<HTMLDivElement>(null)

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

  // Load highlights
  useEffect(() => {
    if (!sceneData) return
    serverRequest(`api/story/${params.storyId}/scene/${params.sceneId}/version/${params.sceneVersion}/highlights`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setHighlights(data.highlights || [])
      },
      async (error) => {
        console.error("Failed to load highlights:", error)
      }
    )
  }, [sceneData, params.storyId, params.sceneId, params.sceneVersion])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (keyIsPressed(e, ["e"])) {
        e.preventDefault()
        router.push(`/stories/${params.storyId}/scenes/${params.sceneId}/version/${params.sceneVersion}/edit`)
      }
      else if (keyIsPressed(e, ["Delete", "d"])) {
        e.preventDefault()
        setShowDeleteDialog(true)
      }
      else if (keyIsPressed(e, ["Escape"])) {
        e.preventDefault()
        router.push(`/stories/${params.storyId}?tab=scenes`)
      }
      else if (keyIsPressed(e, ["r"])) {
        e.preventDefault()
        router.push(`/stories/${params.storyId}/scenes/${params.sceneId}/version/${params.sceneVersion}/regenerate`)
      }
      else if (keyIsPressed(e, ["p"])) {
        // Go to the previous version
        e.preventDefault()
        await serverRequest(`api/story/${params.storyId}/scene/${params.sceneId}/version/${params.sceneVersion}/previous`, {}, "GET",
          async (response) => {
            const data = await response.json()
            router.push(`/stories/${params.storyId}/scenes/${params.sceneId}/version/${data.previousVersion}`)
          },
          async (error) => {
            console.error("Failed to get previous version:", error)
          }
        )
      }
      else if (keyIsPressed(e, ["n"])) {
        // Go to the next version
        e.preventDefault()
        await serverRequest(`api/story/${params.storyId}/scene/${params.sceneId}/version/${params.sceneVersion}/next`, {}, "GET",
          async (response) => {
            const data = await response.json()
            router.push(`/stories/${params.storyId}/scenes/${params.sceneId}/version/${data.nextVersion}`)
          },
          async (error) => {
            console.error("Failed to get previous version:", error)
          }
        )
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
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

  // Highlight handlers
  const handleTextSelection = () => {
    if (!highlightMode || !sceneTextRef.current || !sceneData) return

    const highlightData = captureTextSelection(
      sceneTextRef.current,
      sceneData.sceneText,
      parseInt(params.sceneId),
      parseInt(params.sceneVersion),
      "#fef08a" // Default color, will be changed in dialog
    )

    if (highlightData) {
      setPendingHighlight(highlightData)
      setSelectedText(highlightData.exactText)
      setHighlightDialogMode("create")
      setShowHighlightDialog(true)
    }
  }

  const handleCreateHighlight = async (color: string, note: string) => {
    if (!pendingHighlight) return

    const highlightData = {
      ...pendingHighlight,
      color,
      note,
    }

    // Close dialog and clear state immediately
    setShowHighlightDialog(false)
    setPendingHighlight(null)
    clearSelection()

    serverRequest(
      `api/story/${params.storyId}/scene/${params.sceneId}/version/${params.sceneVersion}/highlights`,
      highlightData,
      "POST",
      async (response) => {
        const data = await response.json()
        setHighlights([...highlights, data.highlight])
        toast({
          title: "Highlight created",
          description: "Your highlight has been saved.",
        })
      },
      async (error) => {
        toast({
          title: "Error",
          description: `Failed to create highlight: ${error}`,
          variant: "destructive",
        })
      }
    )
  }

  const handleEditHighlight = (highlight: SceneHighlight) => {
    setEditingHighlight(highlight)
    setHighlightDialogMode("edit")
    setShowHighlightDialog(true)
  }

  const handleUpdateHighlight = async (color: string, note: string) => {
    if (!editingHighlight) return

    const highlightId = editingHighlight.id

    // Close dialog and clear state immediately
    setShowHighlightDialog(false)
    setEditingHighlight(null)

    serverRequest(
      `api/story/${params.storyId}/scene/${params.sceneId}/version/${params.sceneVersion}/highlights/${highlightId}`,
      { color, note },
      "PATCH",
      async (response) => {
        const data = await response.json()
        setHighlights(highlights.map(h => h.id === data.highlight.id ? data.highlight : h))
        toast({
          title: "Highlight updated",
          description: "Your changes have been saved.",
        })
      },
      async (error) => {
        toast({
          title: "Error",
          description: `Failed to update highlight: ${error}`,
          variant: "destructive",
        })
      }
    )
  }

  const handleDeleteHighlight = async (highlightId: number) => {
    serverRequest(
      `api/story/${params.storyId}/scene/${params.sceneId}/version/${params.sceneVersion}/highlights/${highlightId}`,
      {},
      "DELETE",
      async (response) => {
        setHighlights(highlights.filter(h => h.id !== highlightId))
        toast({
          title: "Highlight deleted",
          description: "The highlight has been removed.",
        })
      },
      async (error) => {
        toast({
          title: "Error",
          description: `Failed to delete highlight: ${error}`,
          variant: "destructive",
        })
      }
    )
  }

  // Handle text selection when in highlight mode
  useEffect(() => {
    if (!highlightMode) return

    const handleMouseUp = () => {
      setTimeout(handleTextSelection, 10)
    }

    document.addEventListener("mouseup", handleMouseUp)
    return () => document.removeEventListener("mouseup", handleMouseUp)
  }, [highlightMode, sceneData])

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
                {sceneData.version && (
                  <span className="text-xs px-2 py-1 rounded bg-secondary-muted text-secondary font-medium">
                    Version {sceneData.version}
                  </span>
                )}
                {sceneData.order && (
                  <span className="text-xs px-2 py-1 rounded bg-primary-muted text-primary font-medium">
                    Scene {sceneData.order}
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
                {sceneData.model && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    <span>Model: {sceneData.model}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setHighlightMode(!highlightMode)}
                className={`border-border ${
                  highlightMode
                    ? "bg-primary/20 text-primary border-primary"
                    : "hover:bg-secondary-muted hover:text-secondary hover:border-secondary"
                } bg-transparent`}
              >
                <Highlighter className="w-4 h-4 mr-2" />
                {highlightMode ? "Exit Highlight" : "Highlight"}
              </Button>
              <Link href={`/stories/${params.storyId}/scenes/${params.sceneId}/version/${params.sceneVersion}/edit`}>
                <Button variant="outline" className="border-border hover:bg-secondary-muted hover:text-secondary hover:border-secondary bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Link href={`/stories/${params.storyId}/scenes/${params.sceneId}/version/${params.sceneVersion}/regenerate`}>
                <Button
                  variant="outline"
                  className="border-border hover:bg-secondary-muted hover:text-secondary hover:border-secondary bg-transparent"
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Scene Text</h2>
              {highlightMode && (
                <span className="text-sm text-primary">
                  Select text to highlight
                </span>
              )}
            </div>
            <div className="prose prose-invert max-w-none" ref={sceneTextRef}>
              <HighlightedText
                sceneText={sceneData.sceneText}
                highlights={highlights}
                onHighlightEdit={handleEditHighlight}
                onHighlightDelete={handleDeleteHighlight}
              />
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

      <HighlightDialog
        open={showHighlightDialog}
        onOpenChange={setShowHighlightDialog}
        onSave={highlightDialogMode === "create" ? handleCreateHighlight : handleUpdateHighlight}
        onCancel={() => {
          clearSelection();
          setPendingHighlight(null);
          setEditingHighlight(null);
        }}
        selectedText={selectedText}
        existingHighlight={editingHighlight}
        mode={highlightDialogMode}
      />
    </div>
  )
}
