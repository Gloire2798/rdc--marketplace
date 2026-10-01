import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FRAIS_INSCRIPTION = 25000;
const LOYER_MENSUEL = 15000;

function formatFC(montant: number) {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FC";
}

export default async function FinancePage() {
  const session = await getSession();

  if (session?.role !== "ADMIN") {
    redirect("/vendeur/connexion");
  }

  const maintenant = new Date();

  const moisActuel = `${maintenant.getFullYear()}-${String(
    maintenant.getMonth() + 1
  ).padStart(2, "0")}`;

  const vendeurs = await prisma.vendeur.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      paiementsFinance: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  let inscriptionsPayees = 0;
  let loyersPayes = 0;
  let totalCollecte = 0;
  let totalACollecter = 0;

  const lignes = vendeurs.map((vendeur) => {
    const inscription = vendeur.paiementsFinance.find(
      (p) => p.type === "INSCRIPTION"
    );

    const loyerActuel = vendeur.paiementsFinance.find(
      (p) => p.type === "LOYER" && p.periode === moisActuel
    );

    const inscriptionPayee = inscription?.statut === "PAYE";
    const loyerPayee = loyerActuel?.statut === "PAYE";

    if (inscriptionPayee) {
      inscriptionsPayees += FRAIS_INSCRIPTION;
      totalCollecte += FRAIS_INSCRIPTION;
    } else {
      totalACollecter += FRAIS_INSCRIPTION;
    }

    if (loyerPayee) {
      loyersPayes += LOYER_MENSUEL;
      totalCollecte += LOYER_MENSUEL;
    } else {
      totalACollecter += LOYER_MENSUEL;
    }

    return {
      vendeur,
      inscriptionPayee,
      loyerPayee,
    };
  });

  return (
    <main className="min-h-screen bg-slate-50 p-3 text-slate-900 sm:p-5">
      <div className="mx-auto max-w-[1400px]">

        {/* EN-TÊTE */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Finance
            </h1>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Suivi des inscriptions et des loyers
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
            {moisActuel}
          </div>
        </div>

        {/* RÉSUMÉ FINANCIER */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">

          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500">
              Inscriptions
            </p>

            <p className="mt-1 text-base font-semibold sm:text-lg">
              {formatFC(inscriptionsPayees)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500">
              Loyers
            </p>

            <p className="mt-1 text-base font-semibold sm:text-lg">
              {formatFC(loyersPayes)}
            </p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 shadow-sm">
            <p className="text-[11px] font-medium text-emerald-700">
              Total encaissé
            </p>

            <p className="mt-1 text-base font-bold text-emerald-700 sm:text-lg">
              {formatFC(totalCollecte)}
            </p>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 shadow-sm">
            <p className="text-[11px] font-medium text-red-700">
              À collecter
            </p>

            <p className="mt-1 text-base font-bold text-red-700 sm:text-lg">
              {formatFC(totalACollecter)}
            </p>
          </div>

        </div>

        {/* TABLEAU */}
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

          {/* BARRE DU TABLEAU */}
          <div className="flex items-center justify-between border-b border-slate-200 px-3 py-3 sm:px-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                Situation financière des boutiques
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Inscription : 25 000 FC · Loyer mensuel : 15 000 FC
              </p>
            </div>

            <span className="hidden rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 sm:inline-block">
              {vendeurs.length} boutique{vendeurs.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* ZONE À DÉFILEMENT VERTICAL UNIQUEMENT */}
          <div className="max-h-[65vh] overflow-y-auto overflow-x-hidden">

            <table className="w-full table-fixed border-collapse text-xs sm:text-sm">

              {/* EN-TÊTE FIXE */}
              <thead className="sticky top-0 z-10 bg-slate-100">
                <tr className="border-b border-slate-200">

                  <th className="w-[24%] px-3 py-2.5 text-left font-semibold text-slate-600 sm:px-4">
                    Boutique
                  </th>

                  <th className="w-[22%] px-3 py-2.5 text-left font-semibold text-slate-600 sm:px-4">
                    Vendeur
                  </th>

                  <th className="w-[18%] px-2 py-2.5 text-center font-semibold text-slate-600">
                    Inscription
                  </th>

                  <th className="w-[18%] px-2 py-2.5 text-center font-semibold text-slate-600">
                    Loyer
                  </th>

                  <th className="w-[18%] px-3 py-2.5 text-right font-semibold text-slate-600 sm:px-4">
                    Total payé
                  </th>

                </tr>
              </thead>

              <tbody>

                {lignes.map(
                  ({ vendeur, inscriptionPayee, loyerPayee }) => (
                    <tr
                      key={vendeur.id}
                      className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50"
                    >

                      {/* BOUTIQUE */}
                      <td className="px-3 py-3 sm:px-4">
                        <div
                          className="truncate font-medium text-slate-900"
                          title={vendeur.nomBoutique}
                        >
                          {vendeur.nomBoutique}
                        </div>

                        <div
                          className="mt-0.5 truncate text-[10px] text-slate-400 sm:text-[11px]"
                          title={vendeur.telephone}
                        >
                          {vendeur.telephone}
                        </div>
                      </td>

                      {/* VENDEUR */}
                      <td className="px-3 py-3 sm:px-4">
                        <div
                          className="truncate text-slate-700"
                          title={vendeur.user?.nom || ""}
                        >
                          {vendeur.user?.nom || "—"}
                        </div>
                      </td>

                      {/* INSCRIPTION */}
                      <td className="px-2 py-3 text-center">
                        {inscriptionPayee ? (
                          <span className="inline-flex min-w-[54px] justify-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            Payé
                          </span>
                        ) : (
                          <span className="inline-flex min-w-[54px] justify-center rounded-md bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 ring-1 ring-red-200">
                            Impayé
                          </span>
                        )}
                      </td>

                      {/* LOYER */}
                      <td className="px-2 py-3 text-center">
                        {loyerPayee ? (
                          <span className="inline-flex min-w-[54px] justify-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            Payé
                          </span>
                        ) : (
                          <span className="inline-flex min-w-[54px] justify-center rounded-md bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-700 ring-1 ring-red-200">
                            Impayé
                          </span>
                        )}
                      </td>

                      {/* TOTAL */}
                      <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-slate-800 sm:px-4">
                        {formatFC(
                          (inscriptionPayee ? FRAIS_INSCRIPTION : 0) +
                            (loyerPayee ? LOYER_MENSUEL : 0)
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

            {/* AUCUN VENDEUR */}
            {vendeurs.length === 0 && (
              <div className="px-4 py-12 text-center text-xs text-slate-500">
                Aucun vendeur enregistré.
              </div>
            )}

          </div>

          {/* PIED DU TABLEAU */}
          {vendeurs.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 sm:px-4">
              <span>
                {vendeurs.length} boutique{vendeurs.length > 1 ? "s" : ""}
              </span>

              <span>
                Défilement vertical pour consulter la liste
              </span>
            </div>
          )}

        </section>

      </div>
    </main>
  );
}
