-- Cria a opção "N/A" em Origem (uma vez) e em Recurso (uma para cada
-- Ambiente já cadastrado, já que Recurso é filtrado por Ambiente). O código
-- da aplicação já foi ajustado para sempre exibir "N/A" em primeiro lugar
-- nessas duas listas. Idempotente.

INSERT INTO tipos_ocorrencia (id, nome, "updatedAt")
VALUES (gen_random_uuid()::text, 'N/A', now())
ON CONFLICT (nome) DO NOTHING;

INSERT INTO recursos (id, nome, "ambienteInfraId", "updatedAt")
SELECT gen_random_uuid()::text, 'N/A', id, now()
FROM ambientes_infra
ON CONFLICT ("ambienteInfraId", nome) DO NOTHING;

-- Conferência
SELECT nome FROM tipos_ocorrencia ORDER BY nome;
SELECT r.nome, a.nome AS ambiente FROM recursos r JOIN ambientes_infra a ON a.id = r."ambienteInfraId" ORDER BY a.nome, r.nome;
