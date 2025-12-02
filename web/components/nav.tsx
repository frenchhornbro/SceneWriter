import Link from "next/link"
import { PenTool } from "lucide-react"

export function Nav() {
  return (
    <nav className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <PenTool className="w-6 h-6 text-primary" />
          <span className="text-balance">SceneWriter</span>
        </Link>
      </div>
    </nav>
  )
}
