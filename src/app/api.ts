function resolveApiUrl(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured && configured.trim().length > 0) return configured;

  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const localHost = hostname === "localhost" || hostname === "127.0.0.1";
    if (localHost) return "http://127.0.0.1:3000";
    return `${protocol}//${hostname}:3000`;
  }

  return "http://127.0.0.1:3000";
}

const API_URL = resolveApiUrl();

type ApiOptions = RequestInit & { token?: string };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, ...request } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...request,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(body.message) ? body.message[0] : body.message;
    throw new Error(message ?? "Não foi possível concluir esta ação.");
  }
  return body as T;
}

export type Session = {
  accessToken: string;
  user: { id: string; name: string; email: string; role: string; emailVerified: boolean };
};