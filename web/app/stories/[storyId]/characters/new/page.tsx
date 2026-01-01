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
import { useState, useEffect } from "react"
import { serverRequest } from "@/lib/requests"
import { Loading } from "@/components/loading"
import { ErrorPage } from "@/components/errorPage"
import { scenePreview } from "@shared/templates/scene"

export default function NewCharacterPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string
  const [loadingEndpoints, setLoadingEndpoints] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [allCharactersData, setAllCharactersData] = useState<any>([])
  const [allPlotPointsData, setAllPlotPointsData] = useState<any>([])
  const [allScenesData, setAllScenesData] = useState<scenePreview[]>([])

  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [physicalDescription, setPhysicalDescription] = useState("")
  const [personality, setPersonality] = useState("")
  const [backstory, setBackstory] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [relationships, setRelationships] = useState<any>([])
  const [connectedPlotPointIds, setConnectedPlotPointsIds] = useState<number[]>([])
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
    addLoadingEndpoint("charactersData")
    addLoadingEndpoint("plotPointsData")
    addLoadingEndpoint("scenesData")
    serverRequest(`api/story/${storyId}/character`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllCharactersData(data.characters)
        removeLoadingEndpoint("charactersData")
      },
      async (error) => {
        setErrorMessage(`Failed to load characters for relationships: ${error}`)
        setIsLoading(false)
      }
    )
    serverRequest(`api/story/${storyId}/plotpoint`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllPlotPointsData(data.plotPoints)
        removeLoadingEndpoint("plotPointsData")
      },
      async (error) => {
        setErrorMessage(`Failed to load plot points for connections: ${error}`)
        setIsLoading(false)
      }
    )
    serverRequest(`api/story/${storyId}/scene`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllScenesData(data.scenes)
        removeLoadingEndpoint("scenesData")
      },
      async (error) => {
        setErrorMessage(`Failed to load scenes for connections: ${error}`)
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
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        handleSubmit(undefined)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [name, role, physicalDescription, personality, backstory, additionalNotes, relationships, connectedPlotPointIds, connectedScenes, isSubmitting])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!name.trim() || isSubmitting) {
      return
    }
    setIsSubmitting(true)
    await serverRequest(`api/story/${storyId}/character/`, {
      name: name.trim(),
      role: role.trim(),
      physicalDescription: physicalDescription.trim(),
      personality: personality.trim(),
      backstory: backstory.trim(),
      additionalNotes: additionalNotes.trim(),
      relationships,
      connectedPlotPointIds,
      connectedScenes
    }, "POST",
      async (response) => {
        const data = await response.json()
        const characterId = data.characterId
        router.push(`/stories/${storyId}/characters/${characterId}`)
      },
      async (error) => {
        console.error("Failed to update character: ", error)
        alert(`Failed to update character: ${error}`)
      },
      async () => {
        setIsSubmitting(false)
      }
    )
  }

  const handleCancel = () => {
    router.push(`/stories/${storyId}?tab=characters`)
  }

  const handleRelationshipChange = (characterId: string) => {
    const characterIdNum = Number(characterId)
    if (characterIdNum && !relationships.some((character: any) => character.id === characterIdNum)) {
      setRelationships([...relationships, {
        id: characterIdNum,
        description: "" //TODO: Allow user to set role
      }])
    }
  }

  const removeRelationship = (characterId: number) => {
    setRelationships(relationships.filter((character: any) => character.id !== characterId))
  }

  const handleConnectedPlotPointsChange = (plotPointId: string) => {
    const plotPointIdNum = Number(plotPointId)
    if (plotPointIdNum && !connectedPlotPointIds.includes(plotPointIdNum)) {
      setConnectedPlotPointsIds([...connectedPlotPointIds, plotPointIdNum])
    }
  }

  const removeConnectedPlotPoint = (plotPointId: number) => {
    setConnectedPlotPointsIds(connectedPlotPointIds.filter((id) => id !== plotPointId))
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
    return <Loading />
  }

  if (errorMessage) {
    return <ErrorPage errorMessage={errorMessage} />
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href={`/stories/${storyId}?tab=characters`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Story
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Add New Character</h1>
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

            <div className="space-y-2">
              <Label htmlFor="physicalDescription" className="text-sm font-medium">
                Physical Description
              </Label>
              <Textarea
                id="physicalDescription"
                value={physicalDescription}
                onChange={(e) => setPhysicalDescription(e.target.value)}
                placeholder="Character's physical appearance..."
                rows={4}
                className="bg-surface-light border-border resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality" className="text-sm font-medium">
                Personality
              </Label>
              <Textarea
                id="personality"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Character's personality traits..."
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
              <Label htmlFor="additionalNotes" className="text-sm font-medium">
                Additional Notes
              </Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Additional notes on this character..."
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
                  {allCharactersData.filter(
                    (char: any) => !relationships.some((character: any) => character.id === char.id),
                  ).map((character: any) => (
                    <SelectItem key={character.id} value={character.id}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {relationships.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {relationships.map((characterData: any) => {
                    const character = allCharactersData.find((c: any) => c.id === characterData.id)
                    return (
                      <div
                        key={characterData.id}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                      >
                        <span>{character?.name}</span>
                        <button
                          type="button"
                          onClick={() => removeRelationship(characterData.id)}
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
              <Label htmlFor="connectedPlotPoints" className="text-sm font-medium">
                Connected Plot Points
              </Label>
              <Select onValueChange={handleConnectedPlotPointsChange}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select plot points" />
                </SelectTrigger>
                <SelectContent>
                  {allPlotPointsData.filter(
                    (plotPoint: any) => !connectedPlotPointIds.includes(plotPoint.id),
                  ).map((plotPoint: any) => (
                    <SelectItem key={plotPoint.id} value={plotPoint.id}>
                      {plotPoint.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {connectedPlotPointIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedPlotPointIds.map((plotPointId) => {
                    const plotPoint = allPlotPointsData.find((p: any) => p.id === plotPointId)
                    return (
                      <div
                        key={plotPointId}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                      >
                        <span>{plotPoint?.title}</span>
                        <button
                          type="button"
                          onClick={() => removeConnectedPlotPoint(plotPointId)}
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
                  {allScenesData.filter((scene: scenePreview) => !connectedScenes.some((cs: scenePreview) => cs.id === scene.id && cs.version === scene.version))
                    .map((scene: scenePreview) => (
                    <SelectItem key={JSON.stringify(scene)} value={JSON.stringify(scene)}>
                      {scene.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {connectedScenes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedScenes.map((cs: scenePreview) => {
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
                {isSubmitting ? "Creating..." : "Create Character"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
