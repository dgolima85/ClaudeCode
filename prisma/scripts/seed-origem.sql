-- Popula o campo "Origem" (tabela tipos_ocorrencia) com os valores
-- iniciais solicitados. Idempotente (não duplica se o nome já existir).

INSERT INTO tipos_ocorrencia (id, nome, "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Afiliadas', now()),
  (gen_random_uuid()::text, 'Guaratiba', now()),
  (gen_random_uuid()::text, 'Globo ION', now()),
  (gen_random_uuid()::text, 'Encompass', now())
ON CONFLICT (nome) DO NOTHING;

-- Conferência
SELECT id, nome, ativo FROM tipos_ocorrencia ORDER BY nome;
