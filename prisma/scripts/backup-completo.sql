-- Backup completo de todas as tabelas do sistema, antes de alterações de
-- schema (campos, nomes de campos, relacionamentos). Cria uma cópia de cada
-- tabela com sufixo de data. Rode no SQL Editor da Neon.
--
-- Ajuste o sufixo de data se rodar em outro dia.

CREATE TABLE analistas_backup_20260813              AS TABLE analistas;
CREATE TABLE tipos_ocorrencia_backup_20260813        AS TABLE tipos_ocorrencia;
CREATE TABLE parcerias_backup_20260813               AS TABLE parcerias;
CREATE TABLE empresas_backup_20260813                AS TABLE empresas;
CREATE TABLE ambientes_backup_20260813               AS TABLE ambientes;
CREATE TABLE servicos_backup_20260813                AS TABLE servicos;
CREATE TABLE sistemas_operacionais_backup_20260813   AS TABLE sistemas_operacionais;
CREATE TABLE causas_backup_20260813                  AS TABLE causas;
CREATE TABLE solucoes_backup_20260813                AS TABLE solucoes;
CREATE TABLE ocorrencias_backup_20260813_2           AS TABLE ocorrencias;
CREATE TABLE eventos_backup_20260813_2               AS TABLE eventos;

-- Conferência: contagem de linhas em cada tabela original
SELECT 'analistas' AS tabela, COUNT(*) FROM analistas
UNION ALL SELECT 'tipos_ocorrencia', COUNT(*) FROM tipos_ocorrencia
UNION ALL SELECT 'parcerias', COUNT(*) FROM parcerias
UNION ALL SELECT 'empresas', COUNT(*) FROM empresas
UNION ALL SELECT 'ambientes', COUNT(*) FROM ambientes
UNION ALL SELECT 'servicos', COUNT(*) FROM servicos
UNION ALL SELECT 'sistemas_operacionais', COUNT(*) FROM sistemas_operacionais
UNION ALL SELECT 'causas', COUNT(*) FROM causas
UNION ALL SELECT 'solucoes', COUNT(*) FROM solucoes
UNION ALL SELECT 'ocorrencias', COUNT(*) FROM ocorrencias
UNION ALL SELECT 'eventos', COUNT(*) FROM eventos;

-- Para restaurar uma tabela a partir do backup, em caso de problema:
-- TRUNCATE ambientes;
-- INSERT INTO ambientes SELECT * FROM ambientes_backup_20260813;

-- Depois de confirmar que as alterações deram certo, pode apagar os backups:
-- DROP TABLE analistas_backup_20260813, tipos_ocorrencia_backup_20260813,
--   parcerias_backup_20260813, empresas_backup_20260813, ambientes_backup_20260813,
--   servicos_backup_20260813, sistemas_operacionais_backup_20260813,
--   causas_backup_20260813, solucoes_backup_20260813,
--   ocorrencias_backup_20260813_2, eventos_backup_20260813_2;
