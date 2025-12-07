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
import { serverRequest } from "@/lib/requests"
import { Loading } from "@/components/loading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewPlotPointPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [allCharactersData, setAllCharactersData] = useState<any[]>([])
  const [allScenesData, setAllScenesData] = useState<any[]>([])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [connectedCharacterIds, setConnectedCharacterIds] = useState<number[]>([])
  const [connectedSceneIds, setConnectedSceneIds] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    serverRequest(`api/story/${storyId}/character`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllCharactersData(data.characters || [])
      },
      async (error) => {
        setErrorMessage(`Failed to load characters: ${error}`)
        setIsLoading(false)
      }
    )
    serverRequest(`api/story/${storyId}/scene`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllScenesData(data.scenes || [])
      },
      async (error) => {
        setErrorMessage(`Failed to load scenes: ${error}`)
        setIsLoading(false)
      }
    )
  }, [])

  useEffect(() => {
    if (allCharactersData && allScenesData) {
      setIsLoading(false)
    }
  }, [allCharactersData, allScenesData])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSubmit(undefined)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [title, description, connectedCharacterIds, connectedSceneIds, isSubmitting])
  
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!description.trim() || isSubmitting) {
      return
    }
    setIsSubmitting(true)
    serverRequest(`api/story/${storyId}/plotpoint/`, {
        title,
        description,
        connectedCharacterIds,
        connectedSceneIds,
      }, "POST",
      async (response) => {
        const data = await response.json()
        const plotPointId = data.plotPointId
        router.push(`/stories/${storyId}/plotpoints/${plotPointId}`)
      },
      async (error) => {
        console.error("Failed to update plot point:", error)
      },
      async () => {
        setIsSubmitting(false)
      }
    )
  }

  const handleConnectedCharactersChange = (characterId: string) => {
    const characterIdNum = Number(characterId)
    if (characterIdNum && !connectedCharacterIds.includes(characterIdNum)) {
      setConnectedCharacterIds([...connectedCharacterIds, characterIdNum])
    }
  }

  const removeConnectedCharacter = (characterId: number) => {
    setConnectedCharacterIds(connectedCharacterIds.filter((id) => id !== characterId))
  }

  const handleConnectedScenesChange = (sceneId: string) => {
    const sceneIdNum = Number(sceneId)
    if (sceneIdNum && !connectedSceneIds.includes(sceneIdNum)) {
      setConnectedSceneIds([...connectedSceneIds, sceneIdNum])
    }
  }

  const removeConnectedScene = (sceneId: number) => {
    setConnectedSceneIds(connectedSceneIds.filter((id) => id !== sceneId))
  }

  if (isLoading) {
    return (
      <Loading itemDescription="plot point" />
    )
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{errorMessage}</p>
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold mb-6">Add New Plot Point</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter plot point title"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-primary">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this plot point..."
                required
                rows={4}
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="connectedPlotPoints" className="text-sm font-medium">
                Connected Characters
              </Label>
              <Select onValueChange={handleConnectedCharactersChange}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select characters" />
                </SelectTrigger>
                <SelectContent>
                  {allCharactersData.filter(
                    (character: any) => !connectedCharacterIds.includes(character.id),
                  ).map((character: any) => (
                    <SelectItem key={character.id} value={character.id}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {connectedCharacterIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedCharacterIds.map((characterId) => {
                    const character = allCharactersData.find((c: any) => c.id === characterId)
                    return (
                      <div
                        key={characterId}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                      >
                        <span>{character?.name}</span>
                        <button
                          type="button"
                          onClick={() => removeConnectedCharacter(characterId)}
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

            <div className="space-y-2">
              <Label htmlFor="connectedScenes" className="text-sm font-medium">
                Connected Scenes
              </Label>
              <Select onValueChange={handleConnectedScenesChange}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select scenes" />
                </SelectTrigger>
                <SelectContent>
                  {allScenesData.filter(
                    (scene: any) => !connectedSceneIds.includes(scene.id),
                  ).map((scene: any) => (
                    <SelectItem key={scene.id} value={scene.id}>
                      {scene.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {connectedSceneIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedSceneIds.map((sceneId) => {
                    const scene = allScenesData.find((s: any) => s.id === sceneId)
                    return (
                      <div
                        key={sceneId}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                      >
                        <span>{scene?.title}</span>
                        <button
                          type="button"
                          onClick={() => removeConnectedScene(sceneId)}
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
                {isSubmitting ? "Creating..." : "Create Plot Point"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
