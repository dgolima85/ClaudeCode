#!/usr/bin/env python3
"""Gera os indicadores N3 a partir das planilhas exportadas do monday.

Uso: python gerar_indicadores.py <pasta_com_xlsx> [saida.xlsx]
Todas as planilhas N3_*.xlsx da pasta são lidas (novas planilhas entram sozinhas).
"""
import glob, os, re, sys
import pandas as pd
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter
from rapidfuzz import fuzz
from unidecode import unidecode

LIM_ALTA, LIM_MEDIA = 92, 85          # similaridade de nome p/ reabertura
SLA_META, DIAS_PERIODO = 0.995, 31    # 99,5% em 31 dias = 3h43min

# ---------------------------------------------------------------- leitura
def carregar(pasta):
    frames = []
    for f in sorted(glob.glob(os.path.join(pasta, "*N3_*.xlsx"))):
        ws = load_workbook(f, read_only=True, data_only=True)["n3"]
        fila = ws["A2"].value or os.path.basename(f)
        df = pd.read_excel(f, sheet_name="n3", header=2)
        df["Fila"] = fila
        frames.append(df)
    df = pd.concat(frames, ignore_index=True)
    df = df[df["Nome"].notna()].copy()            # remove linhas de total/resumo do monday
    df["Data de abertura"] = pd.to_datetime(df["Data de abertura"], errors="coerce")
    df["Data de Conclusão"] = pd.to_datetime(df["Data de Conclusão"], errors="coerce")
    df["_k"] = df["Nome"].map(lambda s: norm(s)) + "|" + df["Data de abertura"].astype(str)
    antes = len(df)
    # só remove o mesmo item presente em duas planilhas; repetidos dentro da mesma planilha são itens distintos do monday
    dup = df.duplicated(["_k", "Status"], keep=False) & ~df.duplicated(["_k", "Status", "Fila"], keep=False)
    dup = dup & df.duplicated("_k", keep="first")
    df = df[~dup].drop(columns="_k").reset_index(drop=True)
    return df, antes - len(df)

def norm(s):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", unidecode(str(s)).lower())).strip()

# ---------------------------------------------------------------- classificação
def estado(s):
    if s == "Feito": return "Resolvido"
    if s == "Cancelado": return "Cancelado"
    return "Aberto"

def prio(s):
    m = re.search(r"P(\d)", str(s))
    return f"P{m.group(1)}" if m else "Sem classificação"

