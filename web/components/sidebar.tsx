"use client"

import Link from "next/link"
import { BookOpen, PenTool, Trash2, ChevronRight, ChevronLeft, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  const [isExpanded, setIsExpanded] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-expanded")
    if (savedState !== null) {
      setIsExpanded(savedState === "true")
    }

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      // Default to dark mode
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    localStorage.setItem("sidebar-expanded", String(newState))
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  if (isHomePage) {
    return null
  }

  const isStoriesActive = pathname.startsWith("/stories")
  const isWritingSamplesActive = pathname.startsWith("/writingsamples")

  return (
    <>
      <aside
        className={`sticky top-16 left-0 h-[calc(100vh-4rem)] bg-surface border-r border-border transition-all duration-300 flex-shrink-0 flex flex-col ${
          isExpanded ? "w-64" : "w-12"
        }`}
      >
        <button
          onClick={toggleSidebar}
          className="w-full h-12 flex items-center justify-center border-b border-border hover:bg-surface-light transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <>
            <nav className="p-4 space-y-2 flex-1">
              <Link
                href="/stories"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-light transition-colors cursor-pointer ${
                  isStoriesActive ? "text-white" : "text-muted-foreground"
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Stories</span>
              </Link>

              <Link
                href="/writingsamples"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-light transition-colors cursor-pointer ${
                  isWritingSamplesActive ? "text-white" : "text-muted-foreground"
                }`}
              >
                <PenTool className="w-5 h-5" />
                <span className="font-medium">Writing Samples</span>
              </Link>

              <button
                disabled
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground cursor-not-allowed w-full"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Trash</span>
              </button>
            </nav>

            <div className="p-4 border-t border-border">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-light transition-colors cursor-pointer w-full text-muted-foreground"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
