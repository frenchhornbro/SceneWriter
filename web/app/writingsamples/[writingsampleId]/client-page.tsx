"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"

// TODO: Replace with actual data fetching based on params
const SAMPLE_WRITING = {
  id: 1,
  title: "Elena's First Command",
  prompt: "Write a scene where your protagonist takes on a leadership role for the first time.",
  content: `The bridge of the Starship Endeavor hummed with quiet efficiency. Captain Elena Voss stood at the center, her eyes fixed on the main viewscreen where stars stretched into infinite darkness. The soft blue glow of the control panels cast angular shadows across her face, highlighting the scar that ran down her left cheek—a permanent reminder of the War of the Outer Colonies.

"Captain," Lieutenant Sarah Park called from the navigation station, her voice tight with concern. "We're picking up an anomalous energy signature. Bearing two-seven-mark-three."

Elena's jaw tightened. In all her years navigating the void, she'd learned that 'anomalous' was rarely a good sign. "Put it on screen."

The viewscreen shimmered, replacing the star field with a swirling mass of colors that shouldn't exist—purples and greens that seemed to fold in on themselves, defying the laws of physics she'd spent her career trusting.`,
  wordCount: 890,
  createdAt: "2025-03-10T14:30:00",
}

export default function WritingSampleDetailClientPage({
  params,
}: {
  params: { writingsampleId: string }
}) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // TODO: Replace with actual API endpoint
      await fetch("https://example.com/api/writingsamples", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingsampleId: params.writingsampleId }),
      })

      router.push("/writingsamples")
    } catch (error) {
      console.error("Failed to delete writing sample:", error)
      setIsDeleting(false)
    }
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
              <h1 className="text-3xl font-bold mb-2">{SAMPLE_WRITING.title}</h1>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{SAMPLE_WRITING.wordCount.toLocaleString()} words</span>
                <span>•</span>
                <span>Created: {new Date(SAMPLE_WRITING.createdAt).toLocaleDateString()}</span>
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
          <p className="text-foreground leading-relaxed">{SAMPLE_WRITING.prompt}</p>
        </Card>

        <Card className="p-8 bg-surface border-border">
          <div className="prose prose-invert prose-lg max-w-none">
            {SAMPLE_WRITING.content.split("\n\n").map((paragraph, index) => (
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
        itemName={SAMPLE_WRITING.title}
      />
    </div>
  )
}