CATEGORIAS = [  # ordem importa: primeira regra que casar
    ("Segurança", r"\bsec\b|cybersec|vulnerab|cloudflare|bloqueio d[eo] ip|enumera|bypass|pentest|rate.?limit"),
    ("Banco de Dados / Manipulação de base", r"higieniza|manipula|extra[cç][aã]o de dados|conciliac|base de dados|\bbase\b|\bdados\b|\bscript\b|exclus[aã]o (indevida )?de|inclus[aã]o de id|tombamento|sfmc|\bbucket\b|\bdb\b"),
    ("Infraestrutura / Instabilidade", r"indisponib|instabil|fora do ar|sobrecarga|mem[oó]ria|lambda|refresh-token|cloudfront|\bcdn\b|\bs3\b|bitmovin|erro (401|403|404)|\bcpu\b|timeout|erro 5\d\d|lentid|sentry|ott-services|certificado|\bcache\b|ingest|\belb\b|deploy|infra|latenc|escalabil"),
    ("Acessos / Autenticação", r"login|logout|senha|acesso ao app|primeiro acesso|autentic|ativa[cç][aã]o de (conta|link)|link de ativa|c[oó]digo de ativa|expira[cç][aã]o|qr code|esqueci|conta n[aã]o|sess[aã]o|pin\b"),
    ("Perfis / Controle parental", r"perfil|perfis|kids|infantil|parental"),
    ("Canais ao Vivo / EPG", r"canais?\b.*(vivo|free|fast)|ao vivo|\bepg\b|programa[cç][aã]o|grade|time ?shift|afiliada|emissora|liga tv|\bcanal\b|\bcanais\b"),
    ("Player / Reprodução", r"reprodu|player|\bads?\b|legenda|faixa de [aá]udio|audio|[aá]udio|drm|travament|tela preta|carregamento infinito|streaming|qualidade de v[ií]deo|v[ií]deo"),
    ("Conteúdo / Catálogo (VOD)", r"\bvods?\b|conte[uú]do|capa|epis[oó]dio|s[eé]rie|filme|banner|carrossel|carrosel|cat[aá]logo|g[eê]nero|\bstudio\b|est[uú]dio|temporada|imagem|imagens|thumb|logo\b|duracao|dura[cç][aã]o|novela"),
    ("Pacotes / Assinaturas / Integrações", r"pacote|assinatura|ticket|hbo|max\b|migra[cç][aã]o|integra[cç][aã]o|\bapi\b|endpoint|callback|degusta|ativa[cç][aã]o|voalle|plano|cobrand|co-brand|offer|catalogo de pacote"),
    ("E-mails / Notificações", r"e-?mail|\bsms\b|notifica|envio de"),
    ("Backoffice / CMS", r"backoffice|\bbko\b|\bcms\b"),
    ("Melhorias / Solicitações", r"melhoria|sugest[aã]o|solicita[cç][aã]o|avalia[cç][aã]o|an[aá]lise|estimativa|viabilidade|evangelizar|ajuste|levantamento|mapeamento|revis[aã]o|valida[cç][aã]o"),
    ("Aplicativos / Interface (TV, Mobile, Web)", r"roku|\btvs?\b|android|\bios\b|mobile|\bweb\b|\bapp\b|aplicativo|tela|bot[aã]o|mensagem|[ií]cone|pop-?up|selo|desktop|samsung|toshiba|\blg\b|awdio|pre-?roll|dispositivo|erro de conex"),
]
TIPO_MAP = {"acesso": "Acessos / Autenticação", "primeiro acesso": "Acessos / Autenticação",
            "conteudo": "Conteúdo / Catálogo (VOD)", "vod": "Conteúdo / Catálogo (VOD)",
            "capas": "Conteúdo / Catálogo (VOD)", "banner": "Conteúdo / Catálogo (VOD)",
            "carrosseis": "Conteúdo / Catálogo (VOD)", "canais ao vivo": "Canais ao Vivo / EPG",
            "epg": "Canais ao Vivo / EPG", "afiliadas globo": "Canais ao Vivo / EPG",
            "tickets": "Pacotes / Assinaturas / Integrações", "pacote": "Pacotes / Assinaturas / Integrações",
            "pacote unificado": "Pacotes / Assinaturas / Integrações", "migracao": "Pacotes / Assinaturas / Integrações",
            "integracao": "Pacotes / Assinaturas / Integrações", "api": "Pacotes / Assinaturas / Integrações",
            "emails": "E-mails / Notificações", "criacao de emails": "E-mails / Notificações",
            "instabilidade": "Infraestrutura / Instabilidade", "ambiente": "Infraestrutura / Instabilidade",
            "performance": "Infraestrutura / Instabilidade", "player": "Player / Reprodução",
            "reproducao": "Player / Reprodução", "controle parental": "Perfis / Controle parental",
            "cms": "Backoffice / CMS", "extracao de dados": "Banco de Dados / Manipulação de base"}

def categoria(r):
    nome = norm(r["Nome"])
    grupo = norm(r.get("Grupo", ""))
    if "manipulacao db" in grupo: return "Banco de Dados / Manipulação de base"
    if "cybersec" in grupo: return "Segurança"
    for cat, rx in CATEGORIAS[:3]:                       # sinais fortes no título
        if re.search(rx, nome): return cat
    t = norm(str(r.get("Tipo", "")).split(",")[0]) if pd.notna(r.get("Tipo")) else ""
    if t in TIPO_MAP: return TIPO_MAP[t]
    for cat, rx in CATEGORIAS[3:]:
        if re.search(rx, nome): return cat
    return "Não classificado"

