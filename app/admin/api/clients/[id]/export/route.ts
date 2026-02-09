import { NextResponse } from "next/server"
import { getClientById, type Client, getDb } from "@/lib/db"
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  Packer,
  PageOrientation,
} from "docx"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clientId = parseInt(id, 10)
    const url = new URL(request.url)
    const docType = url.searchParams.get("type") || "scheda" // scheda, ddt, fattura

    if (isNaN(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 })
    }

    const client = await getClientById(clientId)

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    let doc: Document
    let filename: string

    switch (docType) {
      case "ddt":
        doc = createDDTDocument(client)
        filename = `DDT_${client.company_name.replace(/[^a-zA-Z0-9]/g, "_")}.docx`
        break
      case "fattura":
        doc = createFatturaDocument(client)
        filename = `Fattura_${client.company_name.replace(/[^a-zA-Z0-9]/g, "_")}.docx`
        break
      default:
        doc = createSchedaDocument(client)
        filename = `Scheda_${client.company_name.replace(/[^a-zA-Z0-9]/g, "_")}.docx`
    }

    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting client:", error)
    return NextResponse.json({ error: "Failed to export client" }, { status: 500 })
  }
}

// Scheda Cliente standard
function createSchedaDocument(client: Client): Document {
  return new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "Scheda Cliente",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: client.company_name,
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          createInfoTable([
            ["Ragione Sociale", client.company_name],
            ["Contatto", client.contact_name],
            ["Email", client.email],
            ["Telefono", client.phone || "-"],
            ["Indirizzo", client.address || "-"],
            ["Citta", client.city || "-"],
            ["Paese", client.country || "-"],
            ["Partita IVA", client.vat_number || "-"],
            ["Note", client.notes || "-"],
          ]),
          createFooterParagraph(),
        ],
      },
    ],
  })
}

