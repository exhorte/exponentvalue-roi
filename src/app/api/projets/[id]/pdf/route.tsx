import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getProject } from "@/lib/actions";
import { BusinessCaseDocument } from "@/lib/pdf/business-case-document";

// @react-pdf/renderer fait du rendu Node (mise en page, polices standard
// PDF) — nécessite le runtime Node.js, pas Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project || !project.results) {
    return NextResponse.json({ error: "Projet introuvable ou pas encore calculé." }, { status: 404 });
  }

  const buffer = await renderToBuffer(<BusinessCaseDocument project={project} />);
  const filename = `business-case-${project.nom.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

  // Node `Buffer` structurally satisfies `BodyInit` at runtime (it IS a
  // Uint8Array), mais TypeScript n'accepte pas le type `Buffer` du DOM lib
  // tel quel ici — on l'enveloppe dans un `Uint8Array` "pur" pour satisfaire
  // le typage sans copie superflue.
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
