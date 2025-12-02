"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// TODO: Replace with actual data fetching
const SAMPLE_WRITING_SAMPLES = [
  {
    id: 1,
    title: "Elena's First Command",
    prompt: "Write a scene where your protagonist takes on a leadership role for the first time.",
    wordCount: 890,
    createdAt: "2025-03-10",
  },
  {
    id: 2,
    title: "The Artifact Awakens",
    prompt: "Describe the moment when a mysterious object reveals its true nature.",
    wordCount: 1245,
    createdAt: "2025-03-12",
  },
  {
    id: 3,
    title: "Marcus's Dilemma",
    prompt: "Write a scene where a character must choose between loyalty and truth.",
    wordCount: 1580,
    createdAt: "2025-03-14",
  },
]

export default function WritingSamplesPage() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
        router.push("/writingsamples/new")
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
            <h1 className="text-3xl font-bold mb-2">Writing Samples</h1>
            <p className="text-muted-foreground">Practice your craft with standalone writing exercises</p>
          </div>
          <Link href="/writingsamples/new">
            <Button className="bg-primary hover:bg-primary-hover text-white">New Writing Sample</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_WRITING_SAMPLES.map((sample) => (
            <Link key={sample.id} href={`/writingsamples/${sample.id}`}>
              <Card className="p-6 bg-surface border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                <h3 className="font-semibold text-lg mb-2">{sample.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{sample.prompt}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{sample.wordCount.toLocaleString()} words</span>
                  <span>•</span>
                  <span>{new Date(sample.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
