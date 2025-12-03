"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { serverRequest } from "@/lib/requests"
import { useParams, useRouter } from "next/navigation"
import { useState, type FormEvent, useEffect } from "react"

// TODO: Replace with actual data fetching
const SAMPLE_STORY = {
  id: 1,
  title: "The Chronicles of Echoing Stars",
  overview:
    "An epic space opera following a crew of misfits as they uncover ancient secrets that could reshape the galaxy.",
}

export default function EditStoryPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string

  const [title, setTitle] = useState("")
  const [overview, setOverview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // TODO: Fetch actual story data based on storyId
  useEffect(() => {
    setTitle(SAMPLE_STORY.title)
    setOverview(SAMPLE_STORY.overview)
  }, [])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (!title.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
          await fetch("https://example.com/api/stories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              storyId,
              title: title.trim(),
              overview: overview.trim(),
            }),
          })
          // Don't navigate, just save
        } catch (error) {
          console.error("Failed to update story:", error)
        } finally {
          setIsSubmitting(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [storyId, title, overview, isSubmitting])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      return
    }

    setIsSubmitting(true)
    serverRequest(`api/story/${storyId}`, {
        storyId,
        title: title.trim(),
        overview: overview.trim()
      }, "PUT",
      async (response) => {
        router.push(`/stories/${storyId}`)
      },
      async (error) => {
        console.error("Failed to update story:", error)
      },
      async () => {
        setIsSubmitting(false)
      }
    )
  }

  const handleCancel = () => {
    router.push(`/stories/${storyId}`)
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Story</h1>
          <p className="text-muted-foreground">Update your story details</p>
        </div>

        <Card className="p-6 bg-surface border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-primary">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter your story title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-background border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview" className="text-sm font-medium">
                Overview
              </Label>
              <Textarea
                id="overview"
                placeholder="Brief description of your story (optional)"
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                rows={6}
                className="bg-background border-border focus:border-primary resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="border-border hover:bg-surface bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