SERVICOS = [
    ("Awdio", r"awdio|r[aá]dio|audiobook"),
    ("Backoffice (BKO)", r"backoffice|\bbko\b"),
    ("CMS", r"\bcms\b"),
    ("API / Integrações", r"\bapi\b|endpoint|integra[cç][aã]o|callback|voalle|sfmc|hbo|salesforce"),
    ("Canais ao Vivo / Eng. de Vídeo", r"canais?\b|ao vivo|\bepg\b|time ?shift|afiliada|emissora|liga tv|\belb\b|ingest"),
    ("VOD / Conteúdo", r"\bvods?\b|conte[uú]do|capa|epis[oó]dio|s[eé]rie|filme|cat[aá]logo|novela"),
    ("Infra / Plataforma Geral", r"plataforma geral|lambda|sentry|ott-services|cloudflare|\bsec\b|bucket|mem[oó]ria|\bcache\b|certificado|infra"),
    ("Apps (TV/Roku/Mobile/Web)", r"roku|\btvs?\b|android|ios|mobile|\bweb\b|desktop|toshiba|samsung|\blg\b|fire ?tv|zte|app\b"),
]
def servico(r):
    fila = norm(r["Fila"])
    if "awdio" in fila: return "Awdio"
    if "engenharia de video" in fila: return "Canais ao Vivo / Eng. de Vídeo"
    if "conteudo" in fila: return "VOD / Conteúdo"
    if re.search(r"squad (mobile|tv|web)", fila): return "Apps (TV/Roku/Mobile/Web)"
    if "suporte performance" in fila or "novas solicitacoes" in fila: pass
    nome = norm(r["Nome"])
    cp = norm(r.get("Cliente/Plataforma", "")) if pd.notna(r.get("Cliente/Plataforma")) else ""
    for s, rx in SERVICOS[:3]:
        if re.search(rx, nome) or re.search(rx, cp): return s
    if re.search(r"\bapi\b", cp): return "API / Integrações"
    for s, rx in SERVICOS[3:]:
        if re.search(rx, nome): return s
    dev = norm(r.get("Device", "")) if pd.notna(r.get("Device")) else ""
    if re.search(r"roku|tv|android|ios|mobile|web|fire", dev): return "Apps (TV/Roku/Mobile/Web)"
    return "Plataforma Watch (geral)"

# ---------------------------------------------------------------- reaberturas
STOP = set("de da do das dos a o e em no na nos nas para por com ao aos que se um uma ou nao e".split())
def titulo(nome):
    n = str(nome)
    if "|" in n: n = n.split("|")[-1]
    toks = [t for t in norm(n).split() if t not in STOP]
    return " ".join(toks)

def entidades(nome):
    """Tokens em CAIXA ALTA/numéricos do título (ISP, id de issue etc.) que distinguem itens de um mesmo lote."""
    n = str(nome).split("|")[-1]
    return {t for t in re.findall(r"[\w+]+", n) if (t.isupper() and len(t) >= 2) or any(c.isdigit() for c in t)}

