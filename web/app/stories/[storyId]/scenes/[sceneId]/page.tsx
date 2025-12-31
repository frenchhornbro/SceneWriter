"use client"

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { serverRequest } from "@/lib/requests";
import { Loading } from "@/components/loading";

export default function RedirectToSceneVersionPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const storyId = params.storyId as string
  const sceneId = params.sceneId as string
  const [isLoading, setIsLoading] = useState(true)
  console.log("Redirecting from pathname:", pathname)

  useEffect(() => {
    async function redirectToMostRecentVersion() {
      setIsLoading(true)
      await serverRequest(`api/story/${storyId}/scene/${sceneId}/latestVersion`, {}, "GET",
        async (response) => {
          const data = await response.json()
          router.replace(`${pathname}/version/${data.latestVersion}`)
        },
        async (error) => {
          console.error("Failed to get most recent version:", error)
          router.replace(`${pathname}/version/1`)
        },
        async () => {
          setIsLoading(false)
        }
      )
    }
    if (!pathname) return
    if (pathname.endsWith("/version/1")) return
    redirectToMostRecentVersion()
  }, [pathname, router])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div>
      Redirecting...
    </div>
  )
}