"use client";

import { useRouter } from "next/navigation";

import { signOut } from "@/lib/auth-client";

/**
 * Hook to handle user logout
 * @returns handleLogout function
 */
export function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/auth/v1/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { handleLogout };
}
