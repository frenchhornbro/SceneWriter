"use client"

import type React from "react"

import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { serverRequest } from "@/lib/requests"

// TODO: Replace with actual data
const SAMPLE_WRITING = {
  id: 1,
  prompt: "Write a compelling scene that advances your story.",
  response: `The bridge of the Starship Endeavor hummed with quiet efficiency. Captain Elena Voss stood at the center, her eyes fixed on the main viewscreen where stars stretched into infinite darkness.`,
}

export default function EditWritingPage() {
  const params = useParams()
  const router = useRouter()
  const storyId = params.storyId as string
  const writingId = params.writingId as string

  const [prompt, setPrompt] = useState<string>("")
  const [response, setResponse] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // TODO: Fetch actual writing data based on writingId
  useEffect(() => {
    setPrompt(SAMPLE_WRITING.prompt)
    setResponse(SAMPLE_WRITING.response)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // TODO: Nest the endpoint and come back to this
    serverRequest(`api/writingstyle/${writingId}`, { prompt, response }, "PUT",
      async (response) => {
        router.push(`/stories/${storyId}/writings/${writingId}`)
      },
      async (error) => {
        console.error("Failed to update writing:", error)
      },
      async () => {
        setIsSubmitting(false)
      }
    )
  }

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href={`/stories/${storyId}/writings/${writingId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Writing
        </Link>

        <Card className="p-6 bg-surface border-border">
          <h1 className="text-2xl font-bold mb-6">Edit Writing</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prompt Display */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              <div className="p-4 rounded-lg bg-primary-muted border border-primary/20">
                <p className="text-foreground leading-relaxed">{prompt}</p>
              </div>
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
              <Link href={`/stories/${storyId}/writings/${writingId}`}>
                <Button type="button" variant="outline" className="border-border hover:bg-surface-light bg-transparent">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-hover text-white">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
