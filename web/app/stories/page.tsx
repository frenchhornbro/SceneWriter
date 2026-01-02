"use client"
import { ErrorPage } from "@/components/errorPage"
import { Loading } from "@/components/loading"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { serverRequest } from "@/lib/requests"
import { keyIsPressed } from "@/lib/utils"
import { Plus, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function StoriesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [storiesData, setStoriesData] = useState<any>(null)

  useEffect(() => {
    setIsLoading(true)
    serverRequest("api/story", {}, "GET",
      async (request) => {
        const data = await request.json()
        setStoriesData(data.stories)
      },
      async (error) => {
        setErrorMessage(`Failed to load stories: ${error}`)
      },
      async () => {
        setIsLoading(false)
      }
    )
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keyIsPressed(e, ["n"])) {
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
        router.push("/stories/new")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  if (isLoading) {
    return <Loading itemDescription="stories" />
  }

  if (errorMessage) {
    return <ErrorPage errorMessage={errorMessage} />
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Stories</h1>
            <p className="text-muted-foreground">Manage and organize your creative projects</p>
          </div>

          <Link href="/stories/new">
            <Button className="bg-primary hover:bg-primary-hover text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Story
            </Button>
          </Link>
        </div>

        {!storiesData || storiesData.length === 0 ? (
          <Card className="p-12 text-center bg-surface border-border">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-6">Create your first story to get started</p>
            <Link href="/stories/new">
              <Button className="bg-primary hover:bg-primary-hover text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Story
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storiesData.map((story: any) => (
              <Link key={story.id} href={`/stories/${story.id}`}>
                <Card className="p-6 bg-surface border-border hover:border-primary/50 transition-all cursor-pointer h-full">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-balance">{story.title}</h3>
                      <span className="text-xs px-2 py-1 rounded bg-secondary-muted text-secondary font-medium">
                        {story.subtitle}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(story.editedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-3">{story.overview}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{story.storyPage}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
