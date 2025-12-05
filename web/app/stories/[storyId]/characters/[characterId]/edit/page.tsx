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

export default function EditCharacterPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string
  const characterId = params.characterId as string
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [characterData, setCharacterData] = useState<any>(null)
  const [allCharactersData, setAllCharactersData] = useState<any>([])
  const [allPlotPointsData, setAllPlotPointsData] = useState<any>([])
  const [allScenesData, setAllScenesData] = useState<any>([])

  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [physicalDescription, setPhysicalDescription] = useState("")
  const [personality, setPersonality] = useState("")
  const [backstory, setBackstory] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [relationships, setRelationships] = useState<string[]>([])
  const [connectedPlotPoints, setConnectedPlotPoints] = useState<string[]>([])
  const [connectedScenes, setConnectedScenes] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    serverRequest(`api/story/${storyId}/character/${characterId}`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setCharacterData(data)
        setName(data.name)
        setRole(data.role || "")
        setPhysicalDescription(data.physicalDescription || "")
        setPersonality(data.personality || "")
        setBackstory(data.backstory || "")
        setAdditionalNotes(data.additionalNotes || "")
        setRelationships(data.relationships ? data.relationships.map((rel: any) => rel.id.toString()) : [])
        setConnectedPlotPoints(data.connectedPlotPoints ? data.connectedPlotPoints.map((pp: any) => pp.id.toString()) : [])
        setConnectedScenes(data.connectedScenes ? data.connectedScenes.map((scene: any) => scene.id.toString()) : [])
      },
      async (error) => {
        setErrorMessage(`Failed to load character: ${error}`)
      }
    )
    serverRequest(`api/story/${storyId}/character`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllCharactersData(data.characters)
      },
      async (error) => {
        console.error(`Failed to load characters for relationships: ${error}`)
      }
    )
    serverRequest(`api/story/${storyId}/plotpoint`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllPlotPointsData(data.plotPoints)
      },
      async (error) => {
        console.error(`Failed to load plot points for connections: ${error}`)
      }
    )
    serverRequest(`api/story/${storyId}/scene`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllScenesData(data.scenes)
      },
      async (error) => {
        console.error(`Failed to load scenes for connections: ${error}`)
      }
    )
  }, [])

  useEffect(() => {
    if (characterData && allCharactersData && allPlotPointsData && allScenesData) {
      setIsLoading(false)
    }
  }, [characterData, allCharactersData, allPlotPointsData, allScenesData])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSubmit(undefined, false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [name, role, physicalDescription, personality, backstory, additionalNotes, relationships, connectedPlotPoints, connectedScenes, isSubmitting])

  async function handleSubmit(e?: React.FormEvent, doRedirect = true) {
    e?.preventDefault()
    if (!name.trim() || isSubmitting) {
      return
    }
    setIsSubmitting(true)
    await serverRequest(`api/story/${storyId}/character/${characterId}`, {
      name: name.trim(),
      role: role.trim(),
      physicalDescription: physicalDescription.trim(),
      personality: personality.trim(),
      backstory: backstory.trim(),
      additionalNotes: additionalNotes.trim(),
      relationships,
      connectedPlotPoints,
      connectedScenes
    }, "PUT",
      async (response) => {
        if (doRedirect) {
          router.push(`/stories/${storyId}/characters/${characterId}`)
        }
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

  const handleConnectedPlotPointsChange = (value: string) => {
    if (value && !connectedPlotPoints.includes(value)) {
      setConnectedPlotPoints([...connectedPlotPoints, value])
    }
  }

  const removeConnectedPlotPoint = (plotPointId: string) => {
    setConnectedPlotPoints(connectedPlotPoints.filter((id) => id !== plotPointId))
  }

  const handleConnectedScenesChange = (value: string) => {
    if (value && !connectedScenes.includes(value)) {
      setConnectedScenes([...connectedScenes, value])
    }
  }

  const removeConnectedScene = (sceneId: string) => {
    setConnectedScenes(connectedScenes.filter((id) => id !== sceneId))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading character data...</p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    )
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
                    (char: any) => char.id.toString() !== characterId && !relationships.includes(char.id.toString()),
                  ).map((character: any) => (
                    <SelectItem key={character.id} value={character.id.toString()}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {relationships.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {relationships.map((charId) => {
                    const character = allCharactersData.find((c: any) => c.id.toString() === charId)
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
                    (plotPoint: any) => !connectedPlotPoints.includes(plotPoint.id.toString()),
                  ).map((plotPoint: any) => (
                    <SelectItem key={plotPoint.id} value={plotPoint.id.toString()}>
                      {plotPoint.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {connectedPlotPoints.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedPlotPoints.map((plotPointId) => {
                    const plotPoint = allPlotPointsData.find((p: any) => p.id.toString() === plotPointId)
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
              <Select onValueChange={handleConnectedScenesChange}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select scenes" />
                </SelectTrigger>
                <SelectContent>
                  {allScenesData.filter(
                    (scene: any) => !connectedScenes.includes(scene.id.toString()),
                  ).map((scene: any) => (
                    <SelectItem key={scene.id} value={scene.id.toString()}>
                      {scene.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {connectedScenes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedScenes.map((sceneId) => {
                    const scene = allScenesData.find((s: any) => s.id.toString() === sceneId)
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
