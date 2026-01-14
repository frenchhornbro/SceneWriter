"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Earth, FileText, Sparkles } from "lucide-react"
import { useEffect } from "react"
import { keyIsPressed } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (keyIsPressed(e, ["Enter"])) {
        e.preventDefault()
        router.push(`/stories`)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center py-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary-muted border border-primary/20 text-primary text-sm font-medium mb-6">
            For Authors & Creators
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
            Craft Your Stories
            <br />
            <span className="text-primary">Scene by Scene</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 text-pretty max-w-2xl mx-auto leading-relaxed">
            The AI-powered creative writing tool for managing characters, scenes, and narratives. Keep your creative universe
            organized and accessible.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-hover text-white font-semibold">
              <Link href="/stories">Get Started</Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto py-20 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-center mb-12">Preserve Creativity in AI Writing</h2>
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6 md:p-8 mb-16 max-w-3xl text-center text-md text-muted-foreground">
            <div>
              AI should never remove the responsibility of creativity from the author.
            </div>
            <div>
              SceneWriter can help you write faster, but the core creative vision must come from you.
            </div>
            <div>
              This program is structured to keep you in control of your story, while leveraging AI to help you quickly visualize the creative universe you have built in-action.
              Build your world, outline your story, and let AI give you the inspiration you need to sew it all together.
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary-muted flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Story Management</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Organize details for multiple creative stories in one place.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border hover:border-secondary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary-muted flex items-center justify-center mb-4">
                <Earth className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">World-Building</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Build your story's universe with interconnected characters, locations, and plot points.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary-muted flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Writing Style</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Allow AI to match your unique writing style for easier flow.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border hover:border-secondary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary-muted flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Scene Generation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Quickly visualize your own world through AI scene generation.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div>Created by Hyrum Durfee</div>
          <div className="text-blue-600 hover:underline">
            <a href="https://github.com/frenchhornbro/SceneWriter" target="_blank" rel="noopener noreferrer">SceneWriter GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
