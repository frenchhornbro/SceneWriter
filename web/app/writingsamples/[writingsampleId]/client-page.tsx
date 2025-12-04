"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { serverRequest } from "@/lib/requests"

export default function WritingSampleDetailClientPage({
  params,
}: {
  params: { writingsampleId: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [writingStyleData, setWritingStyleData] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    serverRequest(`api/writingstyle/${1}`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setWritingStyleData(data)
      },
      async (error) => {
        setErrorMessage(`Failed to load writing sample: ${error}`)
      },
      async () => {
        setIsLoading(false)
      }
    )
  }, [])

  const handleDelete = async () => {
    setIsDeleting(true)
    serverRequest(`api/writingstyle/${params.writingsampleId}`, {}, "DELETE",
      async (response) => {
        router.push("/writingsamples")
      },
      async (error) => {
        console.error("Failed to delete writing sample:", error)
        setIsDeleting(false)
      }
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground text-lg">Loading writing sample...</p>
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
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Link
            href="/writingsamples"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Writing Samples
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{writingStyleData.title}</h1>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{writingStyleData.wordCount.toLocaleString()} words</span>
                <span>•</span>
                <span>Created: {new Date(writingStyleData.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/writingsamples/${params.writingsampleId}/edit`}>
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

        <Card className="p-6 bg-surface-light border-border mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Prompt</h2>
          <p className="text-foreground leading-relaxed">{writingStyleData.prompt}</p>
        </Card>

        <Card className="p-8 bg-surface border-border">
          <div className="prose prose-invert prose-lg max-w-none">
            {writingStyleData.content.split("\n").map((paragraph: any, index: number) => (
              <p key={index} className="mb-6 text-foreground font-serif text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>
      </main>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        itemType="writing sample"
        itemName={writingStyleData.title}
      />
    </div>
  )
}
