import localPath from "./localPath";

const prefix = "/api/signup";

async function request(route: string, unavailable: string, body?: object, signal?: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(prefix + route, {
      method: body ? "POST" : "GET",
      mode: "same-origin",
      redirect: "error",
      cache: "no-store",
      headers: body ? { "Content-Type": "application/json", Accept: "application/json" } : { Accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new Error(unavailable);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || typeof data !== "object") {
    throw new Error(typeof data?.message === "string" ? data.message : unavailable);
  }
  return data;
}

export type Invitation = { organization: string; email: string; role: string };
export async function lookupInvitation(code: string, signal?: AbortSignal): Promise<Invitation> {
  const message = "Invitation lookup is unavailable. Try again later.";
  const data = await request("/invitations/lookup", message, { code }, signal);
  if (![data.organization, data.email, data.role].every(value => typeof value === "string" && value.trim())) throw new Error(message);
  return { organization: data.organization, email: data.email, role: data.role };
}

export async function googleSession(signal: AbortSignal) {
  const data = await request("/session", "Google account verification is unavailable.", undefined, signal);
  if (data.provider !== "google" || data.emailVerified !== true || typeof data.email !== "string" || !data.email.trim() || typeof data.name !== "string") return null;
  return { email: data.email, name: data.name } as { email: string; name: string };
}

export async function sendCode(email: string) {
  const message = "Email verification is unavailable. Try sending a code again later.";
  const data = await request("/verification", message, { email });
  if (typeof data.attemptId !== "string" || !data.attemptId) throw new Error(message);
  return data.attemptId as string;
}

export async function finishSignup(details: { name: string; email: string }, workspace: { organization: string } | { invitationCode: string }, verification: { attemptId: string; code: string; password: string } | { provider: "google" }) {
  const create = "organization" in workspace;
  const message = create ? "Workspace requests are unavailable. Try again later." : "Joining this workspace is unavailable. Try again later.";
  const data = await request(create ? "/requests" : "/join", message, { ...details, ...workspace, ...verification });
  if (create && data.status === "pending") return null;
  const destination = typeof data.workspacePath === "string" && localPath(data.workspacePath);
  if (!create && data.status === "joined" && destination) return destination;
  throw new Error(message);
}
