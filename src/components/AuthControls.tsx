"use client";

import { useRouter } from "next/navigation";

export default function AuthControls({ authed }: { authed: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.refresh();
  }

  if (!authed) {
    return null;
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
    >
      Sign out
    </button>
  );
}
