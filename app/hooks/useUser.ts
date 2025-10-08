"use client";

import { useEffect, useState } from "react";

export type AppUser = { id: string; username: string; role: string };

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  return user;
}
