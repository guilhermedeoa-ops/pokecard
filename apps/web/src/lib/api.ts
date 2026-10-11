export async function api<T>(path: string, body?: unknown, method = body === undefined ? "GET" : "POST"): Promise<T> {
  const response = await fetch((process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api") + path, {
    method, credentials: "include", cache: "no-store",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 429) throw new Error("Muitas tentativas. Aguarde um minuto e tente novamente.");
    throw new Error(Array.isArray(data.message) ? data.message.join("; ") : data.message ?? "Não foi possível concluir.");
  }
  return data as T;
}
