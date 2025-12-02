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
  storyId: 1,
  title: "Chapter 1: The Discovery - Draft",
  content: `The bridge of the Starship Endeavor hummed with quiet efficiency. Captain Elena Voss stood at the center, her eyes fixed on the main viewscreen where stars stretched into infinite darkness. The soft blue glow of the control panels cast angular shadows across her face, highlighting the scar that ran down her left cheek—a permanent reminder of the War of the Outer Colonies.

"Captain," Lieutenant Sarah Park called from the navigation station, her voice tight with concern. "We're picking up an anomalous energy signature. Bearing two-seven-mark-three."

Elena's jaw tightened. In all her years navigating the void, she'd learned that 'anomalous' was rarely a good sign. "Put it on screen."

The viewscreen shimmered, replacing the star field with a swirling mass of colors that shouldn't exist—purples and greens that seemed to fold in on themselves, defying the laws of physics she'd spent her career trusting.

Dr. Marcus Chen approached from the science station, his weathered face creased with fascination. "Elena, that signature... I've never seen anything like it. The energy readings are off the charts."

"Recommendations?" Elena kept her voice level, professional. The crew needed to see strength, not the unease crawling up her spine.

"We should turn back," Marcus said quietly, for her ears only. "Whatever that is, it's beyond our understanding."

Elena studied the anomaly, her mind calculating risks and possibilities. Behind her, she could feel the crew's eyes, waiting for her decision. This was why she commanded—not because she always knew the right answer, but because she was willing to make the call when no one else would.

"Take us closer," she ordered. "But keep weapons hot and engines primed. At the first sign of trouble, we jump out."

Marcus shook his head but returned to his station. Elena knew he'd follow her into hell itself—he'd proven that more times than she could count. But that didn't mean he had to like it.

As the Endeavor glided toward the swirling anomaly, Elena couldn't shake the feeling that her life was about to change forever. In the depths of space, where silence reigned supreme, she could almost hear the universe whispering secrets it had kept for millennia.

Whatever lay ahead, there was no turning back now.`,
  wordCount: 2450,
  lastEdited: "2025-03-15T14:30:00",
  linkedScene: "The Discovery",
}

const SAMPLE_STORY = {
  id: 1,
  title: "The Chronicles of Echoing Stars",
}

export default function WritingSampleDetailClientPage({
  params,
}: {
  params: { storyId: string; writingId: string }
}) {
  const router = useRouter()
  const [content, setContent] = useState(SAMPLE_WRITING.content)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // TODO: Implement actual save functionality
  const handleSave = () => {
    console.log("[v0] Saving content...")
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // TODO: Replace with actual API endpoint
      await fetch("https://example.com/api/writings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingId: params.writingId }),
      })

      router.push(`/stories/${params.storyId}`)
    } catch (error) {
      console.error("Failed to delete writing:", error)
      setIsDeleting(false)
    }
  }

  const wordCount = content.trim().split(/\s+/).length

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Link
            href={`/stories/${params.storyId}?tab=writings`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {SAMPLE_STORY.title}
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{SAMPLE_WRITING.title}</h1>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{wordCount.toLocaleString()} words</span>
                {SAMPLE_WRITING.linkedScene && (
                  <>
                    <span>•</span>
                    <span>Linked to: {SAMPLE_WRITING.linkedScene}</span>
                  </>
                )}
                <span>•</span>
                <span>Last edited: {new Date(SAMPLE_WRITING.lastEdited).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link href={`/stories/${params.storyId}/writings/${params.writingId}/edit`}>
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

        <Card className="p-8 bg-surface border-border">
          <div className="prose prose-invert prose-lg max-w-none">
            {content.split("\n\n").map((paragraph, index) => (
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
        itemType="writing"
        itemName={SAMPLE_WRITING.title}
      />
    </div>
  )
}
