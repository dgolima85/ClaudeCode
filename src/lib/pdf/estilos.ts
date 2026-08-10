import { StyleSheet } from "@react-pdf/renderer";

export const estilos = StyleSheet.create({
  pagina: { padding: 32, fontSize: 9, fontFamily: "Helvetica", color: "#111827" },
  tituloRelatorio: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  subtitulo: { fontSize: 9, color: "#6b7280", marginBottom: 16 },
  secaoTitulo: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 16, marginBottom: 6 },

  tabela: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 2,
    marginBottom: 4,
  },
  linhaCabecalho: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  linha: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  celulaCabecalho: { padding: 4, fontFamily: "Helvetica-Bold", fontSize: 8 },
  celula: { padding: 4, fontSize: 8 },

  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 2,
    padding: 8,
  },
  campo: { width: "33%", marginBottom: 8, paddingRight: 8 },
  campoLabel: { fontSize: 7, color: "#6b7280", textTransform: "uppercase", marginBottom: 2 },
  campoValor: { fontSize: 9 },

  blocoDestaque: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 2, padding: 8, marginBottom: 8 },
  blocoDestaqueLabel: {
    fontSize: 7,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 3,
    fontFamily: "Helvetica-Bold",
  },
  blocoDestaqueTexto: { fontSize: 9 },

  eventoItem: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingVertical: 4 },
  eventoCabecalho: { fontSize: 7, color: "#6b7280", marginBottom: 1 },
  eventoTexto: { fontSize: 8.5 },

  rodape: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#9ca3af",
    textAlign: "center",
  },
});
