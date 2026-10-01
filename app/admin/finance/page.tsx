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
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* EN-TÊTE */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Finance
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Gestion des frais d'inscription et des loyers des boutiques
          </p>
        </div>

        {/* CARTES FINANCIÈRES */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              Inscriptions encaissées
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900 sm:text-2xl">
              {formatFC(inscriptionsPayees)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              Loyers encaissés
            </p>

            <p className="mt-2 text-lg font-bold text-slate-900 sm:text-2xl">
              {formatFC(loyersPayes)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              Total encaissé
            </p>

            <p className="mt-2 text-lg font-bold text-emerald-600 sm:text-2xl">
              {formatFC(totalCollecte)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
              Total à collecter
            </p>

            <p className="mt-2 text-lg font-bold text-red-600 sm:text-2xl">
              {formatFC(totalACollecter)}
            </p>
          </div>

        </div>

        {/* TABLEAU */}
        <section className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* TITRE DU TABLEAU */}
          <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Situation des boutiques
            </h2>

            <p className="text-xs text-slate-500 sm:text-sm">
              Période actuelle : {moisActuel}
            </p>
          </div>

          {/* CONTENEUR DU TABLEAU */}
          <div className="w-full overflow-x-auto">

            <table className="min-w-[850px] w-full border-collapse text-sm">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="whitespace-nowrap px-5 py-4 text-left font-semibold text-slate-600">
                    Boutique
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 text-left font-semibold text-slate-600">
                    Vendeur
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 text-center font-semibold text-slate-600">
                    Inscription
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 text-center font-semibold text-slate-600">
                    Loyer
                  </th>

                  <th className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-600">
                    Total payé
                  </th>

                </tr>
              </thead>

              <tbody>

                {lignes.map(
                  ({
                    vendeur,
                    inscriptionPayee,
                    loyerPayee,
                  }) => (

                    <tr
                      key={vendeur.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >

                      {/* BOUTIQUE */}
                      <td className="px-5 py-4">
                        <div className="whitespace-nowrap font-semibold text-slate-900">
                          {vendeur.nomBoutique}
                        </div>

                        <div className="mt-1 whitespace-nowrap text-xs text-slate-400">
                          {vendeur.telephone}
                        </div>
                      </td>

                      {/* VENDEUR */}
                      <td className="px-5 py-4">
                        <div className="whitespace-nowrap text-slate-700">
                          {vendeur.user?.nom || "—"}
                        </div>
                      </td>

                      {/* INSCRIPTION */}
                      <td className="px-5 py-4 text-center">

                        {inscriptionPayee ? (
                          <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Payé
                          </span>
                        ) : (
                          <span className="inline-flex whitespace-nowrap rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Impayé
                          </span>
                        )}

                      </td>

                      {/* LOYER */}
                      <td className="px-5 py-4 text-center">

                        {loyerPayee ? (
                          <span className="inline-flex whitespace-nowrap rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Payé
                          </span>
                        ) : (
                          <span className="inline-flex whitespace-nowrap rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Impayé
                          </span>
                        )}

                      </td>

                      {/* TOTAL */}
                      <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                        {formatFC(
                          (inscriptionPayee
                            ? FRAIS_INSCRIPTION
                            : 0) +
                            (loyerPayee
                              ? LOYER_MENSUEL
                              : 0)
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* AUCUN VENDEUR */}
          {vendeurs.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Aucun vendeur enregistré.
            </div>
          )}

          {/* INDICATION MOBILE */}
          {vendeurs.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-3 text-center text-xs text-slate-400 sm:hidden">
              Faites glisser le tableau horizontalement pour voir les autres colonnes.
            </div>
          )}

        </section>

      </div>
    </main>
  );
                      }
