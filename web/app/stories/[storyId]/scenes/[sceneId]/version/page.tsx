"use client"

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RedirectToSceneVersionPage() {
  const router = useRouter()
  const pathname = usePathname()
  console.log("Redirecting from pathname:", pathname)

  useEffect(() => {
    if (!pathname) return
    if (pathname.endsWith("/1")) return
    router.replace(`${pathname}/1`)
  }, [pathname, router])

  return (
    <div>
      Redirecting...
    </div>
  )
}