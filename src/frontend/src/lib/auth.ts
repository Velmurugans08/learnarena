export function getUserId(): string | null {
  return localStorage.getItem("learnarena_userId");
}

export function getUsername(): string {
  return localStorage.getItem("learnarena_username") || "Player";
}

export function setAuth(userId: string, username: string) {
  localStorage.setItem("learnarena_userId", userId);
  localStorage.setItem("learnarena_username", username);
}

export function clearAuth() {
  localStorage.removeItem("learnarena_userId");
  localStorage.removeItem("learnarena_username");
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getAvatarInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

export function getLevelFromXP(xp: bigint): number {
  return Math.floor(Number(xp) / 100) + 1;
}
