"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { serverRequest } from "@/lib/requests"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function NewStoryPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [overview, setOverview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        handleSubmit(undefined)
      }
      else if (e.key === "Escape") {
        e.preventDefault()
        router.push("/stories")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [title, subtitle, overview, isSubmitting])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!title.trim() || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    serverRequest("api/story", {
      title: title.trim(),
      subtitle: subtitle.trim(),
      overview: overview.trim()
    }, "POST",
      async (response) => {
        const data = await response.json()
        const { storyId } = data
        router.push(`/stories/${storyId}`)
      },
      async (error) => {
        console.error(`Failed to create story: ${error}`)
      },
      async () => {
        setIsSubmitting(false)
      }
    )
  }

  const handleCancel = () => {
    router.push("/stories")
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Story</h1>
          <p className="text-muted-foreground">Start a new creative project</p>
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
              <Label htmlFor="subtitle" className="text-sm font-medium">Subtitle</Label>
              <Input
                id="subtitle"
                type="text"
                placeholder="Enter your story subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
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
