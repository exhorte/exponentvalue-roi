"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import type { WizardStep } from "@/lib/wizard-steps";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav, type SidebarProject } from "@/components/layout/sidebar-nav";

/** Bouton hamburger (mobile/tablette) qui ouvre la barre latérale dans un tiroir. */
export function MobileNav({
  project,
  activeStep,
}: {
  project?: SidebarProject;
  activeStep?: WizardStep;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 gap-0 bg-sidebar p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">
          Tableau de bord, nouveau projet et étapes de l&rsquo;assistant.
        </SheetDescription>
        <SidebarNav project={project} activeStep={activeStep} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
