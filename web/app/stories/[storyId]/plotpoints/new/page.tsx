"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { serverRequest } from "@/lib/requests"

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

export default function NewPlotPointPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([])
  const [selectedScenes, setSelectedScenes] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addCharacter = (value: string) => {
    const id = Number.parseInt(value)
    if (!selectedCharacters.includes(id)) {
      setSelectedCharacters([...selectedCharacters, id])
    }
  }

  const removeCharacter = (id: number) => {
    setSelectedCharacters(selectedCharacters.filter((cId) => cId !== id))
  }

  const addScene = (value: string) => {
    const id = Number.parseInt(value)
    if (!selectedScenes.includes(id)) {
      setSelectedScenes([...selectedScenes, id])
    }
  }

  const removeScene = (id: number) => {
    setSelectedScenes(selectedScenes.filter((sId) => sId !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    serverRequest("api/plotpoint", {
          storyId,
          title,
          description,
          characterIds: selectedCharacters,
          sceneIds: selectedScenes,
        }, "POST",
      async (response) => {
        router.push(`/stories/${storyId}?tab=plotpoints`)
      },
      async (error) => {
        console.error("Failed to create plot point:", error)
        alert("An error occurred while creating the plot point")
      },
      async () => {
        setIsSubmitting(false)
      }
    )
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        router.push(`/stories/${storyId}/plotpoints/new`)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, storyId])

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href={`/stories/${storyId}?tab=plotpoints`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Story
        </Link>

        <Card className="p-6 bg-surface border-border">
          <h1 className="text-2xl font-bold mb-6">Add Plot Point</h1>

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
              <Select onValueChange={addCharacter}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select characters" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_CHARACTERS.filter((c) => !selectedCharacters.includes(c.id)).map((character) => (
                    <SelectItem key={character.id} value={character.id.toString()}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCharacters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCharacters.map((cId) => {
                    const character = SAMPLE_CHARACTERS.find((c) => c.id === cId)
                    return (
                      <div
                        key={cId}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        <span>{character?.name}</span>
                        <button
                          type="button"
                          onClick={() => removeCharacter(cId)}
                          className="hover:text-foreground cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Associated Scenes</Label>
              <Select onValueChange={addScene}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select scenes" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_SCENES.filter((s) => !selectedScenes.includes(s.id)).map((scene) => (
                    <SelectItem key={scene.id} value={scene.id.toString()}>
                      {scene.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedScenes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedScenes.map((sId) => {
                    const scene = SAMPLE_SCENES.find((s) => s.id === sId)
                    return (
                      <div
                        key={sId}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                      >
                        <span>{scene?.title}</span>
                        <button
                          type="button"
                          onClick={() => removeScene(sId)}
                          className="hover:text-foreground cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/stories/${storyId}?tab=plotpoints`)}
                className="flex-1 border-border hover:bg-surface-light bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex-1 bg-primary hover:bg-primary-hover text-white"
              >
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
