"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, BookOpen } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// TODO: Replace with actual data from database/API
const SAMPLE_STORIES = [
  {
    id: 1,
    title: "The Chronicles of Echoing Stars",
    description:
      "An epic space opera following a crew of misfits as they uncover ancient secrets that could reshape the galaxy.",
    genre: "Science Fiction",
    createdAt: "2025-01-15",
  },
  {
    id: 2,
    title: "Whispers in the Willows",
    description: "A magical realism tale set in a small town where the trees hold memories of generations past.",
    genre: "Fantasy",
    createdAt: "2025-02-03",
  },
  {
    id: 3,
    title: "The Detective's Last Case",
    description:
      "A noir mystery where a retired detective is pulled back into the world of crime to solve one final puzzle.",
    genre: "Mystery",
    createdAt: "2025-03-20",
  },
]

export default function StoriesPage() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
        router.push("/stories/new")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

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

        {SAMPLE_STORIES.length === 0 ? (
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
            {SAMPLE_STORIES.map((story) => (
              <Link key={story.id} href={`/stories/${story.id}`}>
                <Card className="p-6 bg-surface border-border hover:border-primary/50 transition-all cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs px-2 py-1 rounded bg-secondary-muted text-secondary font-medium">
                      {story.genre}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 text-balance">{story.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{story.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
