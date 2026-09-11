"use client";

import { useState, useTransition } from "react";
import { renameProjectAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function ProjectNameEditor({ id, initialName }: { id: string; initialName: string }) {
  const [name, setName] = useState(initialName);
  const [isPending, startTransition] = useTransition();

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={() => {
        const trimmed = name.trim();
        if (!trimmed) {
          setName(initialName);
          return;
        }
        if (trimmed !== initialName) {
          startTransition(async () => {
            await renameProjectAction(id, trimmed);
          });
        }
      }}
      className={cn(
        "-ml-2 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 py-1 text-lg font-semibold tracking-tight outline-none transition-colors",
        "hover:border-input focus:border-input focus:ring-2 focus:ring-ring",
        isPending && "opacity-60"
      )}
      aria-label="Nom du projet"
    />
  );
}
