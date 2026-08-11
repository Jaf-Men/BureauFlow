const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3000";

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