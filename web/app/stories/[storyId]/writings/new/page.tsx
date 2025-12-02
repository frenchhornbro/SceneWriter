"use client"

import type React from "react"

import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function NewWritingPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string

  const [prompt, setPrompt] = useState<string>("")
  const [response, setResponse] = useState("")
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch prompt from example.com on mount
  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        // TODO: Replace with actual API endpoint
        const res = await fetch("https://example.com/api/prompt")
        const data = await res.json()
        setPrompt(data.prompt || "Write a compelling scene that advances your story.")
      } catch (error) {
        // Fallback prompt if fetch fails
        setPrompt("Write a compelling scene that advances your story.")
      } finally {
        setIsLoadingPrompt(false)
      }
    }

    fetchPrompt()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API endpoint
      const res = await fetch("https://example.com/api/writings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyId,
          prompt,
          response,
        }),
      })

      if (res.ok) {
        router.push(`/stories/${storyId}`)
      }
    } catch (error) {
      console.error("Failed to create writing:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href={`/stories/${storyId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Story
        </Link>

        <Card className="p-6 bg-surface border-border">
          <h1 className="text-2xl font-bold mb-6">New Writing</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prompt Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              {isLoadingPrompt ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading prompt...</span>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-primary-muted border border-primary/20">
                  <p className="text-foreground leading-relaxed">{prompt}</p>
                </div>
              )}
            </div>

            {/* Response Text Area */}
            <div className="space-y-2">
              <label htmlFor="response" className="text-sm font-medium">
                Your Response
              </label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Start writing your response to the prompt..."
                className="min-h-[300px] bg-background border-border focus:border-primary resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Link href={`/stories/${storyId}`}>
                <Button type="button" variant="outline" className="border-border hover:bg-surface-light bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-hover text-white">
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
          </form>
        </Card>
      </main>
    </div>
  )
}
