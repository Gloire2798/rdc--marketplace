import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* EN-TÊTE */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Finance
          </h1>

          <p className="mt-1 text-gray-500">
            Gestion des frais d'inscription et des loyers des boutiques
          </p>
        </div>

        {/* RÉSUMÉ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Inscriptions encaissées
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatFC(inscriptionsPayees)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Loyers encaissés
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {formatFC(loyersPayes)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total encaissé
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatFC(totalCollecte)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total à collecter
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {formatFC(totalACollecter)}
            </p>
          </div>

        </div>

        {/* SITUATION DES BOUTIQUES */}
        <div className="mt-8 rounded-2xl bg-white shadow-sm">

          <div className="border-b p-5">
            <h2 className="text-xl font-bold text-gray-900">
              Situation des boutiques
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Période actuelle : {moisActuel}
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr>
                  <th className="px-5 py-4">
                    Boutique
                  </th>

                  <th className="px-5 py-4">
                    Vendeur
                  </th>

                  <th className="px-5 py-4">
                    Inscription
                  </th>

                  <th className="px-5 py-4">
                    Loyer
                  </th>

                  <th className="px-5 py-4">
                    Total payé
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {lignes.map(
                  ({
                    vendeur,
                    inscriptionPayee,
                    loyerPayee,
                  }) => (
                    <tr
                      key={vendeur.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-5 py-4 font-medium text-gray-900">
                        {vendeur.nomBoutique}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {vendeur.user?.nom || "—"}
                      </td>

                      <td className="px-5 py-4">

                        {inscriptionPayee ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            Payé
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Impayé
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4">

                        {loyerPayee ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            Payé
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Impayé
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4 font-semibold">
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

          {vendeurs.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              Aucun vendeur enregistré.
            </div>
          )}

        </div>

      </div>
    </main>
  );
      }
