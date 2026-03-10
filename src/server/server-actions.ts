"use server";

import { cookies, headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getValueFromCookie(key: string): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value;
}

export async function setValueToCookie(
  key: string,
  value: string,
  options: { path?: string; maxAge?: number } = {},
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(key, value, {
    path: options.path ?? "/",
    maxAge: options.maxAge ?? 60 * 60 * 24 * 7, // default: 7 days
  });
}

export async function getPreference<T extends string>(key: string, allowed: readonly T[], fallback: T): Promise<T> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(key);
  const value = cookie ? cookie.value.trim() : undefined;
  return allowed.includes(value as T) ? (value as T) : fallback;
}

// Auth Actions

/**
 * Get the current authenticated user in server components
 * @returns User object or null if not authenticated
 * @example
 * ```tsx
 * // In a server component
 * export default async function Dashboard() {
 *   const user = await getCurrentUser();
 *   if (!user) redirect("/auth/v1/login");
 *   return <div>Welcome {user.name}</div>;
 * }
 * ```
 */
export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session?.user ?? null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
