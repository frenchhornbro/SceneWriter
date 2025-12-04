"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { serverRequest } from "@/lib/requests"

export default function CharacterDetailClientPage({
  params,
}: {
  params: { storyId: string; characterId: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [characterData, setCharacterData] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    serverRequest(`api/story/${params.storyId}/character/${params.characterId}`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setCharacterData(data)
      },
      async (error) => {
        setErrorMessage(`Failed to load character\n${error}`)
      },
      async () => {
        setIsLoading(false)
      }
    )
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    serverRequest(`api/story/${params.storyId}/character/${params.characterId}`, {}, "DELETE",
      async (response) => {
        router.push(`/stories/${params.storyId}`)
      },
      async (error) => {
        console.error("Failed to delete character:", error)
        setIsDeleting(false)
      }
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground text-lg">Loading character...</p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{errorMessage}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href={`/stories/${params.storyId}?tab=characters`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {characterData.storyTitle}
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{characterData.name}</h1>
                <span className="text-xs px-2 py-1 rounded bg-secondary-muted text-secondary font-medium">
                  {characterData.role}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/stories/${params.storyId}/characters/${params.characterId}/edit`}>
                <Button variant="outline" className="border-border hover:bg-surface-light bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
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
            <h2 className="text-xl font-semibold mb-3">Physical Appearance</h2>
            <p className="text-muted-foreground leading-relaxed">{characterData.physicalDescription}</p>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-3">Personality</h2>
            <p className="text-muted-foreground leading-relaxed">{characterData.personality}</p>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-3">Background</h2>
            <p className="text-muted-foreground leading-relaxed">{characterData.backstory}</p>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-3">Additional Notes</h2>
            <p className="text-muted-foreground leading-relaxed">{characterData.additionalNotes}</p>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h2 className="text-xl font-semibold mb-4">Relationships</h2>
            <div className="space-y-4">
              {characterData.relationships.map((rel: any, index: any) => (
                <div key={index} className="p-4 rounded-lg bg-background border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{rel.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary-muted text-primary">{rel.role}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{rel.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        itemType="character"
        itemName={characterData.name}
      />
    </div>
  )
}
