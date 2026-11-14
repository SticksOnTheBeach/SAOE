// src/api/http.ts
export async function readError(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const body = JSON.parse(text)
    return body.message ?? body.error ?? `Erreur ${res.status}`
  } catch {
    return text || `Erreur ${res.status}`
  }
}