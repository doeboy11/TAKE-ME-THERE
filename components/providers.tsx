"use client";

import { AuthProvider } from "@/lib/auth";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Recover automatically from transient Next.js chunk loading errors
  React.useEffect(() => {
    const reloadOnceIfNeeded = () => {
      if (typeof window === "undefined") return;
      const key = "__chunk_reload_once__";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason: any = event?.reason;
      const message = reason?.message || "";
      const name = reason?.name || "";
      const isChunkError =
        name === "ChunkLoadError" || /ChunkLoadError/i.test(message) || /Loading chunk [\d]+ failed/i.test(message);
      if (isChunkError) reloadOnceIfNeeded();
    };

    const errorHandler = (event: ErrorEvent) => {
      const message = event?.message || "";
      const isChunkError = /ChunkLoadError/i.test(message) || /Loading chunk [\d]+ failed/i.test(message);
      if (isChunkError) reloadOnceIfNeeded();
    };

    window.addEventListener("unhandledrejection", rejectionHandler);
    window.addEventListener("error", errorHandler);
    return () => {
      window.removeEventListener("unhandledrejection", rejectionHandler);
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
