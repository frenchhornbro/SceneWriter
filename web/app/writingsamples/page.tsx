"use client"

import { ErrorPage } from "@/components/errorPage"
import { Loading } from "@/components/loading"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { serverRequest } from "@/lib/requests"
import { keyIsPressed } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function WritingSamplesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [writingStyleData, setWritingStyleData] = useState<any>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keyIsPressed(e, ["n"])) {
        router.push("/writingsamples/new")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  useEffect(() => {
    setIsLoading(true)
    serverRequest("api/writingstyle", {}, "GET",
      async (request) => {
        const data = await request.json()
        setWritingStyleData(data.writingStyleSamples)
      },
      async (error) => {
        setErrorMessage(`Failed to load writing samples: ${error}`)
      },
      async () => {
        setIsLoading(false)
      }
    )
  }, [])

  if (isLoading) {
    return <Loading itemDescription="writing style samples" />
  }

  if (errorMessage) {
    return <ErrorPage errorMessage={errorMessage} />
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Writing Style Samples</h1>
            <p className="text-muted-foreground">Help AI mirror your writing style.</p>
          </div>
          <Link href="/writingsamples/new">
            <Button className="bg-primary hover:bg-primary-hover text-white">New Writing Style Sample</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {writingStyleData.map((writingStyle: any) => (
            <Link key={writingStyle.id} href={`/writingsamples/${writingStyle.id}`}>
              <Card className="p-6 bg-surface border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                {writingStyle.title && (
                  <h3 className="font-semibold text-lg mb-2">{writingStyle.title}</h3>
                )}
                <div>
                  <p className="text-sm text-muted-foreground italic mb-4 line-clamp-2">{writingStyle.prompt}</p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{writingStyle.contentPage}</p>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{writingStyle.wordCount.toLocaleString()} words</span>
                  <span>•</span>
                  <span>{new Date(writingStyle.editedAt).toLocaleDateString()}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
