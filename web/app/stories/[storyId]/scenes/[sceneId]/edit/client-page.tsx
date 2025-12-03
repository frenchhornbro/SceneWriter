"use client"

import type React from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { serverRequest } from "@/lib/requests"

const SAMPLE_SCENE = {
  id: 1,
  title: "The Discovery",
  chapter: 1,
  pov: "Captain Elena Voss",
  location: "Bridge of the Starship Endeavor",
  generatedText: `The stars stretched endlessly before them, a canvas of infinite possibilities. Captain Elena Voss stood at the viewport, her reflection ghostlike against the cosmic backdrop. Behind her, the bridge hummed with quiet efficiency—the familiar symphony of a starship at work.

"Captain, we're detecting an anomaly," Lieutenant Sarah Park announced from her station, fingers dancing across holographic displays. "Energy signature unlike anything in our database."

Elena turned, her expression measured but curious. "Show me."

The main viewscreen flickered to life, revealing a pulsing distortion in the fabric of space itself. Dr. Marcus Chen moved closer, his analytical mind already racing through possibilities. "That's... fascinating. The readings suggest it's not natural."

Elena's first officer, Commander Hayes, stepped forward, his jaw set in familiar concern. "Captain, regulations suggest we report this and wait for reinforcement before—"

"Before we investigate," Elena finished with a slight smile. "I know the protocols, Commander." She studied the anomaly, weighing risk against discovery. This was why they were out here—not to play it safe, but to push humanity's understanding further into the unknown.

She straightened, decision made. "But sometimes the greatest discoveries require calculated risks. Helm, set course for that anomaly. All hands to stations. Let's see what the universe wants to show us."`,
}

const SAMPLE_STORY = {
  id: 1,
  title: "The Chronicles of Echoing Stars",
}

export default function EditSceneClientPage({
  params,
}: {
  params: { storyId: string; sceneId: string }
}) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: SAMPLE_SCENE.title,
    chapter: SAMPLE_SCENE.chapter.toString(),
    pov: SAMPLE_SCENE.pov,
    location: SAMPLE_SCENE.location,
    generatedText: SAMPLE_SCENE.generatedText,
  })

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (isSaving) return

        setIsSaving(true)
        try {
          await fetch("https://example.com/api/scenes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sceneId: params.sceneId,
              ...formData,
              chapter: Number.parseInt(formData.chapter),
            }),
          })
          // Don't navigate, just save
        } catch (error) {
          console.error("Failed to update scene:", error)
        } finally {
          setIsSaving(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [params.sceneId, formData, isSaving])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    serverRequest(`api/story/${params.storyId}/scene/${params.sceneId}`, {
        ...formData,
        chapter: Number.parseInt(formData.chapter),
      }, "PUT",
      async (request) => {
        router.push(`/stories/${params.storyId}/scenes/${params.sceneId}`)
      },
      async (error) => {
        console.error("Failed to update scene:", error)
        setIsSaving(false)
      }
    )
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href={`/stories/${params.storyId}/scenes/${params.sceneId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scene
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Edit Scene</h1>
          <p className="text-muted-foreground">Edit the scene details for {SAMPLE_STORY.title}</p>
        </div>

        <Card className="p-6 bg-surface border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-surface-light border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter</Label>
                <Input
                  id="chapter"
                  type="number"
                  min="1"
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  className="bg-surface-light border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pov">Point of View</Label>
              <Input
                id="pov"
                value={formData.pov}
                onChange={(e) => setFormData({ ...formData, pov: e.target.value })}
                placeholder="Which character's perspective?"
                className="bg-surface-light border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where does this scene take place?"
                className="bg-surface-light border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="generatedText">Generated Scene Text</Label>
              <Textarea
                id="generatedText"
                value={formData.generatedText}
                onChange={(e) => setFormData({ ...formData, generatedText: e.target.value })}
                rows={20}
                className="bg-surface-light border-border font-mono text-sm leading-relaxed"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/stories/${params.storyId}/scenes/${params.sceneId}`)}
                className="border-border hover:bg-surface-light bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
