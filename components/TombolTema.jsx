"use client";

import ThemeToggle from "@/components/ThemeToggle";

/**
 * US-25: Mode gelap
 * Tombol toggle terang/gelap (alias untuk ThemeToggle)
 */
export default function TombolTema(props) {
  return <ThemeToggle {...props} />;
}

export { ThemeToggle };