def reaberturas(df):
    d = df.copy()
    d["_t"] = d["Nome"].map(titulo)
    d = d[(d["_t"].str.split().str.len() >= 3) & ~d["_t"].str.fullmatch(r"[\d ]*null?[\d ]*")]
    d = d[d["Data de abertura"].notna()]
    idx = list(d.index)
    rows = []
    t = d["_t"].to_dict(); ab = d["Data de abertura"].to_dict(); co = d["Data de Conclusão"].to_dict()
    est = d["Estado"].to_dict()
    ent = d["Nome"].map(entidades).to_dict()
    for i, a in enumerate(idx):
        if est[a] != "Resolvido": continue
        fim_a = co[a] if pd.notna(co[a]) else ab[a]
        for b in idx:
            if b == a or est[b] == "Cancelado": continue
            if not ab[b] > fim_a: continue            # B precisa ter sido aberto depois do encerramento de A
            if (ent[a] - ent[b]) and (ent[b] - ent[a]): continue   # mesmo modelo, entidades diferentes (ex.: ISP A x ISP B) = lote, não reabertura
            s = max(fuzz.token_sort_ratio(t[a], t[b]), fuzz.token_set_ratio(t[a], t[b]) - 8)
            if s >= LIM_MEDIA:
                rows.append((a, b, round(s, 1), "Alta" if s >= LIM_ALTA else "Média",
                             "Sim" if pd.notna(co[a]) else "Não (usou data de abertura)"))
    p = pd.DataFrame(rows, columns=["a", "b", "score", "confiança", "data_conclusão_original"])
    if p.empty: return p, p
    # cada reabertura (b) fica com o melhor chamado original (a)
    p = p.sort_values("score", ascending=False).drop_duplicates("b")
    out = pd.DataFrame({
        "Chamado original (encerrado)": df.loc[p.a, "Nome"].values,
        "Abertura original": df.loc[p.a, "Data de abertura"].values,
        "Conclusão original": df.loc[p.a, "Data de Conclusão"].values,
        "Chamado reaberto/recorrente": df.loc[p.b, "Nome"].values,
        "Abertura recorrência": df.loc[p.b, "Data de abertura"].values,
        "Status recorrência": df.loc[p.b, "Status"].values,
        "Criticidade": df.loc[p.b, "Prioridade_N"].values,
        "Serviço": df.loc[p.b, "Serviço"].values,
        "Similaridade (%)": p.score.values, "Confiança": p["confiança"].values,
        "Data conclusão original informada?": p["data_conclusão_original"].values})
    out = out.sort_values(["Confiança", "Similaridade (%)"], ascending=[True, False]).reset_index(drop=True)
    # agrupamento de problemas recorrentes (componentes conexos)
    par = {}
    def f(x):
        while par.setdefault(x, x) != x: par[x] = par[par[x]]; x = par[x]
        return x
    for a, b in zip(p.a, p.b): par[f(a)] = f(b)
    cl = pd.Series({n: f(n) for n in set(p.a) | set(p.b)})
    return out, p.assign(grupo=p.a.map(cl))

# ---------------------------------------------------------------- indisponibilidade
KW_INDISP = r"indisponib|instabil|fora do ar|queda|sobrecarga|mem[oó]ria em 100|erro 5\d\d|timeout|lentid|n[aã]o funcionam|tela preta|sem acesso"
def duracao_nome(n):
    m = re.search(r"~?\s*(\d+(?:[.,]\d+)?)\s*(h\b|hora|horas|min\b|minutos)", str(n), re.I)
    if not m: return None
    v = float(m.group(1).replace(",", ".")); u = m.group(2).lower()
    return round(v * 60) if u.startswith("h") else round(v)

# ---------------------------------------------------------------- excel
HDR = PatternFill("solid", fgColor="1F3864"); INP = PatternFill("solid", fgColor="FFF2CC")
def escreve(ws, df, r0=1, c0=1, fmt_pct=()):
    for j, c in enumerate(df.columns):
        x = ws.cell(r0, c0 + j, c); x.font = Font(bold=True, color="FFFFFF"); x.fill = HDR
        x.alignment = Alignment(wrap_text=True, vertical="center")
    for i, row in enumerate(df.itertuples(index=False), start=1):
        for j, v in enumerate(row):
            if pd.isna(v) if not isinstance(v, (list, tuple)) else False: v = None
            if isinstance(v, pd.Timestamp): v = v.to_pydatetime()
            x = ws.cell(r0 + i, c0 + j, v)
            if hasattr(v, "year"): x.number_format = "dd/mm/yyyy"
    for j, c in enumerate(df.columns):
        w = max([len(str(c))] + [len(str(v)) for v in df.iloc[:, j].head(200)])
        ws.column_dimensions[get_column_letter(c0 + j)].width = min(max(w + 2, 10), 70)
    return r0 + len(df)

def titulo_ws(ws, txt, r):
    ws.cell(r, 1, txt).font = Font(bold=True, size=13)

