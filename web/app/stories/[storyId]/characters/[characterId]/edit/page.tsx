"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, type FormEvent, useEffect } from "react"
import { serverRequest } from "@/lib/requests"

// TODO: Fetch actual characters from the story
const SAMPLE_CHARACTERS = [
  { id: 1, name: "Captain Elena Voss" },
  { id: 2, name: "Dr. Marcus Chen" },
  { id: 3, name: "Zara the Wanderer" },
]

// TODO: Replace with actual character data
const SAMPLE_CHARACTER = {
  id: 1,
  name: "Captain Elena Voss",
  age: "38",
  height: "5'9\"",
  description:
    "A seasoned spaceship captain with a troubled past. Elena lost her family in the War of the Outer Colonies, which drives her relentless pursuit of peace in the galaxy.",
  backstory: "Former military commander turned independent ship captain. Grew up on a frontier colony world.",
  relationships: ["2"], // IDs of related characters
}

export default function EditCharacterPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string
  const characterId = params.characterId as string

  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [height, setHeight] = useState("")
  const [description, setDescription] = useState("")
  const [backstory, setBackstory] = useState("")
  const [relationships, setRelationships] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // TODO: Fetch actual character data based on characterId
  useEffect(() => {
    setName(SAMPLE_CHARACTER.name)
    setAge(SAMPLE_CHARACTER.age)
    setHeight(SAMPLE_CHARACTER.height)
    setDescription(SAMPLE_CHARACTER.description)
    setBackstory(SAMPLE_CHARACTER.backstory)
    setRelationships(SAMPLE_CHARACTER.relationships)
  }, [])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (!name.trim() || isSubmitting) return

        setIsSubmitting(true)
        try {
          await fetch("https://example.com/api/characters", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              characterId,
              storyId,
              name,
              age: age || null,
              height: height || null,
              description: description || null,
              backstory: backstory || null,
              relationships,
            }),
          })
          // Don't navigate, just save
        } catch (error) {
          console.error("Failed to update character:", error)
        } finally {
          setIsSubmitting(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [characterId, storyId, name, age, height, description, backstory, relationships, isSubmitting])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert("Name is required")
      return
    }

    setIsSubmitting(true)
    serverRequest(`api/story/${storyId}/character/${characterId}`, {
        name,
        age: age || null,
        height: height || null,
        description: description || null,
        backstory: backstory || null,
        relationships
      }, "PUT",
      async (response) => {
        router.push(`/stories/${storyId}/characters/${characterId}`)
      },
      async (error) => {
        console.error("Error updating character:", error)
        alert("An error occurred while updating the character")
      },
      async () => {
        setIsSubmitting(false)
      }
    )
  }

  const handleCancel = () => {
    router.push(`/stories/${storyId}/characters/${characterId}`)
  }

  const handleRelationshipChange = (value: string) => {
    if (value && !relationships.includes(value)) {
      setRelationships([...relationships, value])
    }
  }

  const removeRelationship = (characterId: string) => {
    setRelationships(relationships.filter((id) => id !== characterId))
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href={`/stories/${storyId}/characters/${characterId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Character
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Edit Character</h1>
        </div>

        <Card className="p-6 bg-surface border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-primary">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter character name"
                required
                className="bg-surface-light border-border"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium">
                  Age
                </Label>
                <Input
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g., 32"
                  className="bg-surface-light border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="text-sm font-medium">
                  Height
                </Label>
                <Input
                  id="height"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 5'8&quot;"
                  className="bg-surface-light border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Physical appearance, personality traits..."
                rows={4}
                className="bg-surface-light border-border resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backstory" className="text-sm font-medium">
                Backstory
              </Label>
              <Textarea
                id="backstory"
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                placeholder="Character's history and background..."
                rows={4}
                className="bg-surface-light border-border resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationships" className="text-sm font-medium">
                Relationships to Existing Characters
              </Label>
              <Select onValueChange={handleRelationshipChange}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select characters" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_CHARACTERS.filter(
                    (char) => char.id.toString() !== characterId && !relationships.includes(char.id.toString()),
                  ).map((character) => (
                    <SelectItem key={character.id} value={character.id.toString()}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {relationships.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {relationships.map((charId) => {
                    const character = SAMPLE_CHARACTERS.find((c) => c.id.toString() === charId)
                    return (
                      <div
                        key={charId}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                      >
                        <span>{character?.name}</span>
                        <button
                          type="button"
                          onClick={() => removeRelationship(charId)}
                          className="hover:text-foreground"
                        >
                          ×
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
                onClick={handleCancel}
                className="flex-1 border-border hover:bg-surface-light bg-transparent"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-hover text-white"
                disabled={isSubmitting}
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
