-- Apaga todas as Ocorrencias e seus Eventos (dados de teste), preservando
-- as tabelas de cadastro (analistas, tipos_ocorrencia, parcerias, empresas,
-- ambientes, servicos, sistemas_operacionais, causas, solucoes).
--
-- Rode cada bloco na ordem, no SQL Editor da Neon. Ajuste o sufixo de data
-- das tabelas de backup se rodar em outro dia.

-- 1) Conferência antes de apagar
SELECT
  (SELECT COUNT(*) FROM ocorrencias) AS total_ocorrencias,
  (SELECT COUNT(*) FROM eventos)     AS total_eventos;

-- 2) Backup de segurança (cópia completa em tabelas novas, antes de apagar)
CREATE TABLE ocorrencias_backup_20260813 AS TABLE ocorrencias;
CREATE TABLE eventos_backup_20260813     AS TABLE eventos;

-- 3) Apaga eventos (filhos) e depois as ocorrências, numa transação
BEGIN;
DELETE FROM eventos;
DELETE FROM ocorrencias;
COMMIT;

-- 4) Conferência depois de apagar (deve retornar 0 e 0)
SELECT
  (SELECT COUNT(*) FROM ocorrencias) AS total_ocorrencias,
  (SELECT COUNT(*) FROM eventos)     AS total_eventos;

-- 5) (Opcional) depois de confirmar que está tudo certo, apague o backup:
-- DROP TABLE ocorrencias_backup_20260813;
-- DROP TABLE eventos_backup_20260813;
