import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Nav } from "@/components/nav"
import { BookOpen, Users, FileText, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Nav />

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
            The comprehensive writing tool for managing characters, scenes, and narratives. Keep your creative universe
            organized and accessible.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary-hover text-white font-semibold">
              <Link href="/stories">Get Started</Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto py-20">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Write</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary-muted flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Story Management</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Organize multiple stories with titles, descriptions, and genres in one place.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border hover:border-secondary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary-muted flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Character Profiles</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create detailed character profiles with descriptions and relationships.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary-muted flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Scene Outlines</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plan scenes with POV, locations, and narrative summaries.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border hover:border-secondary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-secondary-muted flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Writing Samples</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Draft and refine actual scene content with rich text editing.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Created by Hyrum Durfee. Find on{' '}
          <Link
            href="https://github.com/frenchhornbro/SceneWriter"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            GitHub
          </Link>
        </div>
      </footer>
    </div>
  )
}
