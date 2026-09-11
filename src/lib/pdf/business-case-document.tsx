import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { ProjectRow } from "@/lib/wizard-steps";
import type { Recommandation } from "@/lib/calc/types";

// Désactive la césure automatique : sur des libellés courts en majuscules
// dans des encarts étroits (ex. "DÉLAI DE RÉCUPÉRATION"), la césure par
// défaut de react-pdf coupait des mots au milieu de façon peu soignée pour
// un document destiné à un comité de direction.
Font.registerHyphenationCallback((word) => [word]);

/**
 * Le "Générateur de Business Case" du MVP : une synthèse exécutive PDF,
 * générée à la volée à partir des résultats déjà calculés (voir la route
 * `app/api/projets/[id]/pdf/route.tsx`). Polices standard PDF uniquement
 * (Helvetica) — aucune police téléchargée, donc aucune dépendance réseau au
 * moment du rendu.
 */

const COLORS = {
  text: "#18181b",
  muted: "#6b7280",
  border: "#e4e4e7",
  panel: "#f4f4f5",
  success: "#15803d",
  warning: "#b45309",
  destructive: "#b91c1c",
};

const RECO_COLOR: Record<Recommandation, string> = {
  GO: COLORS.success,
  EVALUER: COLORS.warning,
  STOP: COLORS.destructive,
};

const RECO_LABEL: Record<Recommandation, string> = {
  GO: "GO",
  EVALUER: "À ÉVALUER",
  STOP: "STOP",
};

/**
 * `Intl.NumberFormat("fr-FR")` sépare les milliers avec U+202F (narrow
 * no-break space) — un caractère absent de l'encodage standard des polices
 * PDF (Helvetica/WinAnsi). Sans ce nettoyage, react-pdf affiche un glyphe de
 * remplacement à la place (ex. "28800" devient "28/800"). On repasse tous
 * les espaces "spéciaux" en espace normal avant de les poser dans un <Text>.
 */
function sanitizeForPdf(s: string) {
  return s.replace(/[  ]/g, " ");
}

function euros(v: number) {
  return sanitizeForPdf(
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number.isFinite(v) ? v : 0)
  );
}

function pct(v: number, decimals = 1) {
  return sanitizeForPdf(
    new Intl.NumberFormat("fr-FR", {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Number.isFinite(v) ? v : 0)
  );
}

function months(v: number | null) {
  if (!Number.isFinite(v)) return "Non atteint sur 3 ans";
  return sanitizeForPdf(
    `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(v as number)} mois`
  );
}

const styles = StyleSheet.create({
  page: {
    paddingVertical: 36,
    paddingHorizontal: 40,
    fontSize: 10,
    color: COLORS.text,
    fontFamily: "Helvetica",
  },
  eyebrow: { fontSize: 9, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1 },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 2 },
  subtitle: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 4,
    color: "#ffffff",
  },
  badgeText: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#ffffff" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  row: { flexDirection: "row", gap: 10 },
  box: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 4, padding: 10 },
  boxLabel: { fontSize: 8, color: COLORS.muted, marginBottom: 4, textTransform: "uppercase" },
  boxValue: { fontSize: 15, fontFamily: "Helvetica-Bold" },
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 4 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  trLast: { flexDirection: "row" },
  th: {
    flex: 1,
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    backgroundColor: COLORS.panel,
  },
  thRight: {
    flex: 1,
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    backgroundColor: COLORS.panel,
    textAlign: "right",
  },
  td: { flex: 1, padding: 6, fontSize: 9 },
  tdRight: { flex: 1, padding: 6, fontSize: 9, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    lineHeight: 1.4,
    color: COLORS.muted,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
});

