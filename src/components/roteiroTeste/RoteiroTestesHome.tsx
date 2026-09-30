"use client";

import { useState, useTransition } from "react";
import IniciarRoteiroTesteForm from "./IniciarRoteiroTesteForm";
import ExecucoesRecentesTable from "./ExecucoesRecentesTable";
import ExecucaoDetalheModal from "./ExecucaoDetalheModal";
import { listarExecucoesRoteiroTeste, type ExecucaoRoteiroTesteLinha } from "@/app/roteiro-testes/actions";

type RoteiroTestesHomeProps = {
  execucoesIniciais: ExecucaoRoteiroTesteLinha[];
};

export default function RoteiroTestesHome({ execucoesIniciais }: RoteiroTestesHomeProps) {
  const [execucoes, setExecucoes] = useState(execucoesIniciais);
  const [detalheAberto, setDetalheAberto] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function recarregar() {
    startTransition(async () => {
      const novas = await listarExecucoesRoteiroTeste();
      setExecucoes(novas);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <IniciarRoteiroTesteForm onExecucaoSalva={recarregar} />

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Execuções recentes</h2>
        <ExecucoesRecentesTable execucoes={execucoes} onSelecionar={setDetalheAberto} />
      </div>

      {detalheAberto && (
        <ExecucaoDetalheModal execucaoId={detalheAberto} onClose={() => setDetalheAberto(null)} />
      )}
    </div>
  );
}
