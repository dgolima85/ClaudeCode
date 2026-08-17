"use client";

import { useState, useTransition } from "react";

export type CrudFieldOption = { value: string; label: string };

export type CrudField =
  | { key: string; label: string; type: "text" | "email"; required?: boolean }
  | { key: string; label: string; type: "select"; required?: boolean; options: CrudFieldOption[] };

export type CrudItem = {
  id: string;
  ativo: boolean;
  [key: string]: string | boolean;
};

type ActionResult = { error?: string };

type CrudTableProps = {
  campos: CrudField[];
  itens: CrudItem[];
  criar: (dados: Record<string, string>) => Promise<ActionResult>;
  atualizar: (id: string, dados: Record<string, string | boolean>) => Promise<ActionResult>;
  excluir: (id: string) => Promise<ActionResult>;
  labelNovo?: string;
};

function valoresVazios(campos: CrudField[]): Record<string, string> {
  return Object.fromEntries(campos.map((c) => [c.key, ""]));
}

export default function CrudTable({
  campos,
  itens,
  criar,
  atualizar,
  excluir,
  labelNovo = "Adicionar",
}: CrudTableProps) {
  const [novo, setNovo] = useState<Record<string, string>>(valoresVazios(campos));
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValores, setEditValores] = useState<Record<string, string | boolean>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function iniciarEdicao(item: CrudItem) {
    setEditandoId(item.id);
    setErro(null);
    const valores: Record<string, string | boolean> = { ativo: item.ativo };
    for (const campo of campos) valores[campo.key] = String(item[campo.key] ?? "");
    setEditValores(valores);
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setErro(null);
  }

  function salvarNovo() {
    setErro(null);
    startTransition(async () => {
      const res = await criar(novo);
      if (res?.error) setErro(res.error);
      else setNovo(valoresVazios(campos));
    });
  }

  function salvarEdicao(id: string) {
    setErro(null);
    startTransition(async () => {
      const res = await atualizar(id, editValores);
      if (res?.error) setErro(res.error);
      else setEditandoId(null);
    });
  }

  function handleExcluir(id: string) {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    setErro(null);
    startTransition(async () => {
      const res = await excluir(id);
      if (res?.error) setErro(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {erro && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-300">{erro}</p>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {campos.map((c) => (
                <th key={c.key} className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                  {c.label}
                </th>
              ))}
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Ativo</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {itens.map((item) => (
              <tr key={item.id} className={!item.ativo ? "bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500" : undefined}>
                {editandoId === item.id ? (
                  <>
                    {campos.map((campo) => (
                      <td key={campo.key} className="px-3 py-2">
                        {campo.type === "select" ? (
                          <select
                            value={String(editValores[campo.key] ?? "")}
                            onChange={(e) =>
                              setEditValores((v) => ({ ...v, [campo.key]: e.target.value }))
                            }
                            className="rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-gray-600 dark:text-gray-100 dark:[color-scheme:dark]"
                          >
                            {campo.options.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={campo.type}
                            value={String(editValores[campo.key] ?? "")}
                            onChange={(e) =>
                              setEditValores((v) => ({ ...v, [campo.key]: e.target.value }))
                            }
                            className="w-full rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-gray-600 dark:text-gray-100"
                          />
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={Boolean(editValores.ativo)}
                        onChange={(e) =>
                          setEditValores((v) => ({ ...v, ativo: e.target.checked }))
                        }
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => salvarEdicao(item.id)}
                          className="text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={cancelarEdicao}
                          className="text-gray-500 hover:underline dark:text-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    {campos.map((campo) => (
                      <td key={campo.key} className="px-3 py-2">
                        {campo.type === "select"
                          ? campo.options.find((o) => o.value === item[campo.key])?.label ??
                            String(item[campo.key] ?? "")
                          : String(item[campo.key] ?? "")}
                      </td>
                    ))}
                    <td className="px-3 py-2">{item.ativo ? "Sim" : "Não"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => iniciarEdicao(item)}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleExcluir(item.id)}
                          className="text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={campos.length + 2} className="px-3 py-4 text-center text-gray-400 dark:text-gray-500">
                  Nenhum item cadastrado.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <tr>
              {campos.map((campo) => (
                <td key={campo.key} className="px-3 py-2">
                  {campo.type === "select" ? (
                    <select
                      value={novo[campo.key] ?? ""}
                      onChange={(e) => setNovo((v) => ({ ...v, [campo.key]: e.target.value }))}
                      className="rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-gray-600 dark:text-gray-100 dark:[color-scheme:dark]"
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {campo.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={campo.type}
                      placeholder={campo.label}
                      value={novo[campo.key] ?? ""}
                      onChange={(e) => setNovo((v) => ({ ...v, [campo.key]: e.target.value }))}
                      className="w-full rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-gray-600 dark:text-gray-100"
                    />
                  )}
                </td>
              ))}
              <td />
              <td className="px-3 py-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={salvarNovo}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {labelNovo}
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
