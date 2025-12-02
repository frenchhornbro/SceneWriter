"use client"

import type React from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

// TODO: Replace with actual data fetching
const SAMPLE_WRITING = {
  id: 1,
  title: "Elena's First Command",
  prompt: "Write a scene where your protagonist takes on a leadership role for the first time.",
  content: `The bridge of the Starship Endeavor hummed with quiet efficiency. Captain Elena Voss stood at the center, her eyes fixed on the main viewscreen where stars stretched into infinite darkness. The soft blue glow of the control panels cast angular shadows across her face, highlighting the scar that ran down her left cheek—a permanent reminder of the War of the Outer Colonies.

"Captain," Lieutenant Sarah Park called from the navigation station, her voice tight with concern. "We're picking up an anomalous energy signature. Bearing two-seven-mark-three."

Elena's jaw tightened. In all her years navigating the void, she'd learned that 'anomalous' was rarely a good sign. "Put it on screen."

The viewscreen shimmered, replacing the star field with a swirling mass of colors that shouldn't exist—purples and greens that seemed to fold in on themselves, defying the laws of physics she'd spent her career trusting.`,
}

export default function EditWritingSamplePage({
  params,
}: {
  params: { writingsampleId: string }
}) {
  const router = useRouter()
  const [title, setTitle] = useState(SAMPLE_WRITING.title)
  const [content, setContent] = useState(SAMPLE_WRITING.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (!title.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
          await fetch("https://example.com/api/writingsamples", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              writingsampleId: params.writingsampleId,
              title,
              content,
            }),
          })
          // Don't navigate, just save
        } catch (error) {
          console.error("Failed to update writing sample:", error)
        } finally {
          setIsSubmitting(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [params.writingsampleId, title, content, isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API endpoint
      await fetch("https://example.com/api/writingsamples", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          writingsampleId: params.writingsampleId,
          title,
          content,
        }),
      })

      router.push(`/writingsamples/${params.writingsampleId}`)
    } catch (error) {
      console.error("Failed to update writing sample:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href={`/writingsamples/${params.writingsampleId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Writing Sample
        </Link>

        <h1 className="text-3xl font-bold mb-8">Edit Writing Sample</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-surface border-border">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your writing a title"
                  required
                  className="bg-background border-border"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Prompt</Label>
                <Card className="p-4 bg-surface-light border-border mt-2">
                  <p className="text-foreground leading-relaxed">{SAMPLE_WRITING.prompt}</p>
                </Card>
              </div>

              <div>
                <Label htmlFor="content">Your Response</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your response to the prompt..."
                  rows={20}
                  className="bg-background border-border font-serif"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Link href={`/writingsamples/${params.writingsampleId}`}>
              <Button type="button" variant="outline" className="border-border hover:bg-surface-light bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-primary hover:bg-primary-hover text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
