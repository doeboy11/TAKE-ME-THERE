"use client";

import { AuthProvider } from "@/lib/auth";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Recover automatically from transient Next.js chunk loading errors
  React.useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason: any = event?.reason;
      const message = reason?.message || "";
      const name = reason?.name || "";
      const isChunkError =
        name === "ChunkLoadError" || /ChunkLoadError/i.test(message) || /Loading chunk [\d]+ failed/i.test(message);
      if (isChunkError) {
        // Attempt a hard reload to fetch fresh chunks
        if (typeof window !== "undefined") {
          // Avoid infinite loops by only trying once per session
          const key = "__chunk_reload_once__";
          if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            window.location.reload();
          }
        }
      }
    };

    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
