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
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { serverRequest } from "@/lib/requests"
import { Loading } from "@/components/loading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import SceneGenerationOverlay from "@/components/scene-generation-overlay"
import { ErrorPage } from "@/components/errorPage"
import { keyIsPressed } from "@/lib/utils"
import type { adjacentScenes } from "@shared/templates/scene"
import { AdjacentScenesCheckboxes } from "@/components/adjacentScenes"

export default function RegenerateScenePage() {
  const params = useParams()
  const storyId = params.storyId as string
  const sceneId = params.sceneId as string
  const sceneVersion = params.sceneVersion as string
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [sceneData, setSceneData] = useState<any>(null)
  const [allCharactersData, setAllCharactersData] = useState<any[]>([])
  const [allPlotPointsData, setAllPlotPointsData] = useState<any[]>([])
  const [allWritingStyleSamplesData, setAllWritingStyleSamplesData] = useState<any[]>([])
  const [isRegenerating, setIsRegenerating] = useState(false)

  const [overview, setOverview] = useState("")
  const [title, setTitle] = useState("")
  const [pov, setPov] = useState("")
  const [location, setLocation] = useState("")
  const [tone, setTone] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [connectedCharacterIds, setConnectedCharacterIds] = useState<number[]>([])
  const [connectedPlotPointIds, setConnectedPlotPointIds] = useState<number[]>([])
  const [connectedWritingStyleSampleIds, setConnectedWritingStyleSampleIds] = useState<number[]>([])
  const [includePreviousScene, setIncludePreviousScene] = useState(false)
  const [includeNextScene, setIncludeNextScene] = useState(false)
  const [adjacentScenesData, setAdjacentScenesData] = useState<adjacentScenes>({ previousScene: null, nextScene: null })
  const [availableModels, setAvailableModels] = useState<Record<string, string>>({})
  const [selectedModel, setSelectedModel] = useState<string>("")

  useEffect(() => {
    serverRequest(`api/story/${storyId}/scene/${sceneId}/version/${sceneVersion}`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setSceneData(data)
        setOverview(data.overview || "")
        setTitle(data.title || "")
        setPov(data.pov || "")
        setLocation(data.location || "")
        setTone(data.tone || "")
        setAdditionalNotes(data.additionalNotes || "")
        setConnectedCharacterIds(data.connectedCharacterIds || [])
        setConnectedPlotPointIds(data.connectedPlotPointIds || [])
        setConnectedWritingStyleSampleIds(data.connectedWritingStyleSampleIds || [])
      },
      async (error) => {
        setErrorMessage(`Failed to load scene: ${error}`)
        setIsLoading(false)
      }
    )
    serverRequest(`api/story/${storyId}/character`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllCharactersData(data.characters)
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
      },
      async (error) => {
        setErrorMessage(`Failed to load plot points for connections: ${error}`)
        setIsLoading(false)
      }
    )
    serverRequest(`api/writingstyle`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAllWritingStyleSamplesData(data.writingStyleSamples)
      },
      async (error) => {
        setErrorMessage(`Failed to load writing style samples for connections: ${error}`)
        setIsLoading(false)
      }
    )
    serverRequest(`api/story/${storyId}/scene/${sceneId}/version/${sceneVersion}/adjacent`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAdjacentScenesData(data)
      },
      async (error) => {
        console.error(`Failed to load adjacent scenes: ${error}`)
      }
    )
    serverRequest(`api/story/${storyId}/scene/models`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setAvailableModels(data.models)
        const firstModelKey = Object.keys(data.models)[0]
        if (firstModelKey) {
          setSelectedModel(firstModelKey)
        }
      },
      async (error) => {
        console.error(`Failed to load available models: ${error}`)
      }
    )
  }, [])

  useEffect(() => {
    if (sceneData && allCharactersData && allPlotPointsData && allWritingStyleSamplesData) {
      setIsLoading(false)
    }
  }, [sceneData, allCharactersData, allPlotPointsData, allWritingStyleSamplesData])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (keyIsPressed(e, ["ctrl", "Enter"], true)) {
        e.preventDefault()
        handleSubmit(undefined)
      }
      else if (keyIsPressed(e, ["Escape"])) {
        e.preventDefault()
        router.push(`/stories/${storyId}/scenes/${sceneId}/version/${sceneVersion}`)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [overview, title, pov, location, tone, additionalNotes, connectedCharacterIds, connectedPlotPointIds, connectedWritingStyleSampleIds, isRegenerating, selectedModel])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if ((!overview.trim() && !connectedPlotPointIds.length) || isRegenerating) {
      alert(`Please fill in all required fields before saving.\n${overview.trim() || connectedPlotPointIds.length ? "" : "Overview or connected plot points are required."}`)
      return
    }
    setIsRegenerating(true)
    await serverRequest(`api/story/${storyId}/scene/${sceneId}/version/${sceneVersion}/regenerate`, {
      overview: overview.trim(),
      title: title.trim() || `Untitled Scene`,
      pov: pov.trim(),
      location: location.trim(),
      tone: tone.trim(),
      additionalNotes: additionalNotes.trim(),
      connectedCharacterIds,
      connectedPlotPointIds,
      connectedWritingStyleSampleIds,
      includePreviousScene,
      includeNextScene,
      model: selectedModel,
    }, "POST",
      async (response) => {
        const data = await response.json()
        const newSceneVersion = data.version;
        router.push(`/stories/${storyId}/scenes/${sceneId}/version/${newSceneVersion}`)
      },
      async (error) => {
        console.error("Failed to regenerate scene: ", error)
        alert(`Failed to regenerate scene: ${error}`)
      },
      async () => {
        setIsRegenerating(false)
      }
    )
  }

  const handleConnectedCharactersChange = (characterId: string) => {
    const characterIdNum = Number(characterId);
    if (characterIdNum && !connectedCharacterIds.includes(characterIdNum)) {
      setConnectedCharacterIds([...connectedCharacterIds, characterIdNum])
    }
  }

  const removeConnectedCharacter = (characterId: number) => {
    setConnectedCharacterIds(connectedCharacterIds.filter((id) => id !== characterId))
  }

  const handleConnectedPlotPointsChange = (plotPointId: string) => {
    const plotPointIdNum = Number(plotPointId);
    if (plotPointIdNum && !connectedPlotPointIds.includes(plotPointIdNum)) {
      setConnectedPlotPointIds([...connectedPlotPointIds, plotPointIdNum])
    }
  }

  const removeConnectedPlotPoint = (plotPointId: number) => {
    setConnectedPlotPointIds(connectedPlotPointIds.filter((id) => id !== plotPointId))
  }

  const handleConnectedWritingStyleSamplesChange = (writingStyleSampleId: string) => {
    const writingStyleSampleIdNum = Number(writingStyleSampleId);
    if (writingStyleSampleIdNum && !connectedWritingStyleSampleIds.includes(writingStyleSampleIdNum)) {
      setConnectedWritingStyleSampleIds([...connectedWritingStyleSampleIds, writingStyleSampleIdNum])
    }
  }

  const removeConnectedWritingStyleSample = (writingStyleSampleId: number) => {
    setConnectedWritingStyleSampleIds(connectedWritingStyleSampleIds.filter((id) => id !== writingStyleSampleId))
  }

  if (isLoading) {
    return <Loading itemDescription="scene" />
  }

  if (errorMessage) {
    return <ErrorPage errorMessage={errorMessage} />
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href={`/stories/${storyId}/scenes/${sceneId}/version/${sceneVersion}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scene
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Regenerate Scene</h1>
          <p className="text-muted-foreground">Modify parameters and regenerate your scene</p>
        </div>

        <Card className="p-6 bg-surface border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-surface-light border-border"
                />
              </div>

              <AdjacentScenesCheckboxes
                adjacentScenes={adjacentScenesData}
                includePreviousScene={includePreviousScene}
                setIncludePreviousScene={setIncludePreviousScene}
                includeNextScene={includeNextScene}
                setIncludeNextScene={setIncludeNextScene}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview">Overview</Label>
              <Textarea
                id="overview"
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                rows={20}
                className="bg-surface-light border-border text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pov">Point of View</Label>
              <Input
                id="pov"
                value={pov}
                onChange={(e) => setPov(e.target.value)}
                placeholder="Which character's perspective?"
                className="bg-surface-light border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where does this scene take place?"
                className="bg-surface-light border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Input
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="What is the tone of this scene?"
                className="bg-surface-light border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={20}
                className="bg-surface-light border-border text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="connectedCharacters" className="text-sm font-medium">
                Connected Characters
              </Label>
              <Select onValueChange={handleConnectedCharactersChange}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select characters" />
                </SelectTrigger>
                <SelectContent>
                  {allCharactersData?.filter(
                    (char: any) => !connectedCharacterIds.includes(char.id),
                  )?.map((character: any) => (
                    <SelectItem key={character.id} value={character.id}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {connectedCharacterIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedCharacterIds?.map((charId) => {
                    const character = allCharactersData.find((c: any) => c.id === charId)
                    return (
                      <div
                        key={charId}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
                      >
                        <span>{character?.name}</span>
                        <button
                          type="button"
                          onClick={() => removeConnectedCharacter(charId)}
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
                  {allPlotPointsData?.filter(
                    (plotPoint: any) => !connectedPlotPointIds.includes(plotPoint.id),
                  )?.map((plotPoint: any) => (
                    <Tooltip key={plotPoint.id}>
                      <TooltipTrigger asChild>
                        <SelectItem value={plotPoint.id}>
                          {plotPoint.title}
                        </SelectItem>
                      </TooltipTrigger>
                      {plotPoint.descriptionPage && (
                        <TooltipContent side="right" className="max-w-md whitespace-pre-wrap text-left">
                          {plotPoint.descriptionPage}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </SelectContent>
              </Select>

              {connectedPlotPointIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedPlotPointIds?.map((plotPointId) => {
                    const plotPoint = allPlotPointsData.find((p: any) => p.id === plotPointId)
                    const plotPointPreview = plotPoint?.descriptionPage || ""
                    return (
                      <Tooltip key={plotPointId}>
                        <TooltipTrigger asChild>
                          <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm cursor-default"
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
                        </TooltipTrigger>
                        {plotPointPreview && (
                          <TooltipContent className="max-w-md whitespace-pre-wrap text-left">
                            {plotPointPreview}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="connectedWritingStyleSamples" className="text-sm font-medium">
                Connected Writing Style Samples
              </Label>
              <Select onValueChange={handleConnectedWritingStyleSamplesChange}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select writing style samples" />
                </SelectTrigger>
                <SelectContent>
                  {allWritingStyleSamplesData?.filter(
                    (writingStyleSample: any) => !connectedWritingStyleSampleIds.includes(writingStyleSample.id),
                  )?.map((writingStyleSample: any) => (
                    <Tooltip key={writingStyleSample.id}>
                      <TooltipTrigger asChild>
                        <SelectItem value={writingStyleSample.id}>
                          {writingStyleSample.title}
                        </SelectItem>
                      </TooltipTrigger>
                      {writingStyleSample.contentPage && (
                        <TooltipContent side="right" className="max-w-md whitespace-pre-wrap text-left">
                          {writingStyleSample.contentPage}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </SelectContent>
              </Select>

              {connectedWritingStyleSampleIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {connectedWritingStyleSampleIds?.map((writingStyleSampleId) => {
                    const writingStyleSample = allWritingStyleSamplesData.find((w: any) => w.id === writingStyleSampleId)
                    const samplePreview = writingStyleSample?.contentPage || ""
                    return (
                      <Tooltip key={writingStyleSampleId}>
                        <TooltipTrigger asChild>
                          <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm cursor-default"
                          >
                            <span>{writingStyleSample?.title}</span>
                            <button
                              type="button"
                              onClick={() => removeConnectedWritingStyleSample(writingStyleSampleId)}
                              className="hover:text-foreground"
                            >
                              ×
                            </button>
                          </div>
                        </TooltipTrigger>
                        {samplePreview && (
                          <TooltipContent className="max-w-md whitespace-pre-wrap text-left">
                            {samplePreview}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium">
                Model
              </Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(availableModels).map(([modelId, modelName]) => (
                    <SelectItem key={modelId} value={modelId}>
                      {modelName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isRegenerating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isRegenerating ? "Regenerating..." : "Regenerate"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/stories/${storyId}/scenes/${sceneId}/version/${sceneVersion}`)}
                className="border-border hover:bg-surface-light bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {isRegenerating && SceneGenerationOverlay()}
      </main>
    </div>
  )
}
