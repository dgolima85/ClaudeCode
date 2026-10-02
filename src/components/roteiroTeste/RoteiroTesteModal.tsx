"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import Modal from "@/components/ui/Modal";
import { TAMANHO_MAXIMO_EVIDENCIA_BYTES, formatarTamanhoArquivo } from "@/lib/evidencias";
import { ROTINA_TESTE_LABELS, type RotinaTeste } from "@/lib/roteiroTeste/rotinas";
import { RESULTADOS_TESTE, RESULTADO_TESTE_LABELS, type ResultadoTeste } from "@/lib/roteiroTeste/resultado";
import { BRANDS_TESTE, type BrandTeste } from "@/lib/roteiroTeste/brand";
import { DISPOSITIVOS_TESTE, type DispositivoTeste } from "@/lib/roteiroTeste/dispositivos";
import { DEFINICOES_ROTEIRO_TESTE, todosPassos, type PassoRoteiroTeste } from "@/lib/roteiroTeste/definicoes";
import { criarExecucaoRoteiroTeste } from "@/app/roteiro-testes/actions";

type RoteiroTesteModalProps = {
  rotina: RotinaTeste;
  onClose: () => void;
  onSalvo: () => void;
};

const CLASSE_SELECT =
  "rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:[color-scheme:dark]";
const CLASSE_INPUT =
  "rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:text-gray-100";

function SelectResultado({
  value,
  onChange,
}: {
  value: ResultadoTeste | "";
  onChange: (valor: ResultadoTeste) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ResultadoTeste)}
      className={`${CLASSE_SELECT} shrink-0 sm:w-44`}
    >
      <option value="" disabled>
        Selecione
      </option>
      {RESULTADOS_TESTE.map((r) => (
        <option key={r} value={r}>
          {RESULTADO_TESTE_LABELS[r]}
        </option>
      ))}
    </select>
  );
}

function PassoCard({
  passo,
  valor,
  onChange,
}: {
  passo: PassoRoteiroTeste;
  valor: ResultadoTeste | "";
  onChange: (valor: ResultadoTeste) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-start sm:justify-between dark:border-gray-700">
      <div className="min-w-0 flex-1">
        <span className="font-mono text-[11px] font-medium text-gray-400 dark:text-gray-500">{passo.codigo}</span>
        <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{passo.descricao}</p>
      </div>
      <SelectResultado value={valor} onChange={onChange} />
    </div>
  );
}

