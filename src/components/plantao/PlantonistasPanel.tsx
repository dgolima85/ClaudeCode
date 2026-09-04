import { buscarPlantaoHoje } from "@/lib/plantao";
import { dataBR } from "@/lib/dataHoraBR";

// Painel só de leitura: mostra quem está de plantão hoje, lido direto da
// planilha do SharePoint (nunca editável por aqui — ver src/lib/plantao.ts).
// Qualquer falha (credencial ausente, Graph fora do ar, planilha com layout
// inesperado) é isolada aqui dentro pra não derrubar a Home inteira.
export default async function PlantonistasPanel() {
  const [ano, mes, dia] = dataBR().split("-");
  const hojeFormatado = `${dia}/${mes}/${ano}`;

  let plantonistas: Awaited<ReturnType<typeof buscarPlantaoHoje>> | null = null;
  let erro: string | null = null;
  try {
    plantonistas = await buscarPlantaoHoje();
  } catch (e) {
    erro = e instanceof Error ? e.message : "Não foi possível carregar o plantão de hoje.";
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Plantonistas de hoje</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">{hojeFormatado}</span>
      </div>

      {erro && <p className="text-xs text-red-600 dark:text-red-400">Não foi possível carregar o plantão: {erro}</p>}

      {plantonistas && plantonistas.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum plantonista cadastrado para hoje.</p>
      )}

      {plantonistas && plantonistas.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 dark:text-gray-500">
                <th className="pb-1.5 pr-3 font-medium">Área</th>
                <th className="pb-1.5 pr-3 font-medium">Analista</th>
                <th className="pb-1.5 font-medium">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {plantonistas.map((p, i) => (
                <tr key={`${p.area}-${p.analista}-${i}`}>
                  <td className="py-1.5 pr-3 text-gray-700 dark:text-gray-300">{p.area}</td>
                  <td className="py-1.5 pr-3 text-gray-700 dark:text-gray-300">{p.analista}</td>
                  <td className="py-1.5 text-gray-500 dark:text-gray-400">{p.telefone || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
