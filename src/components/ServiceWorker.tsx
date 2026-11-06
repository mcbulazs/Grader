"use client";

import { useEffect } from "react";

/** Registers /sw.js so the app opens even with weak school Wi-Fi. */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
