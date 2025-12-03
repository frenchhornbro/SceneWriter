import { serverPort, serverURL } from "./envAccess"

type Method = "GET" | "POST" | "PUT" | "DELETE"

export async function serverRequest(
  path: string,
  body: Record<PropertyKey, unknown>,
  method: Method,
  onOkay: (response: Response) => Promise<any> = async (_response: Response) => {},
  onError: (error: unknown) => Promise<any> = async (_error: unknown) => {},
  onFinally: () => Promise<any> = async () => {}
) {
  try {
    const fullURL = `${serverURL}:${serverPort}/${path}`
    const urlRegex = /^(https?:\/\/)?[a-zA-Z0-9.-]+(:\d+)?\/.*$/
    if (!urlRegex.test(fullURL)) {
      throw new Error(`SERVER_URL is not a valid URL: ${fullURL}`)
    }
    const response = await fetch(fullURL, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: method === "GET" ? undefined : JSON.stringify(body),
    })

    if (response.ok) {
      await onOkay(response)
    }
    else {
      const errorText = (await response.json().catch(() => null))?.["error"] || "No error message"
      throw new Error(`Server responded with status ${response.status}: ${JSON.stringify(errorText)}`)
    }
  } catch (error) {
    console.log("An error occurred:", error);
    await onError(error)
  } finally {
    await onFinally()
  }
}