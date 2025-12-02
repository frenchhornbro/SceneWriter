"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

// TODO: Replace with actual data fetching
const SAMPLE_CHARACTERS = [
  { id: 1, name: "Captain Elena Voss" },
  { id: 2, name: "Dr. Marcus Chen" },
  { id: 3, name: "Zara the Wanderer" },
]

const SAMPLE_SCENES = [
  { id: 1, title: "The Discovery" },
  { id: 2, title: "Ancient Warnings" },
  { id: 3, title: "Confrontation at the Station" },
]

const SAMPLE_PLOTPOINT = {
  id: 1,
  title: "Discovery of Ancient Artifact",
  description:
    "The crew finds a mysterious artifact that holds the key to the ancient civilization. This discovery sets the entire plot in motion and reveals connections to the crew's past.",
  characterIds: ["1", "2"],
  sceneIds: ["1", "2"],
}

export default function EditPlotPointPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string
  const plotpointId = params.plotpointId as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([])
  const [selectedScenes, setSelectedScenes] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // TODO: Fetch actual plot point data based on plotpointId
  useEffect(() => {
    setTitle(SAMPLE_PLOTPOINT.title)
    setDescription(SAMPLE_PLOTPOINT.description)
    setSelectedCharacters(SAMPLE_PLOTPOINT.characterIds)
    setSelectedScenes(SAMPLE_PLOTPOINT.sceneIds)
  }, [])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (!title.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
          await fetch("https://example.com/api/plotpoints", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plotpointId,
              storyId,
              title,
              description,
              characterIds: selectedCharacters,
              sceneIds: selectedScenes,
            }),
          })
          // Don't navigate, just save
        } catch (error) {
          console.error("Failed to update plot point:", error)
        } finally {
          setIsSubmitting(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [plotpointId, storyId, title, description, selectedCharacters, selectedScenes, isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call
      const response = await fetch("https://example.com/api/plotpoints", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plotpointId,
          storyId,
          title,
          description,
          characterIds: selectedCharacters,
          sceneIds: selectedScenes,
        }),
      })

      if (response.ok) {
        router.push(`/stories/${storyId}/plotpoints/${plotpointId}`)
      }
    } catch (error) {
      console.error("Error updating plot point:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCharacter = (characterId: string) => {
    setSelectedCharacters((prev) =>
      prev.includes(characterId) ? prev.filter((id) => id !== characterId) : [...prev, characterId],
    )
  }

  const toggleScene = (sceneId: string) => {
    setSelectedScenes((prev) => (prev.includes(sceneId) ? prev.filter((id) => id !== sceneId) : [...prev, sceneId]))
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href={`/stories/${storyId}/plotpoints/${plotpointId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plot Point
        </Link>

        <Card className="p-6 bg-surface border-border">
          <h1 className="text-2xl font-bold mb-6">Edit Plot Point</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter plot point title"
                required
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this plot point..."
                rows={4}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Associated Characters</Label>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_CHARACTERS.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => toggleCharacter(character.id.toString())}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      selectedCharacters.includes(character.id.toString())
                        ? "bg-primary text-white border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    }`}
                  >
                    {character.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Associated Scenes</Label>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => toggleScene(scene.id.toString())}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      selectedScenes.includes(scene.id.toString())
                        ? "bg-secondary text-background border-secondary"
                        : "bg-background border-border hover:border-secondary/50"
                    }`}
                  >
                    {scene.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/stories/${storyId}/plotpoints/${plotpointId}`)}
                className="flex-1 border-border hover:bg-surface-light bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex-1 bg-primary hover:bg-primary-hover text-white"
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
