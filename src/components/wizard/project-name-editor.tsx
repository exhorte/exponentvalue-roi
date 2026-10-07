"use client";

import { useState, useTransition } from "react";
import { renameProjectAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

/** Titre de page éditable : le nom du projet, renommé à la perte de focus. */
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
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={cn(
        "-ml-2 w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 py-0.5 text-2xl font-semibold tracking-tight outline-none transition-[border-color,box-shadow] sm:text-[28px]",
        "hover:border-input focus:border-ring focus:ring-[3px] focus:ring-ring/25",
        isPending && "opacity-60"
      )}
      aria-label="Nom du projet"
      title="Cliquer pour renommer"
    />
  );
}