// DDT - Documento di Trasporto
function createDDTDocument(client: Client): Document {
  const today = new Date()
  const ddtNumber = `DDT-${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
            },
          },
        },
        children: [
          // Header azienda mittente
          new Paragraph({
            children: [
              new TextRun({
                text: "MISURASCALE S.R.L.",
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Via Esempio 123 - 20100 Milano (MI)",
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "P.IVA: IT12345678901 - Tel: +39 02 1234567",
                size: 20,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Titolo DDT
          new Paragraph({
            children: [
              new TextRun({
                text: "DOCUMENTO DI TRASPORTO",
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
          }),

          // Info DDT
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Numero DDT"),
                  createValueCell(ddtNumber),
                  createHeaderCell("Data"),
                  createValueCell(today.toLocaleDateString("it-IT")),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // Destinatario
          new Paragraph({
            children: [
              new TextRun({
                text: "DESTINATARIO",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          createInfoTable([
            ["Ragione Sociale", client.company_name],
            ["Indirizzo", client.address || "-"],
            ["CAP - Citta", client.city || "-"],
            ["Paese", client.country || "Italia"],
            ["P.IVA / C.F.", client.vat_number || "-"],
          ]),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // Tabella articoli (vuota per compilazione)
          new Paragraph({
            children: [
              new TextRun({
                text: "DESCRIZIONE MERCE",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          createArticoliTable(),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // Info trasporto
          new Paragraph({
            children: [
              new TextRun({
                text: "DATI TRASPORTO",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          createInfoTable([
            ["Causale Trasporto", "Vendita"],
            ["Aspetto Esteriore Beni", "Colli su bancale"],
            ["Numero Colli", "____"],
            ["Peso Lordo", "____ kg"],
            ["Vettore", "____________________"],
            ["Data/Ora Ritiro", "____________________"],
          ]),

          new Paragraph({ text: "", spacing: { after: 400 } }),

          // Firme
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Firma Mittente", bold: true }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        text: "________________________",
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders: noBorders(),
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Firma Destinatario", bold: true }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        text: "________________________",
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders: noBorders(),
                  }),
                ],
              }),
            ],
          }),

          createFooterParagraph(),
        ],
      },
    ],
  })
}

// Fattura
function createFatturaDocument(client: Client): Document {
  const today = new Date()
  const invoiceNumber = `FT-${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`

  return new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header azienda
          new Paragraph({
            children: [
              new TextRun({
                text: "MISURASCALE S.R.L.",
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Via Esempio 123 - 20100 Milano (MI)",
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "P.IVA: IT12345678901 - C.F.: 12345678901",
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Tel: +39 02 1234567 - Email: info@misurascale.it",
                size: 20,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Titolo
          new Paragraph({
            children: [
              new TextRun({
                text: "FATTURA",
                bold: true,
                size: 36,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 },
          }),

          // Info fattura
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Numero Fattura"),
                  createValueCell(invoiceNumber),
                  createHeaderCell("Data Emissione"),
                  createValueCell(today.toLocaleDateString("it-IT")),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // Cliente
          new Paragraph({
            children: [
              new TextRun({
                text: "DATI CLIENTE",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          createInfoTable([
            ["Ragione Sociale", client.company_name],
            ["Referente", client.contact_name],
            ["Indirizzo", client.address || "-"],
            ["CAP - Citta", client.city || "-"],
            ["Paese", client.country || "Italia"],
            ["P.IVA", client.vat_number || "-"],
            ["Email", client.email],
            ["Telefono", client.phone || "-"],
          ]),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // Tabella articoli fattura
          new Paragraph({
            children: [
              new TextRun({
                text: "DETTAGLIO FATTURA",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          createFatturaTable(),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Totali
          new Table({
            width: { size: 50, type: WidthType.PERCENTAGE },
            columnWidths: [3000, 3000],
            rows: [
              createTotaleRow("Imponibile", "EUR ________"),
              createTotaleRow("IVA 22%", "EUR ________"),
              createTotaleRow("TOTALE", "EUR ________", true),
            ],
          }),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // Pagamento
          new Paragraph({
            children: [
              new TextRun({
                text: "MODALITA DI PAGAMENTO",
                bold: true,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
          }),
          createInfoTable([
            ["Metodo", "Bonifico Bancario"],
            ["IBAN", "IT00 X000 0000 0000 0000 0000 000"],
            ["Banca", "Banca Esempio"],
            ["Scadenza", "30 giorni data fattura"],
          ]),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Note
          client.notes ? new Paragraph({
            children: [
              new TextRun({
                text: "Note: ",
                bold: true,
              }),
              new TextRun({
                text: client.notes,
              }),
            ],
            spacing: { after: 200 },
          }) : new Paragraph({ text: "" }),

          createFooterParagraph(),
        ],
      },
    ],
  })
}

// Helper functions
function createInfoTable(rows: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, bold: true })],
                }),
              ],
              shading: { fill: "f5f5f5" },
              borders: thinBorders(),
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: value })],
              borders: thinBorders(),
            }),
          ],
        })
    ),
  })
}

function createArticoliTable(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createHeaderCell("Codice", 15),
          createHeaderCell("Descrizione", 55),
          createHeaderCell("Q.ta", 15),
          createHeaderCell("U.M.", 15),
        ],
      }),
      ...Array(5)
        .fill(null)
        .map(
          () =>
            new TableRow({
              children: [
                createEmptyCell(15),
                createEmptyCell(55),
                createEmptyCell(15),
                createEmptyCell(15),
              ],
            })
        ),
    ],
  })
}

function createFatturaTable(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createHeaderCell("Codice", 12),
          createHeaderCell("Descrizione", 40),
          createHeaderCell("Q.ta", 10),
          createHeaderCell("Prezzo Unit.", 18),
          createHeaderCell("Totale", 20),
        ],
      }),
      ...Array(5)
        .fill(null)
        .map(
          () =>
            new TableRow({
              children: [
                createEmptyCell(12),
                createEmptyCell(40),
                createEmptyCell(10),
                createEmptyCell(18),
                createEmptyCell(20),
              ],
            })
        ),
    ],
  })
}

function createHeaderCell(text: string, widthPercent = 25): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true })],
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: { fill: "e0e0e0" },
    borders: thinBorders(),
  })
}

function createValueCell(text: string, widthPercent = 25): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ text })],
    borders: thinBorders(),
  })
}

function createEmptyCell(widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ text: " " })],
    borders: thinBorders(),
  })
}

function createTotaleRow(label: string, value: string, isBold = false): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, bold: true })],
            alignment: AlignmentType.RIGHT,
          }),
        ],
        shading: isBold ? { fill: "e0e0e0" } : undefined,
        borders: thinBorders(),
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: value, bold: isBold })],
            alignment: AlignmentType.RIGHT,
          }),
        ],
        shading: isBold ? { fill: "e0e0e0" } : undefined,
        borders: thinBorders(),
      }),
    ],
  })
}

function createFooterParagraph(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `Documento generato il ${new Date().toLocaleDateString("it-IT")} alle ${new Date().toLocaleTimeString("it-IT")}`,
        italics: true,
        size: 18,
        color: "888888",
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
  })
}

function thinBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "cccccc" },
  }
}

function noBorders() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
    left: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
    right: { style: BorderStyle.NONE, size: 0, color: "ffffff" },
  }
}
