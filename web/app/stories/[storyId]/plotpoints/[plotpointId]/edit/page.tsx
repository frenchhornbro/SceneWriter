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
import { ErrorPage } from "@/components/errorPage"
import { scenePreview } from "@shared/templates/scene"
import { keyIsPressed } from "@/lib/utils"

export default function EditPlotPointPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string
  const plotpointId = params.plotpointId as string
  const [loadingEndpoints, setLoadingEndpoints] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [plotPointData, setPlotPointData] = useState<any>(null)
  const [allCharactersData, setAllCharactersData] = useState<any[]>([])
  const [allScenesData, setAllScenesData] = useState<scenePreview[]>([])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [connectedCharacterIds, setConnectedCharacterIds] = useState<number[]>([])
  const [connectedScenes, setConnectedScenes] = useState<scenePreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  function addLoadingEndpoint(endpointName: string) {
    setLoadingEndpoints((prev) => new Set(prev).add(endpointName))
  }

  function removeLoadingEndpoint(endpointName: string) {
    setLoadingEndpoints((prev) => {
      const newSet = new Set(prev)
      newSet.delete(endpointName)
      return newSet
    })
  }

  useEffect(() => {
    setIsLoading(true)
    addLoadingEndpoint("plotPointData")
    addLoadingEndpoint("charactersData")
    addLoadingEndpoint("scenesData")
    serverRequest(`api/story/${storyId}/plotpoint/${plotpointId}`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setPlotPointData(data)
        setTitle(data.title || "")
        setDescription(data.description || "")
        setConnectedCharacterIds(data.connectedCharacterIds || [])
        setConnectedScenes(data.connectedScenes || [])
        removeLoadingEndpoint("plotPointData")
      },
      async (error) => {
        setErrorMessage(`Failed to load plot point: ${error}`)
        setIsLoading(false)
      }
    )
    serverRequest(`api/story/${storyId}/character`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllCharactersData(data.characters || [])
        removeLoadingEndpoint("charactersData")
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
        removeLoadingEndpoint("scenesData")
      },
      async (error) => {
        setErrorMessage(`Failed to load scenes: ${error}`)
        setIsLoading(false)
      }
    )
  }, [])

  useEffect(() => {
    if (!loadingEndpoints.size) {
      setIsLoading(false)
    }
  }, [loadingEndpoints])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (keyIsPressed(e, ["ctrl", "s"], true)) {
        e.preventDefault()
        handleSubmit(undefined, false)
      }
      else if (keyIsPressed(e, ["ctrl", "Enter"], true)) {
        e.preventDefault()
        handleSubmit(undefined)
      }
      else if (keyIsPressed(e, ["Escape"])) {
        e.preventDefault()
        router.push(`/stories/${params.storyId}/plotpoints/${params.plotpointId}`)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [title, description, connectedCharacterIds, connectedScenes, isSubmitting])

  async function handleSubmit(e?: React.FormEvent, doRedirect = true) {
    e?.preventDefault()
    if (!description.trim() || isSubmitting) {
      return
    }
    setIsSubmitting(true)
    serverRequest(`api/story/${storyId}/plotpoint/${plotpointId}`, {
        title: title || "Untitled",
        description,
        connectedCharacterIds,
        connectedScenes,
      }, "PUT",
      async (response) => {
        if (doRedirect) {
          router.push(`/stories/${storyId}/plotpoints/${plotpointId}`)
        }
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

  const handleConnectedScenesChange = (scene: scenePreview) => {
    const sceneIdNum = Number(scene.id)
    const versionNum = Number(scene.version)
    if (sceneIdNum && !connectedScenes.some((cs: scenePreview) => cs.id === sceneIdNum && cs.version === versionNum)) {
      setConnectedScenes([...connectedScenes, scene])
    }
  }

  const removeConnectedScene = (scene: scenePreview) => {
    const sceneIdNum = Number(scene.id)
    const versionNum = Number(scene.version)
    setConnectedScenes(connectedScenes.filter((cs: scenePreview) => cs.id !== sceneIdNum || cs.version !== versionNum))
  }

  if (isLoading) {
    return <Loading itemDescription="plot point" />
  }

  if (errorMessage) {
    return <ErrorPage errorMessage={errorMessage} />
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

              {connectedCharacterIds?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedCharacterIds?.map((characterId) => {
                    const character = allCharactersData?.find((c: any) => c.id === characterId)
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
              <Select onValueChange={(e) => handleConnectedScenesChange(JSON.parse(e))}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select scenes" />
                </SelectTrigger>
                <SelectContent>
                  {allScenesData?.filter((scene: scenePreview) => !connectedScenes?.some((cs: scenePreview) => cs.id === scene.id && cs.version === scene.version))
                    ?.map((scene: scenePreview) => (
                    <SelectItem key={JSON.stringify(scene)} value={JSON.stringify(scene)}>
                      {scene.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {connectedScenes?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedScenes?.map((cs: scenePreview) => {
                    const sceneData = allScenesData.find((s: scenePreview) => s.id === cs.id && s.version === cs.version)
                    return (
                      <div
                        key={JSON.stringify(cs)}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                      >
                        <span>{sceneData?.title}</span>
                        <button
                          type="button"
                          onClick={() => removeConnectedScene(cs)}
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
