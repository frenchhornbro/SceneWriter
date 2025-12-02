"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

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

// Sample existing scene data
const SAMPLE_SCENE = {
  plotPoints: [1],
  characters: [1, 2],
  writings: [1, 3],
  description: "Captain Elena Voss and her crew detect an unusual energy signature and decide to investigate.",
}

export default function RegenerateScenePage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string
  const sceneId = params.sceneId as string

  // Pre-fill with existing scene data
  const [selectedPlotPoints, setSelectedPlotPoints] = useState<number[]>(SAMPLE_SCENE.plotPoints)
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>(SAMPLE_SCENE.characters)
  const [selectedWritings, setSelectedWritings] = useState<number[]>(SAMPLE_SCENE.writings)
  const [description, setDescription] = useState(SAMPLE_SCENE.description)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showWarningDialog, setShowWarningDialog] = useState(false)

  const [showPlotPointsDropdown, setShowPlotPointsDropdown] = useState(false)
  const [showCharactersDropdown, setShowCharactersDropdown] = useState(false)
  const [showWritingsDropdown, setShowWritingsDropdown] = useState(false)

  const togglePlotPoint = (id: number) => {
    if (selectedPlotPoints.includes(id)) {
      setSelectedPlotPoints(selectedPlotPoints.filter((itemId) => itemId !== id))
    } else {
      setSelectedPlotPoints([...selectedPlotPoints, id])
    }
  }

  const toggleCharacter = (id: number) => {
    if (selectedCharacters.includes(id)) {
      setSelectedCharacters(selectedCharacters.filter((itemId) => itemId !== id))
    } else {
      setSelectedCharacters([...selectedCharacters, id])
    }
  }

  const toggleWriting = (id: number) => {
    if (selectedWritings.includes(id)) {
      setSelectedWritings(selectedWritings.filter((itemId) => itemId !== id))
    } else {
      setSelectedWritings([...selectedWritings, id])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate at least one plot point is selected
    if (selectedPlotPoints.length === 0) {
      setError("Please select at least one plot point")
      return
    }

    // Show warning dialog
    setShowWarningDialog(true)
  }

  const handleConfirmRegenerate = async () => {
    setShowWarningDialog(false)
    setIsSubmitting(true)

    try {
      // Placeholder API call
      await fetch("https://example.com/api/scenes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId,
          storyId,
          plotPoints: selectedPlotPoints,
          characters: selectedCharacters,
          writings: selectedWritings,
          description,
        }),
      })

      // Wait 10 seconds to simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 10000))

      // Redirect back to the scene detail page
      router.push(`/stories/${storyId}/scenes/${sceneId}`)
    } catch (err) {
      setError("Failed to regenerate scene. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href={`/stories/${storyId}/scenes/${sceneId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scene
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Regenerate Scene</h1>
          <p className="text-muted-foreground">Modify parameters and regenerate your scene</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 bg-surface border-border space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="plotpoints" className="text-base">
                  Plot Points <span className="text-primary">*</span>
                </Label>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              {/* Selected badges */}
              <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                {selectedPlotPoints.map((id) => {
                  const plotpoint = SAMPLE_PLOTPOINTS.find((pp) => pp.id === id)
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary text-white text-sm"
                    >
                      <span>{plotpoint?.title}</span>
                      <button
                        type="button"
                        onClick={() => togglePlotPoint(id)}
                        className="hover:bg-primary-hover rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPlotPointsDropdown(!showPlotPointsDropdown)}
                  className="w-full px-4 py-2 text-left border border-border rounded-md bg-background hover:border-primary/50 transition-colors"
                >
                  Select plot points...
                </button>
                {showPlotPointsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {SAMPLE_PLOTPOINTS.map((plotpoint) => (
                      <button
                        key={plotpoint.id}
                        type="button"
                        onClick={() => togglePlotPoint(plotpoint.id)}
                        className={`w-full px-4 py-2 text-left hover:bg-surface-light transition-colors ${
                          selectedPlotPoints.includes(plotpoint.id) ? "bg-primary/10 text-primary" : ""
                        }`}
                      >
                        {plotpoint.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="characters" className="text-base">
                Characters
              </Label>

              {/* Selected badges */}
              <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                {selectedCharacters.map((id) => {
                  const character = SAMPLE_CHARACTERS.find((c) => c.id === id)
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1 px-3 py-1 rounded-md bg-secondary text-white text-sm"
                    >
                      <span>{character?.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleCharacter(id)}
                        className="hover:bg-secondary-hover rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCharactersDropdown(!showCharactersDropdown)}
                  className="w-full px-4 py-2 text-left border border-border rounded-md bg-background hover:border-primary/50 transition-colors"
                >
                  Select characters...
                </button>
                {showCharactersDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {SAMPLE_CHARACTERS.map((character) => (
                      <button
                        key={character.id}
                        type="button"
                        onClick={() => toggleCharacter(character.id)}
                        className={`w-full px-4 py-2 text-left hover:bg-surface-light transition-colors ${
                          selectedCharacters.includes(character.id) ? "bg-secondary/10 text-secondary" : ""
                        }`}
                      >
                        {character.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

            <div className="space-y-3">
              <Label htmlFor="writings" className="text-base">
                Associated Writings
              </Label>

              {/* Selected badges */}
              <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                {selectedWritings.map((id) => {
                  const writing = SAMPLE_WRITINGS.find((w) => w.id === id)
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1 px-3 py-1 rounded-md bg-primary text-white text-sm"
                    >
                      <span>{writing?.title}</span>
                      <button
                        type="button"
                        onClick={() => toggleWriting(id)}
                        className="hover:bg-primary-hover rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowWritingsDropdown(!showWritingsDropdown)}
                  className="w-full px-4 py-2 text-left border border-border rounded-md bg-background hover:border-primary/50 transition-colors"
                >
                  Select writings...
                </button>
                {showWritingsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-surface border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {SAMPLE_WRITINGS.map((writing) => (
                      <button
                        key={writing.id}
                        type="button"
                        onClick={() => toggleWriting(writing.id)}
                        className={`w-full px-4 py-2 text-left hover:bg-surface-light transition-colors ${
                          selectedWritings.includes(writing.id) ? "bg-primary/10 text-primary" : ""
                        }`}
                      >
                        {writing.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Link href={`/stories/${storyId}/scenes/${sceneId}`} className="flex-1">
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
                    Regenerating...
                  </>
                ) : (
                  "Regenerate"
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
                <h2 className="text-2xl font-bold mb-2">Regenerating Scene</h2>
                <p className="text-muted-foreground">Our AI is crafting your scene with the updated parameters...</p>
              </div>
              <div className="flex gap-2 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            </Card>
          </div>
        )}

        {/* Warning Dialog */}
        <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <AlertDialogContent className="bg-surface border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Regenerate Scene?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This will replace the current generated scene text with a new version. The previous generated scene will
                be lost. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border bg-transparent">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmRegenerate}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
