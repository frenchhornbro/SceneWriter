import { serverPort, serverURL } from "./envAccess"

type Method = "GET" | "POST" | "PUT" | "DELETE"

export async function serverRequest(
  path: string,
  body: Record<PropertyKey, unknown>,
  method: Method,
  onOkay: (response: Response) => Promise<any>,
  onError: (error: unknown) => Promise<any>,
  onFinally: () => Promise<any>
) {
  try {
    const fullURL = `${serverURL}:${serverPort}/${path}`
    const urlRegex = /^(https?:\/\/)?[a-zA-Z0-9.-]+(:\d+)?\/.*$/
    console.log("Full URL:", fullURL)
    if (!urlRegex.test(fullURL)) {
      throw new Error(`SERVER_URL is not a valid URL: ${fullURL}`)
    }
    const response = await fetch(fullURL, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      await onOkay(response)
    }
  } catch (error) {
    await onError(error)
  } finally {
    await onFinally()
  }
}