export function BusinessCaseDocument({ project }: { project: ProjectRow }) {
  const r = project.results!;
  const roiAn3 = r.roiParAnnee.at(-1) ?? 0;
  const vanAn3 = r.vanCumuleeParAnnee.at(-1) ?? 0;
  const reco = project.recommandation ?? "STOP";

  return (
    <Document title={`Business Case - ${project.nom}`} author="Calculateur ROI ExponentValue">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>ExponentValue — Business Case IA</Text>
            <Text style={styles.h1}>{project.nom}</Text>
            {project.secteur ? <Text style={styles.subtitle}>{project.secteur}</Text> : null}
            <Text style={styles.subtitle}>
              Généré le{" "}
              {new Date(r.calculeLe).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: RECO_COLOR[reco] }]}>
            <Text style={styles.badgeText}>
              {RECO_LABEL[reco]} — {r.score.toFixed(1)}/20
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synthèse financière (horizon 3 ans)</Text>
          <View style={styles.row}>
            <View style={styles.box}>
              <Text style={styles.boxLabel}>ROI net (An 3)</Text>
              <Text style={styles.boxValue}>{pct(roiAn3 / 100)}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxLabel}>VAN cumulée (An 3)</Text>
              <Text style={styles.boxValue}>{euros(vanAn3)}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxLabel}>Délai de récupération</Text>
              <Text style={styles.boxValue}>{months(r.delaiRecuperationMois)}</Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxLabel}>Investissement initial</Text>
              <Text style={styles.boxValue}>{euros(r.capexTotal)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Le problème vs. la solution</Text>
          <View style={styles.row}>
            <View style={styles.box}>
              <Text style={styles.boxLabel}>Coût actuel du problème (par an)</Text>
              <Text style={[styles.boxValue, { color: COLORS.destructive }]}>
                {euros(r.coutProblemeAnnuel)}
              </Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxLabel}>Bénéfice réaliste attendu (par an)</Text>
              <Text style={[styles.boxValue, { color: COLORS.success }]}>
                {euros(r.beneficeRealisteAnnuel)}
              </Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxLabel}>Coûts récurrents (OPEX / an)</Text>
              <Text style={styles.boxValue}>{euros(r.opexAnnuelTotal)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flux de trésorerie actualisés</Text>
          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={styles.th}>Période</Text>
              <Text style={styles.thRight}>Flux brut</Text>
              <Text style={styles.thRight}>Flux actualisé</Text>
              <Text style={styles.thRight}>Cumul actualisé</Text>
            </View>
            {r.cashFlows.map((c, i) => (
              <View key={c.annee} style={i === r.cashFlows.length - 1 ? styles.trLast : styles.tr}>
                <Text style={styles.td}>
                  {c.annee === 0 ? "Investissement (An 0)" : `Année ${c.annee}`}
                </Text>
                <Text style={styles.tdRight}>{euros(c.fluxBrut)}</Text>
                <Text style={styles.tdRight}>{euros(c.fluxActualise)}</Text>
                <Text style={styles.tdRight}>{euros(c.cumulActualise)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score ARIA — détail</Text>
          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={styles.th}>Critère</Text>
              <Text style={styles.thRight}>Points</Text>
            </View>
            <View style={styles.tr}>
              <Text style={styles.td}>ROI à 3 ans (/8)</Text>
              <Text style={styles.tdRight}>{r.scoreDetail.pointsRoi.toFixed(1)}</Text>
            </View>
            <View style={styles.tr}>
              <Text style={styles.td}>Vitesse de retour (/6)</Text>
              <Text style={styles.tdRight}>{r.scoreDetail.pointsPayback.toFixed(1)}</Text>
            </View>
            <View style={styles.tr}>
              <Text style={styles.td}>Confiance dans les chiffres (/4)</Text>
              <Text style={styles.tdRight}>{r.scoreDetail.pointsConfiance.toFixed(1)}</Text>
            </View>
            <View style={styles.trLast}>
              <Text style={styles.td}>Faisabilité technique (/2)</Text>
              <Text style={styles.tdRight}>{r.scoreDetail.pointsFaisabilite.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Méthodologie : coûts et bénéfices déclaratifs, ajustés par des coefficients de réalisme
          documentés par catégorie puis par un coefficient de maturité (fiabilité des données,
          simplicité du problème, faisabilité technique). Flux actualisés au taux de{" "}
          {project.inputs.couts.tauxActualisation}% par an défini par l&rsquo;utilisateur. Document
          généré automatiquement par le Calculateur ROI interne d&rsquo;ExponentValue — à valider
          avant présentation en comité de direction.
        </Text>
      </Page>
    </Document>
  );
}
