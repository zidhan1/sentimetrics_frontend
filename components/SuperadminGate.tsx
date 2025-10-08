"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/hooks/useUser";

export default function SuperadminGate({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return; // tunggu load
    if (user.role !== "superadmin") router.replace("/dashboard");
  }, [user, router]);

  if (!user) return null; // skeleton optional
  if (user.role !== "superadmin") return null;

  return <>{children}</>;
}