export default function RoteiroTesteModal({ rotina, onClose, onSalvo }: RoteiroTesteModalProps) {
  const definicao = DEFINICOES_ROTEIRO_TESTE[rotina];

  const [brand, setBrand] = useState<BrandTeste | "">("");
  const [versao, setVersao] = useState("");
  const [dispositivos, setDispositivos] = useState<DispositivoTeste[]>([]);
  const [dataExecucao, setDataExecucao] = useState("");
  const [respostas, setRespostas] = useState<Record<string, ResultadoTeste | "">>({});
  const [anotacao, setAnotacao] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [avisoEvidencias, setAvisoEvidencias] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  if (!definicao) {
    return (
      <Modal open onClose={onClose} title={ROTINA_TESTE_LABELS[rotina]}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          O roteiro de &quot;{ROTINA_TESTE_LABELS[rotina]}&quot; ainda não foi implementado no sistema. Por enquanto,
          continue usando o formulário atual pra essa rotina.
        </p>
      </Modal>
    );
  }

  const passos = todosPassos(definicao);
  const preenchidos = passos.filter((p) => respostas[p.codigo]).length;
  // Extraídos aqui (em vez de ler "definicao.xxx" dentro de enviar()) porque
  // o TypeScript não propaga o narrowing do "if (!definicao) return" acima
  // pra dentro de funções aninhadas declaradas depois.
  const usaDispositivos = definicao.usaDispositivos ?? false;

  function setResposta(codigo: string, valor: ResultadoTeste) {
    setRespostas((atual) => ({ ...atual, [codigo]: valor }));
  }

  function alternarDispositivo(dispositivo: DispositivoTeste) {
    setDispositivos((atual) =>
      atual.includes(dispositivo) ? atual.filter((d) => d !== dispositivo) : [...atual, dispositivo],
    );
  }

  function selecionarArquivos(e: ChangeEvent<HTMLInputElement>) {
    const novos = Array.from(e.target.files ?? []);
    e.target.value = ""; // permite selecionar o mesmo arquivo de novo, se precisar
    if (novos.length === 0) return;
    setErro(null);

    const validos: File[] = [];
    for (const arquivo of novos) {
      if (arquivo.size > TAMANHO_MAXIMO_EVIDENCIA_BYTES) {
        setErro(
          `"${arquivo.name}" tem ${formatarTamanhoArquivo(arquivo.size)}, acima do limite de ${formatarTamanhoArquivo(TAMANHO_MAXIMO_EVIDENCIA_BYTES)}.`,
        );
        continue;
      }
      validos.push(arquivo);
    }
    setArquivos((atual) => [...atual, ...validos]);
  }

  function removerArquivo(indice: number) {
    setArquivos((atual) => atual.filter((_, i) => i !== indice));
  }

  function enviar() {
    setErro(null);
    if (!brand) {
      setErro("Selecione o Brand.");
      return;
    }
    if (!versao.trim()) {
      setErro("Informe a versão (release).");
      return;
    }
    if (usaDispositivos && dispositivos.length === 0) {
      setErro("Selecione ao menos um dispositivo.");
      return;
    }
    const faltando = passos.find((p) => !respostas[p.codigo]);
    if (faltando) {
      setErro(`Preencha o resultado de "${faltando.codigo}".`);
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("rotina", rotina);
      fd.set("brand", brand);
      fd.set("versao", versao.trim());
      fd.set("anotacao", anotacao);
      for (const dispositivo of dispositivos) fd.append("dispositivos", dispositivo);
      if (dataExecucao) fd.set("dataExecucao", dataExecucao);
      for (const passo of passos) fd.set(`passo_${passo.codigo}`, respostas[passo.codigo]);
      for (const arquivo of arquivos) fd.append("evidencias", arquivo);

      const res = await criarExecucaoRoteiroTeste(fd);
      if (res.error) {
        setErro(res.error);
        return;
      }
      if (res.avisoEvidencias) {
        setAvisoEvidencias(res.avisoEvidencias);
        setSalvo(true);
        return;
      }
      onSalvo();
    });
  }

  if (salvo) {
    return (
      <Modal open onClose={onSalvo} title={definicao.titulo} maxWidthClassName="max-w-lg">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">Execução salva com sucesso.</p>
          {avisoEvidencias && <p className="text-xs text-amber-600 dark:text-amber-400">{avisoEvidencias}</p>}
          <div>
            <button
              type="button"
              onClick={onSalvo}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose} title={definicao.titulo} maxWidthClassName="max-w-4xl">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{definicao.subtitulo}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
            Brand
            <select
              value={brand}
              disabled={pending}
              onChange={(e) => setBrand(e.target.value as BrandTeste)}
              className={CLASSE_SELECT}
            >
              <option value="" disabled>
                Selecione
              </option>
              {BRANDS_TESTE.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
            Versão (Release)
            <input
              value={versao}
              disabled={pending}
              onChange={(e) => setVersao(e.target.value)}
              placeholder="Insira o valor aqui"
              className={CLASSE_INPUT}
            />
          </label>

          {definicao.usaData && (
            <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
              Data
              <input
                type="date"
                value={dataExecucao}
                disabled={pending}
                onChange={(e) => setDataExecucao(e.target.value)}
                className={`${CLASSE_INPUT} dark:[color-scheme:dark]`}
              />
            </label>
          )}
        </div>

        {definicao.usaDispositivos && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-600 dark:text-gray-400">Dispositivos</span>
            <div className="flex flex-wrap gap-2">
              {DISPOSITIVOS_TESTE.map((dispositivo) => {
                const ativo = dispositivos.includes(dispositivo);
                return (
                  <button
                    key={dispositivo}
                    type="button"
                    disabled={pending}
                    onClick={() => alternarDispositivo(dispositivo)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                      ativo
                        ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {dispositivo}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Passos do roteiro</h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {preenchidos}/{passos.length} preenchidos
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {definicao.passos.map((passo) => (
            <PassoCard
              key={passo.codigo}
              passo={passo}
              valor={respostas[passo.codigo] ?? ""}
              onChange={(valor) => setResposta(passo.codigo, valor)}
            />
          ))}
        </div>

        {definicao.secaoExtra && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {definicao.secaoExtra.titulo}
            </h3>
            <div className="flex flex-col gap-2">
              {definicao.secaoExtra.passos.map((passo) => (
                <PassoCard
                  key={passo.codigo}
                  passo={passo}
                  valor={respostas[passo.codigo] ?? ""}
                  onChange={(valor) => setResposta(passo.codigo, valor)}
                />
              ))}
            </div>
          </div>
        )}

        <label className="flex flex-col gap-1 text-xs text-gray-600 dark:text-gray-400">
          Anotação
          <textarea
            value={anotacao}
            disabled={pending}
            onChange={(e) => setAnotacao(e.target.value)}
            placeholder="Observações gerais sobre a execução deste roteiro..."
            rows={3}
            className="w-full resize-none rounded border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-600 dark:text-gray-100"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Evidências {arquivos.length > 0 && `(${arquivos.length})`}
          </span>
          {arquivos.length > 0 && (
            <ul className="flex flex-col gap-1">
              {arquivos.map((arquivo, indice) => (
                <li key={`${arquivo.name}-${indice}`} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-300">{arquivo.name}</span>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    {formatarTamanhoArquivo(arquivo.size)}
                  </span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => removerArquivo(indice)}
                    title="Remover"
                    className="shrink-0 text-gray-400 hover:text-red-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-red-400"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div>
            <input
              ref={inputArquivoRef}
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.txt,image/png,image/jpeg,text/plain"
              className="hidden"
              onChange={selecionarArquivos}
            />
            <button
              type="button"
              disabled={pending}
              onClick={() => inputArquivoRef.current?.click()}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Anexar evidências
            </button>
          </div>
        </div>

        {erro && <p className="text-xs text-red-600 dark:text-red-400">{erro}</p>}

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={enviar}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
