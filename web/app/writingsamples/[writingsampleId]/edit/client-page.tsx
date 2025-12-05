"use client"

import type React from "react"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { serverRequest } from "@/lib/requests"
import { Loading } from "@/components/loading"

export default function EditWritingSampleClientPage({
  params,
}: {
  params: { writingsampleId: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [writingStyleData, setWritingStyleData] = useState<any>(null)
  const [title, setTitle] = useState(writingStyleData ? writingStyleData.title : "")
  const [content, setContent] = useState(writingStyleData ? writingStyleData.content : "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    serverRequest(`api/writingstyle/${params.writingsampleId}`, {}, "GET",
      async (response) => {
        const data = await response.json()
        setWritingStyleData(data)
        setTitle(data.title)
        setContent(data.content)
      },
      async (error) => {
        setErrorMessage(`Failed to load writing sample: ${error}`)
      },
      async () => {
        setIsLoading(false)
      }
    )
  }, [])

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        handleSubmit(undefined, false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [params.writingsampleId, title, content, isSubmitting])

  async function handleSubmit(e?: React.FormEvent, doRedirect = true) {
    e?.preventDefault()
    if (!title.trim() || isSubmitting) {
      return
    }
    setIsSubmitting(true)
    await serverRequest(`api/writingstyle/${params.writingsampleId}`, {
      title: title.trim(),
      content: content,
    }, "PUT",
      async (response) => {
        if (doRedirect) {
          router.push(`/writingsamples/${params.writingsampleId}`)
        }
      },
      async (error) => {
        console.error("Failed to update writing sample: ", error)
        alert(`Failed to update writing sample: ${error}`)
      },
      async () => {
        setIsSubmitting(false)
      }
    )
  }

  if (isLoading) {
    return (
      <Loading itemDescription="character data" />
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
          href={`/writingsamples/${params.writingsampleId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Writing Sample
        </Link>

        <h1 className="text-3xl font-bold mb-8">Edit Writing Sample</h1>

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
                  <p className="text-foreground leading-relaxed">{writingStyleData.prompt}</p>
                </Card>
              </div>

              <div>
                <Label htmlFor="content">Your Response</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your response to the prompt..."
                  rows={20}
                  className="bg-background border-border font-serif"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Link href={`/writingsamples/${params.writingsampleId}`}>
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
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
