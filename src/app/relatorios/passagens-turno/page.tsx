import { buscarHistoricoPassagensTurno } from "@/app/passagem-turno/actions";
import TabelaPassagensTurno from "@/components/relatorios/TabelaPassagensTurno";

export default async function HistoricoPassagensTurnoPage() {
  const passagens = await buscarHistoricoPassagensTurno();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Histórico de Passagens</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Todas as passagens de turno registradas, confirmadas ou aguardando confirmação.
        </p>
      </div>
      <TabelaPassagensTurno linhas={passagens} />
    </div>
  );
}
