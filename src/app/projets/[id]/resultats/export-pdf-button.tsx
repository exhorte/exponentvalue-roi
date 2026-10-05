"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Simple lien de téléchargement vers la route API qui génère le PDF à la
 * volée (voir `src/app/api/projets/[id]/pdf/route.ts`). Pas de bibliothèque
 * client nécessaire : le navigateur télécharge directement la réponse.
 */
export function ExportPdfButton({ projectId }: { projectId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button asChild onClick={() => setIsLoading(true)}>
      <a href={`/api/projets/${projectId}/pdf`} target="_blank" rel="noopener noreferrer">
        <FileDown />
        {isLoading ? "Génération…" : "Exporter en PDF"}
      </a>
    </Button>
  );
}