def main():
    pasta = sys.argv[1]; saida = sys.argv[2] if len(sys.argv) > 2 else "Indicadores_N3.xlsx"
    df, ndup = carregar(pasta)
    df["Estado"] = df["Status"].map(estado)
    df["Prioridade_N"] = df["Criticidade"].map(prio)
    df["Categoria"] = df.apply(categoria, axis=1)
    df["Serviço"] = df.apply(servico, axis=1)
    df["Mês abertura"] = df["Data de abertura"].dt.to_period("M").astype(str).replace("NaT", "sem data")
    df["Mês conclusão"] = df["Data de Conclusão"].dt.to_period("M").astype(str).replace("NaT", "sem data")
    reab, pares = reaberturas(df)
    n_ab, n_res, n_can = (df.Estado == e for e in ("Aberto", "Resolvido", "Cancelado"))
    wb = Workbook()

    # ---- Resumo
    ws = wb.active; ws.title = "Resumo"
    titulo_ws(ws, "Indicadores N3 — resumo executivo", 1)
    ws["A2"] = f"Base: {', '.join(sorted(df['Fila'].unique()))}  |  {len(df)} chamados únicos ({ndup} duplicados removidos)"
    k = [("Chamados abertos (status ≠ Feito/Cancelado)", int(n_ab.sum())),
         ("Chamados resolvidos (status = Feito)", int(n_res.sum())),
         ("Chamados cancelados (fora dos dois indicadores)", int(n_can.sum())),
         ("Reaberturas/recorrências — confiança Alta", int((reab["Confiança"] == "Alta").sum()) if len(reab) else 0),
         ("Reaberturas/recorrências — Alta + Média", len(reab)),
         ("Taxa de reabertura (Alta+Média / resolvidos)", round(len(reab) / max(int(n_res.sum()), 1), 4))]
    for i, (a, b) in enumerate(k, start=4):
        ws.cell(i, 1, a); c = ws.cell(i, 2, b); c.font = Font(bold=True)
        if "Taxa" in a: c.number_format = "0.0%"
    ws.column_dimensions["A"].width = 58; ws.column_dimensions["B"].width = 14
    r = 12; titulo_ws(ws, "Incidentes por criticidade", r)
    t = pd.crosstab(df.Prioridade_N, df.Estado).reindex(["P1", "P2", "P3", "P4", "Sem classificação"]).fillna(0).astype(int)
    for e in ("Aberto", "Resolvido", "Cancelado"):
        if e not in t: t[e] = 0
    t = t[["Aberto", "Resolvido", "Cancelado"]]; t["Total"] = t.sum(axis=1)
    t.insert(0, "Criticidade", t.index); r = escreve(ws, t, r + 1) + 2
    titulo_ws(ws, "Top 3 categorias (todos os chamados)", r)
    top = df.Categoria.value_counts().head(3).rename_axis("Categoria").reset_index(name="Chamados")
    top["%"] = (top.Chamados / len(df)).round(4)
    r2 = escreve(ws, top, r + 1)
    for i in range(r + 2, r2 + 1): ws.cell(i, 3).number_format = "0.0%"
    ws.cell(r2 + 2, 1, "Detalhes, premissas e limitações: ver abas seguintes e 'Premissas'.").font = Font(italic=True)

    # ---- Abertos x Resolvidos
    ws = wb.create_sheet("Abertos x Resolvidos")
    titulo_ws(ws, "Por fila (planilha de origem)", 1)
    p = pd.crosstab(df.Fila, df.Estado)
    for e in ("Aberto", "Resolvido", "Cancelado"):
        if e not in p: p[e] = 0
    p = p[["Aberto", "Resolvido", "Cancelado"]]; p["Total"] = p.sum(axis=1); p.insert(0, "Fila", p.index)
    r = escreve(ws, p, 2) + 2
    titulo_ws(ws, "Abertos por status", r)
    s = df[n_ab].Status.fillna("(vazio)").value_counts().rename_axis("Status").reset_index(name="Chamados")
    r = escreve(ws, s, r + 1) + 2
    titulo_ws(ws, "Fluxo mensal (abertura pela Data de abertura; resolução pela Data de Conclusão)", r)
    m = pd.DataFrame({"Abertos no mês (entrada)": df["Mês abertura"].value_counts(),
                      "Resolvidos no mês (Feito c/ data de conclusão)": df[n_res]["Mês conclusão"].value_counts()}).fillna(0).astype(int)
    m = m.drop(index="sem data", errors="ignore").sort_index(); m.insert(0, "Mês", m.index)
    r = escreve(ws, m, r + 1)
    ws.cell(r + 2, 1, f"Resolvidos sem Data de Conclusão: {int((n_res & df['Data de Conclusão'].isna()).sum())}; "
                      f"chamados sem Data de abertura: {int(df['Data de abertura'].isna().sum())} (ficam fora do fluxo mensal).")

    # ---- Reaberturas
    ws = wb.create_sheet("Reaberturas")
    titulo_ws(ws, f"Reaberturas/recorrências detectadas por similaridade de nome (Alta ≥{LIM_ALTA}%, Média ≥{LIM_MEDIA}%) — revisar antes de usar", 1)
    if len(reab): escreve(ws, reab, 3)
    ws.freeze_panes = "A4"
    ws = wb.create_sheet("Reab. por serviço")
    if len(reab):
        x = pd.crosstab(reab["Serviço"], reab["Confiança"])
        x["Total"] = x.sum(axis=1); x.insert(0, "Serviço", x.index); escreve(ws, x.sort_values("Total", ascending=False), 1)

    # ---- Incidentes
    ws = wb.create_sheet("Incidentes P1-P3")
    titulo_ws(ws, "Incidentes por criticidade × estado", 1)
    r = escreve(ws, t.reset_index(drop=True).assign(Criticidade=t.index), 2) + 2
    titulo_ws(ws, "Entrada mensal por criticidade (Data de abertura)", r)
    mm = pd.crosstab(df["Mês abertura"], df.Prioridade_N).drop(index="sem data", errors="ignore")
    mm = mm.reindex(columns=["P1", "P2", "P3", "P4", "Sem classificação"], fill_value=0); mm.insert(0, "Mês", mm.index)
    r = escreve(ws, mm, r + 1) + 2
    titulo_ws(ws, "Tempo de resolução (dias, abertura → conclusão; só chamados Feito com as duas datas)", r)
    dd = df[n_res & df["Data de Conclusão"].notna() & df["Data de abertura"].notna()].copy()
    dd["dias"] = (dd["Data de Conclusão"] - dd["Data de abertura"]).dt.days
    dd = dd[dd.dias >= 0]
    mt = dd.groupby("Prioridade_N").dias.agg(Chamados="count", Mediana="median", Média="mean", P90=lambda s: s.quantile(.9)).round(1)
    mt.insert(0, "Criticidade", mt.index); escreve(ws, mt, r + 1)

    # ---- Categorias
    ws = wb.create_sheet("Categorias")
    r = 1
    for nome, sub in (("Todos os chamados", df), ("Somente abertos", df[n_ab]), ("Somente resolvidos", df[n_res])):
        titulo_ws(ws, f"{nome} — ranking de categorias", r)
        c = sub.Categoria.value_counts().rename_axis("Categoria").reset_index(name="Chamados")
        c["%"] = (c.Chamados / len(sub)).round(4); c["Top"] = range(1, len(c) + 1)
        r2 = escreve(ws, c, r + 1)
        for i in range(r + 2, r2 + 1): ws.cell(i, 3).number_format = "0.0%"
        r = r2 + 3
    titulo_ws(ws, "Categoria × Serviço/Produto (todos os chamados)", r)
    cs = pd.crosstab(df["Serviço"], df.Categoria); cs.insert(0, "Serviço", cs.index); escreve(ws, cs, r + 1)
    ws = wb.create_sheet("Serviços")
    sv = pd.crosstab(df["Serviço"], df.Estado)
    for e in ("Aberto", "Resolvido", "Cancelado"):
        if e not in sv: sv[e] = 0
    sv = sv[["Aberto", "Resolvido", "Cancelado"]]; sv["Total"] = sv.sum(axis=1)
    sv["P1"] = df[df.Prioridade_N == "P1"].groupby("Serviço").size().reindex(sv.index).fillna(0).astype(int)
    sv["P2"] = df[df.Prioridade_N == "P2"].groupby("Serviço").size().reindex(sv.index).fillna(0).astype(int)
    sv["P3"] = df[df.Prioridade_N == "P3"].groupby("Serviço").size().reindex(sv.index).fillna(0).astype(int)
    sv.insert(0, "Serviço", sv.index); escreve(ws, sv.sort_values("Total", ascending=False), 1)

    # ---- Disponibilidade
    wd = wb.create_sheet("Disponibilidade")
    ev = df[(df.Prioridade_N.isin(["P1", "P2"])) &
            (df.Nome.str.contains(KW_INDISP, case=False, regex=True) | df.Tipo.fillna("").str.contains("Instabilidade"))].copy()
    ev["Dur_nome"] = ev.Nome.map(duracao_nome)
    evt = pd.DataFrame({"Chamado": ev.Nome, "Serviço": ev["Serviço"], "Criticidade": ev.Prioridade_N,
                        "Data de abertura": ev["Data de abertura"], "Data de conclusão": ev["Data de Conclusão"],
                        "Indisponibilidade (min) — PREENCHER": ev.Dur_nome,
                        "Origem do valor": ev.Dur_nome.map(lambda v: "Extraído do nome do chamado (conferir)" if pd.notna(v) else "")})
    we = wb.create_sheet("Eventos indisponibilidade")
    escreve(we, evt.sort_values("Data de abertura"), 1)
    nev = len(evt) + 1
    for i in range(2, nev + 1): we.cell(i, 6).fill = INP
    we.column_dimensions["A"].width = 80; we.freeze_panes = "A2"
    titulo_ws(wd, "Disponibilidade por serviço/produto", 1)
    wd["A3"] = "Meta de SLA"; wd["B3"] = SLA_META; wd["B3"].number_format = "0.0%"
    wd["A4"] = "Início do período"; wd["B4"] = pd.Timestamp("2026-09-01").to_pydatetime(); wd["B4"].number_format = "dd/mm/yyyy"
    wd["A5"] = "Fim do período"; wd["B5"] = pd.Timestamp("2026-09-30").to_pydatetime(); wd["B5"].number_format = "dd/mm/yyyy"
    wd["A6"] = "Minutos no período"; wd["B6"] = "=(B5-B4+1)*1440"
    wd["A7"] = "Indisponibilidade permitida (min)"; wd["B7"] = "=B6*(1-B3)"
    wd["A8"] = "Indisponibilidade permitida (h:min)"; wd["B8"] = '=TEXT(INT(B7/60),"0")&"h"&TEXT(MOD(ROUND(B7,0),60),"00")&"min"'
    for c in ("B3", "B4", "B5"): wd[c].fill = INP
    wd["D3"] = "Células amarelas são entradas. Ajuste o período e preencha a coluna F da aba 'Eventos indisponibilidade' com os minutos reais de indisponibilidade (monitoramento/NOC)."
    hdr = ["Serviço / Produto", "Meta SLA", "Permitido no período", "Eventos candidatos no período", "Eventos com duração informada", "Indisponibilidade apurada (min)", "Disponibilidade apurada", "Indisponibilidade apurada (h:min)", "Situação"]
    for j, h in enumerate(hdr, 1):
        c = wd.cell(10, j, h); c.font = Font(bold=True, color="FFFFFF"); c.fill = HDR; c.alignment = Alignment(wrap_text=True)
    srv = sorted(df["Serviço"].unique())
    E = "'Eventos indisponibilidade'!"
    for i, s in enumerate(srv, start=11):
        rng = lambda col: f"{E}${col}$2:${col}${nev}"
        per = f'{rng("D")},">="&$B$4,{rng("D")},"<="&$B$5'
        wd.cell(i, 1, s); wd.cell(i, 2, "=$B$3").number_format = "0.0%"; wd.cell(i, 3, "=$B$8")
        wd.cell(i, 4, f'=COUNTIFS({rng("B")},A{i},{per})')
        wd.cell(i, 5, f'=COUNTIFS({rng("B")},A{i},{rng("F")},">0",{per})')
        wd.cell(i, 6, f'=SUMIFS({rng("F")},{rng("B")},A{i},{per})')
        wd.cell(i, 7, f'=IF(E{i}=0,IF(D{i}=0,1,"n/d"),1-F{i}/$B$6)').number_format = "0.000%"
        wd.cell(i, 8, f'=TEXT(INT(F{i}/60),"0")&"h"&TEXT(MOD(ROUND(F{i},0),60),"00")&"min"')
        wd.cell(i, 9, f'=IF(G{i}="n/d","Sem duração informada",IF(F{i}<=$B$7,"Dentro do SLA","Estourou o SLA"))')
    for j, w in enumerate([34, 10, 18, 18, 18, 20, 18, 20, 24], 1): wd.column_dimensions[get_column_letter(j)].width = w
    wd.cell(12 + len(srv), 1, "Atenção: 'Disponibilidade = 100%' só aparece quando não há evento candidato no período; 'n/d' indica evento sem duração.").font = Font(italic=True)

    # ---- Premissas
    wp = wb.create_sheet("Premissas")
    linhas = [
        "Aberto = status diferente de Feito e Cancelado, em qualquer planilha (inclui itens com status aberto dentro de 'Finalizados').",
        "Resolvido = status 'Feito' em qualquer planilha (inclui itens 'Feito' ainda presentes nas planilhas de abertos).",
        "Cancelado = status 'Cancelado' — mostrado à parte, fora de abertos e resolvidos.",
        "Linhas de total do monday (sem nome) foram descartadas; duplicados (mesmo nome + data de abertura) foram removidos.",
        f"Reabertura: chamado B é recorrência de A quando A está 'Feito', B foi aberto depois da conclusão de A (ou da abertura de A, se não há conclusão) e os nomes têm similaridade ≥ {LIM_MEDIA}% (prefixo antes do '|' e palavras vazias ignorados). Confiança Alta ≥ {LIM_ALTA}%.",
        "A coluna 'Quantidade GLPI' NÃO foi usada como reabertura.",
        "Criticidade (P1–P4) vem da coluna 'Criticidade'; vazios ficam 'Sem classificação'.",
        "Categoria: grupo/título do chamado por palavras-chave; quando não casam, usa a coluna 'Tipo' do monday; senão 'Não classificado'. É heurística — conferir.",
        "Serviço/Produto: fila de origem (Awdio, Eng. de Vídeo, Conteúdo), depois Cliente/Plataforma, palavras do título e Device. É heurística.",
        "Disponibilidade: as planilhas só têm datas (sem hora) e nenhuma duração de indisponibilidade; por isso o % não pode ser apurado automaticamente. A aba traz a estrutura (meta 99,5% = 3h43min em 31 dias) e eventos candidatos (P1/P2 com termos de instabilidade); basta informar os minutos reais.",
    ]
    wp.column_dimensions["A"].width = 160
    for i, l in enumerate(linhas, 1): wp.cell(i, 1, f"{i}. {l}").alignment = Alignment(wrap_text=True)

    # ---- Base
    wbse = wb.create_sheet("Base consolidada")
    cols = ["Fila", "Nome", "Estado", "Status", "Prioridade_N", "TIPO N3", "Categoria", "Serviço", "Cliente/Plataforma",
            "Device", "Tipo", "Time", "Grupo", "Data de abertura", "Data de Conclusão", "Mês abertura", "Mês conclusão"]
    escreve(wbse, df[cols], 1); wbse.freeze_panes = "A2"; wbse.auto_filter.ref = wbse.dimensions
    wb.save(saida); print("OK", saida)
    print(k); print(t); print(top)
    print("reaberturas", len(reab)); print(df.Categoria.value_counts()); print(df["Serviço"].value_counts())

if __name__ == "__main__":
    main()
