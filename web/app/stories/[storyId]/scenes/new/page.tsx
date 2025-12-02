"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

// Sample data - TODO: Replace with actual data fetching
const SAMPLE_PLOTPOINTS = [
  { id: 1, title: "Discovery of Ancient Artifact" },
  { id: 2, title: "Betrayal Revealed" },
  { id: 3, title: "Alliance Forms" },
]

const SAMPLE_CHARACTERS = [
  { id: 1, name: "Captain Elena Voss" },
  { id: 2, name: "Dr. Marcus Chen" },
  { id: 3, name: "Zara the Wanderer" },
]

const SAMPLE_WRITINGS = [
  { id: 1, title: "Chapter 1: The Discovery - Draft" },
  { id: 2, title: "Character Study: Elena" },
  { id: 3, title: "Scene: Ancient Warnings" },
]

export default function NewScenePage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string

  const [selectedPlotPoints, setSelectedPlotPoints] = useState<number[]>([])
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([])
  const [selectedWritings, setSelectedWritings] = useState<number[]>(
    SAMPLE_WRITINGS.map((w) => w.id), // All selected by default
  )
  const [description, setDescription] = useState("")
  const [pointOfView, setPointOfView] = useState("")
  const [location, setLocation] = useState("")
  const [povSuggestions, setPovSuggestions] = useState<string[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [showPovSuggestions, setShowPovSuggestions] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPovSuggestions = async () => {
      try {
        const response = await fetch("https://example.com/api/pov-suggestions")
        if (response.ok) {
          const data = await response.json()
          setPovSuggestions(data.suggestions || [])
        }
      } catch (err) {
        setPovSuggestions([])
      }
    }

    if (showPovSuggestions && povSuggestions.length === 0) {
      fetchPovSuggestions()
    }
  }, [showPovSuggestions, povSuggestions.length])

  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      try {
        const response = await fetch("https://example.com/api/location-suggestions")
        if (response.ok) {
          const data = await response.json()
          setLocationSuggestions(data.suggestions || [])
        }
      } catch (err) {
        setLocationSuggestions([])
      }
    }

    if (showLocationSuggestions && locationSuggestions.length === 0) {
      fetchLocationSuggestions()
    }
  }, [showLocationSuggestions, locationSuggestions.length])

  const addPlotPoint = (value: string) => {
    const id = Number.parseInt(value)
    if (!selectedPlotPoints.includes(id)) {
      setSelectedPlotPoints([...selectedPlotPoints, id])
    }
  }

  const removePlotPoint = (id: number) => {
    setSelectedPlotPoints(selectedPlotPoints.filter((ppId) => ppId !== id))
  }

  const addCharacter = (value: string) => {
    const id = Number.parseInt(value)
    if (!selectedCharacters.includes(id)) {
      setSelectedCharacters([...selectedCharacters, id])
    }
  }

  const removeCharacter = (id: number) => {
    setSelectedCharacters(selectedCharacters.filter((cId) => cId !== id))
  }

  const addWriting = (value: string) => {
    const id = Number.parseInt(value)
    if (!selectedWritings.includes(id)) {
      setSelectedWritings([...selectedWritings, id])
    }
  }

  const removeWriting = (id: number) => {
    setSelectedWritings(selectedWritings.filter((wId) => wId !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (selectedPlotPoints.length === 0) {
      setError("Please select at least one plot point")
      return
    }

    setIsSubmitting(true)

    try {
      await fetch("https://example.com/api/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId,
          plotPoints: selectedPlotPoints,
          characters: selectedCharacters,
          writings: selectedWritings,
          description,
          pointOfView,
          location,
        }),
      })

      await new Promise((resolve) => setTimeout(resolve, 10000))

      const newSceneId = Math.floor(Math.random() * 1000)
      router.push(`/stories/${storyId}/scenes/${newSceneId}`)
    } catch (err) {
      setError("Failed to create scene. Please try again.")
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        router.push(`/stories/${storyId}/scenes/new`)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, storyId])

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href={`/stories/${storyId}?tab=scenes`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Story
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Scene</h1>
          <p className="text-muted-foreground">Create a new scene for your story</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 bg-surface border-border space-y-6">
            {/* Plot Points */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="plotpoints" className="text-base">
                  Plot Points <span className="text-primary">*</span>
                </Label>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
              <Select onValueChange={addPlotPoint}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select plot points" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_PLOTPOINTS.filter((pp) => !selectedPlotPoints.includes(pp.id)).map((plotpoint) => (
                    <SelectItem key={plotpoint.id} value={plotpoint.id.toString()}>
                      {plotpoint.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedPlotPoints.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPlotPoints.map((ppId) => {
                    const plotpoint = SAMPLE_PLOTPOINTS.find((p) => p.id === ppId)
                    return (
                      <div
                        key={ppId}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        <span>{plotpoint?.title}</span>
                        <button
                          type="button"
                          onClick={() => removePlotPoint(ppId)}
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

            {/* Characters */}
            <div className="space-y-3">
              <Label htmlFor="characters" className="text-base">
                Characters
              </Label>
              <Select onValueChange={addCharacter}>
                <SelectTrigger className="bg-surface-light border-border">
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
                <div className="flex flex-wrap gap-2">
                  {selectedCharacters.map((cId) => {
                    const character = SAMPLE_CHARACTERS.find((c) => c.id === cId)
                    return (
                      <div
                        key={cId}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm"
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

            {/* Scene Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base">
                Scene Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happens in this scene..."
                className="min-h-[120px] bg-background border-border focus:border-primary"
              />
            </div>

            {/* Point of View */}
            <div className="space-y-3 relative">
              <Label htmlFor="pov" className="text-base">
                Point of View
              </Label>
              <Input
                id="pov"
                value={pointOfView}
                onChange={(e) => setPointOfView(e.target.value)}
                onFocus={() => setShowPovSuggestions(true)}
                onBlur={() => setTimeout(() => setShowPovSuggestions(false), 200)}
                placeholder="e.g., First person, Third person limited..."
                className="bg-background border-border focus:border-primary"
              />
              {showPovSuggestions && povSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-surface border border-border rounded-md shadow-lg mt-1">
                  {povSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setPointOfView(suggestion)
                        setShowPovSuggestions(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-surface-light transition-colors cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3 relative">
              <Label htmlFor="location" className="text-base">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                placeholder="e.g., Ancient temple, Space station..."
                className="bg-background border-border focus:border-primary"
              />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-surface border border-border rounded-md shadow-lg mt-1">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setLocation(suggestion)
                        setShowLocationSuggestions(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-surface-light transition-colors cursor-pointer"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Associated Writings */}
            <div className="space-y-3">
              <Label htmlFor="writings" className="text-base">
                Associated Writings
              </Label>
              <Select onValueChange={addWriting}>
                <SelectTrigger className="bg-surface-light border-border">
                  <SelectValue placeholder="Select writings" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_WRITINGS.filter((w) => !selectedWritings.includes(w.id)).map((writing) => (
                    <SelectItem key={writing.id} value={writing.id.toString()}>
                      {writing.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedWritings.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedWritings.map((wId) => {
                    const writing = SAMPLE_WRITINGS.find((w) => w.id === wId)
                    return (
                      <div
                        key={wId}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        <span>{writing?.title}</span>
                        <button
                          type="button"
                          onClick={() => removeWriting(wId)}
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

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Link href={`/stories/${storyId}?tab=scenes`} className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border bg-transparent"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary-hover text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </Card>
        </form>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-8 bg-surface border-border text-center space-y-4 max-w-md">
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Generating Scene</h2>
                <p className="text-muted-foreground">
                  Our AI is crafting your scene with the selected plot points and characters...
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
