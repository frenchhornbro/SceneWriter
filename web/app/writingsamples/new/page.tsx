"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { serverRequest } from "@/lib/requests"
import { Loading } from "@/components/loading"

export default function NewWritingSamplePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [response, setResponse] = useState("")
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    serverRequest("api/writingstyle/prompt", {}, "GET",
      async (response) => {
        const data = await response.json()
        setPrompt(data.prompt)
      },
      async (error) => {
        setErrorMessage(`Failed to load prompt: ${error}`)
        console.error(`Failed to load prompt: ${error}`)
      },
      async () => {
        setIsLoading(false)
      }
    )
  }, [])

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!title.trim()) {
      return
    }
    setIsSubmitting(true)
    serverRequest("api/writingstyle", {
      title: title.trim(),
      prompt,
      content: response
    }, "POST",
      async (response) => {
        router.push("/writingsamples")
      },
      async (error) => {
        console.error("Failed to create writing sample:", error)
        setIsSubmitting(false)
      }
    )
  }

  if (isLoading) {
    return (
      <Loading itemDescription="prompt" />
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
          href="/writingsamples"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Writing Samples
        </Link>

        <h1 className="text-3xl font-bold mb-8">New Writing Sample</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-surface border-border">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your writing a title"
                  required
                  className="bg-background border-border"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Prompt</Label>
                <Card className="p-4 bg-surface-light border-border mt-2">
                  <p className="text-foreground leading-relaxed">{prompt}</p>
                </Card>
              </div>

              <div>
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write your response to the prompt..."
                  rows={20}
                  className="bg-background border-border"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Link href="/writingsamples">
              <Button type="button" variant="outline" className="border-border hover:bg-surface-light bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-primary hover:bg-primary-hover text-white"
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
        </form>
      </main>
    </div>
  )
}
