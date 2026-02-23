import { NextResponse } from "next/server"
import { getClientById, type Client } from "@/lib/db"
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
  VerticalAlign,
  ShadingType,
  TabStopPosition,
  TabStopType,
  convertInchesToTwip,
} from "docx"

// Company info matching the Word template
const COMPANY = {
  name: "NUOVA MISURASC  LE",
  type: "Soc.Coop. A.R.L.",
  tagline: "Fabbrica di scale a giorno e a chiocciola in legno e metallo",
  sede: "Via Lomanto 12, 70033 - Corato (BA)",
  stabilimento: "SP85 Bisceglie Nuova, Km 11.900, Ruvo di Puglia (BA)",
  tel: "080 3629757",
  cell: "349 0627401",
  mail: "nuovamisurascale@libero.it",
  pec: "nuovamisurascalesoccoop@pec.it",
  cciaa: "429246",
  piva: "05605970721",
}

// Colors from the Word template
const RED_COLOR = "CC3333"
const BLUE_HEADER = "C5D9F1" // Light blue for header rows
const LIGHT_BLUE = "DCE6F1" // Very light blue for alternating rows
const PINK_ROW = "F2DCDB" // Pink/red for alternating rows
const PINK_HEADER = "E6B8B7" // Darker pink for summary headers
const WHITE = "FFFFFF"
const BLACK = "000000"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clientId = parseInt(id, 10)
    const url = new URL(request.url)
    const docType = url.searchParams.get("type") || "scheda"

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
        filename = `DDT_${client.ragione_sociale.replace(/[^a-zA-Z0-9]/g, "_")}.docx`
        break
      case "fattura":
        doc = createFatturaDocument(client)
        filename = `Fattura_${client.ragione_sociale.replace(/[^a-zA-Z0-9]/g, "_")}.docx`
        break
      default:
        doc = createSchedaDocument(client)
        filename = `Scheda_${client.ragione_sociale.replace(/[^a-zA-Z0-9]/g, "_")}.docx`
    }

    const buffer = await Packer.toBuffer(doc)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting client:", error)
    return NextResponse.json(
      { error: "Failed to export client" },
      { status: 500 }
    )
  }
}

// ============================================================
// SHARED HEADER - Company header used by both Fattura and DDT
// ============================================================
function createCompanyHeader(): Paragraph[] {
  return [
    // Company name in red
    new Paragraph({
      children: [
        new TextRun({
          text: COMPANY.name,
          bold: true,
          size: 28,
          color: RED_COLOR,
          font: "Arial",
        }),
      ],
      spacing: { after: 0 },
    }),
    // Company type in red
    new Paragraph({
      children: [
        new TextRun({
          text: COMPANY.type,
          bold: true,
          size: 20,
          color: RED_COLOR,
          font: "Arial",
        }),
      ],
      spacing: { after: 40 },
    }),
    // Tagline in red italic
    new Paragraph({
      children: [
        new TextRun({
          text: COMPANY.tagline,
          italics: true,
          size: 16,
          color: RED_COLOR,
          font: "Arial",
        }),
      ],
      spacing: { after: 200 },
    }),
  ]
}

function createCompanyDetailsRight(): Paragraph[] {
  const detailStyle = { size: 15, font: "Arial" as const }
  const labelStyle = { ...detailStyle, bold: true }

  return [
    new Paragraph({
      children: [
        new TextRun({ text: "Sede legale: ", ...labelStyle }),
        new TextRun({ text: COMPANY.sede, ...detailStyle }),
      ],
      alignment: AlignmentType.LEFT,
      spacing: { after: 20 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Stab. e uffici: ", ...labelStyle }),
        new TextRun({ text: COMPANY.stabilimento, ...detailStyle }),
      ],
      spacing: { after: 20 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Tel: ", ...labelStyle }),
        new TextRun({ text: COMPANY.tel, ...detailStyle }),
        new TextRun({ text: " - Cell: ", ...labelStyle }),
        new TextRun({ text: COMPANY.cell, ...detailStyle }),
        new TextRun({ text: " - Mail: ", ...labelStyle }),
        new TextRun({ text: COMPANY.mail, ...detailStyle, color: "0000FF" }),
      ],
      spacing: { after: 20 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Pec: ", ...labelStyle }),
        new TextRun({ text: COMPANY.pec, ...detailStyle, color: "0000FF" }),
      ],
      spacing: { after: 20 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Iscrizione C.C.I.A.A. Bari: ", ...labelStyle }),
        new TextRun({ text: COMPANY.cciaa, ...detailStyle }),
        new TextRun({ text: " - P.IVA: ", ...labelStyle }),
        new TextRun({ text: COMPANY.piva, ...detailStyle }),
      ],
      spacing: { after: 200 },
    }),
  ]
}

// Header table: logo+name left, details right
function createHeaderTable(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          // Left: Company name + tagline
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [...createCompanyHeader()],
            borders: noBorders(),
            verticalAlign: VerticalAlign.TOP,
          }),
          // Right: Company details
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [...createCompanyDetailsRight()],
            borders: noBorders(),
            verticalAlign: VerticalAlign.TOP,
          }),
        ],
      }),
    ],
  })
}

// Client address box (right-aligned with border)
function createClientBox(client: Client): Table {
  const clientName = client.ragione_sociale
  const address = client.indirizzo || "Via/V.le/Piazza/C.da/Str."
  const cityLine = client.citta
    ? `${client.cap ? client.cap + " - " : ""}${client.citta}${client.provincia ? ` (${client.provincia})` : ""}`
    : "CAP - CITTA' ()"

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          // Spacer cell (left)
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: "" })],
            borders: noBorders(),
          }),
          // Client info box (right)
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ text: "", spacing: { after: 100 } }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: clientName,
                    bold: true,
                    size: 22,
                    font: "Arial",
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: address,
                    size: 20,
                    font: "Arial",
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: cityLine,
                    size: 20,
                    font: "Arial",
                  }),
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 100 },
              }),
            ],
            borders: thinBorders(),
          }),
        ],
      }),
    ],
  })
}

// ============================================================
// FATTURA DOCUMENT
// ============================================================
function createFatturaDocument(client: Client): Document {
  const today = new Date()
  const invoiceNumber = `FT-${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: {
              top: convertInchesToTwip(0.6),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.6),
              right: convertInchesToTwip(0.6),
            },
          },
        },
        children: [
          // Header
          createHeaderTable(),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Client box
          createClientBox(client),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // Row 1: N. fattura, Data documento, Descrizione pagamento, Codice univoco cliente
          createFatturaInfoRow1(invoiceNumber, today),

          // Row 2: Rif. Bolla accomp., Partita IVA
          createFatturaInfoRow2(client),

          // Items table header
          createFatturaItemsHeader(),

          // Empty items rows (alternating blue/pink)
          ...createFatturaItemRows(10),

          // Totals row
          createFatturaTotalsRow(),

          // Totals values row
          createFatturaTotalsValuesRow(),

          // Scadenziario + TOTALE
          createFatturaScadenziarioRow(),

          // Acconto row
          createFatturaAccontoRow(),

          new Paragraph({ text: "", spacing: { after: 200 } }),
          createFooterParagraph(),
        ],
      },
    ],
  })
}

function createFatturaInfoRow1(invoiceNumber: string, today: Date): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header labels
      new TableRow({
        children: [
          createStyledCell("N. fattura", BLUE_HEADER, true, 15, AlignmentType.CENTER),
          createStyledCell("Data documento", BLUE_HEADER, true, 20, AlignmentType.CENTER),
          createStyledCell("Descrizione pagamento", BLUE_HEADER, true, 40, AlignmentType.CENTER),
          createStyledCell("Codice univoco cliente", BLUE_HEADER, true, 25, AlignmentType.CENTER),
        ],
      }),
      // Values
      new TableRow({
        children: [
          createStyledCell(invoiceNumber, WHITE, false, 15, AlignmentType.CENTER),
          createStyledCell(today.toLocaleDateString("it-IT"), WHITE, false, 20, AlignmentType.CENTER),
          createStyledCell("", WHITE, false, 40, AlignmentType.CENTER),
          createStyledCell("", WHITE, false, 25, AlignmentType.CENTER),
        ],
      }),
    ],
  })
}

function createFatturaInfoRow2(client: Client): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell("Rif. Bolla accomp. n:", LIGHT_BLUE, true, 20, AlignmentType.CENTER),
          createStyledCell("del:", LIGHT_BLUE, true, 15, AlignmentType.CENTER),
          createStyledCell("", LIGHT_BLUE, false, 35, AlignmentType.CENTER),
          createStyledCell("Partita IVA o Codice Fiscale", LIGHT_BLUE, true, 30, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell("", WHITE, false, 20, AlignmentType.CENTER),
          createStyledCell("", WHITE, false, 15, AlignmentType.CENTER),
          createStyledCell("", WHITE, false, 35, AlignmentType.CENTER),
          createStyledCell(client.partita_iva || "", WHITE, false, 30, AlignmentType.CENTER),
        ],
      }),
    ],
  })
}

function createFatturaItemsHeader(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell("Quantita", BLUE_HEADER, true, 12, AlignmentType.CENTER),
          createStyledCell("Descrizione", BLUE_HEADER, true, 48, AlignmentType.CENTER),
          createStyledCell("Importo", BLUE_HEADER, true, 20, AlignmentType.CENTER),
          createStyledCell("C. IVA ...%", BLUE_HEADER, true, 20, AlignmentType.CENTER),
        ],
      }),
    ],
  })
}

function createFatturaItemRows(count: number): Table[] {
  const rows: TableRow[] = []
  for (let i = 0; i < count; i++) {
    const bgColor = i % 2 === 0 ? LIGHT_BLUE : PINK_ROW
    rows.push(
      new TableRow({
        children: [
          createStyledCell(" ", bgColor, false, 12, AlignmentType.CENTER),
          createStyledCell(" ", bgColor, false, 48, AlignmentType.LEFT),
          createStyledCell(" ", bgColor, false, 20, AlignmentType.RIGHT),
          createStyledCell(" ", bgColor, false, 20, AlignmentType.CENTER),
        ],
        height: { value: 400, rule: "atLeast" as unknown as typeof import("docx").HeightRule.AT_LEAST },
      })
    )
  }

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows,
    }),
  ]
}

function createFatturaTotalsRow(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell("Tot. Merce", PINK_HEADER, true, 20, AlignmentType.CENTER),
          createStyledCell("Sconto (in %)", PINK_HEADER, true, 20, AlignmentType.CENTER),
          createStyledCell("Spese incasso", PINK_HEADER, true, 20, AlignmentType.CENTER),
          createStyledCell("Totale imponibile", PINK_HEADER, true, 20, AlignmentType.CENTER),
          createStyledCell("Totale imposta", PINK_HEADER, true, 20, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell(" ", PINK_ROW, false, 20, AlignmentType.RIGHT),
          createStyledCell(" ", PINK_ROW, false, 20, AlignmentType.RIGHT),
          createStyledCell(" ", PINK_ROW, false, 20, AlignmentType.RIGHT),
          createStyledCell(" ", PINK_ROW, false, 20, AlignmentType.RIGHT),
          createStyledCell(" ", PINK_ROW, false, 20, AlignmentType.RIGHT),
        ],
      }),
    ],
  })
}

function createFatturaTotalsValuesRow(): Paragraph {
  return new Paragraph({ text: "", spacing: { after: 0 } })
}

function createFatturaScadenziarioRow(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell(
            "Scadenziario rate e relativo importo",
            LIGHT_BLUE,
            true,
            80,
            AlignmentType.LEFT
          ),
          createStyledCell("TOTALE", PINK_HEADER, true, 20, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell(" ", WHITE, false, 80, AlignmentType.LEFT),
          createStyledCell(" ", PINK_ROW, false, 20, AlignmentType.RIGHT),
        ],
      }),
    ],
  })
}

function createFatturaAccontoRow(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell(" ", WHITE, false, 80, AlignmentType.LEFT),
          createStyledCell("Acconto", PINK_HEADER, true, 20, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell(" ", WHITE, false, 80, AlignmentType.LEFT),
          createStyledCell(" ", PINK_ROW, false, 20, AlignmentType.RIGHT),
        ],
      }),
    ],
  })
}

// ============================================================
// DDT DOCUMENT (adapted from Fattura style)
// ============================================================
function createDDTDocument(client: Client): Document {
  const today = new Date()
  const ddtNumber = `DDT-${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: {
              top: convertInchesToTwip(0.6),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.6),
              right: convertInchesToTwip(0.6),
            },
          },
        },
        children: [
          // Header (same as fattura)
          createHeaderTable(),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Client box (same style as fattura)
          createClientBox(client),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          // DDT Info Row 1: Documento di trasporto | N. doc. | Data documento | Codice Fiscale Cliente | Partita IVA Cliente
          createDDTInfoRow1(ddtNumber, today, client),

          // DDT Info Row 2: Condizioni di pagamento | Partita IVA o Codice Fiscale
          createDDTInfoRow2(client),

          // Items table header
          createDDTItemsHeader(),

          // Empty items rows (alternating blue/pink, same style as fattura)
          ...createDDTItemRows(8),

          // Ora di Partenza / Arrivo / Firme section
          createDDTSignatureSection(),

          // Footer: Causale Trasporto | Vettore | Sottoscrizione alla consegna
          createDDTFooterTable(),

          new Paragraph({ text: "", spacing: { after: 200 } }),
          createFooterParagraph(),
        ],
      },
    ],
  })
}

function createDDTInfoRow1(
  ddtNumber: string,
  today: Date,
  client: Client
): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header labels
      new TableRow({
        children: [
          createStyledCell("Documento di trasporto", BLUE_HEADER, true, 25, AlignmentType.CENTER),
          createStyledCell("N. doc.", BLUE_HEADER, true, 15, AlignmentType.CENTER),
          createStyledCell("Data documento", BLUE_HEADER, true, 20, AlignmentType.CENTER),
          createStyledCell("Codice Fiscale Cliente", BLUE_HEADER, true, 20, AlignmentType.CENTER),
          createStyledCell("Partita IVA Cliente", BLUE_HEADER, true, 20, AlignmentType.CENTER),
        ],
      }),
      // Values
      new TableRow({
        children: [
          createStyledCell("", WHITE, false, 25, AlignmentType.CENTER),
          createStyledCell(ddtNumber, WHITE, false, 15, AlignmentType.CENTER),
          createStyledCell(today.toLocaleDateString("it-IT"), WHITE, false, 20, AlignmentType.CENTER),
          createStyledCell("", WHITE, false, 20, AlignmentType.CENTER),
          createStyledCell(client.partita_iva || "", WHITE, false, 20, AlignmentType.CENTER),
        ],
      }),
    ],
  })
}

function createDDTInfoRow2(client: Client): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell("Condizioni di pagamento", LIGHT_BLUE, true, 50, AlignmentType.CENTER),
          createStyledCell("Partita IVA o Codice Fiscale", LIGHT_BLUE, true, 50, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell("", WHITE, false, 50, AlignmentType.CENTER),
          createStyledCell(client.partita_iva || "", WHITE, false, 50, AlignmentType.CENTER),
        ],
      }),
    ],
  })
}

function createDDTItemsHeader(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell("Quantita", BLUE_HEADER, true, 10, AlignmentType.CENTER),
          createStyledCell("Descrizione", BLUE_HEADER, true, 35, AlignmentType.CENTER),
          createStyledCell("Descrizione colli", BLUE_HEADER, true, 20, AlignmentType.CENTER),
          createStyledCell("Numero colli", BLUE_HEADER, true, 15, AlignmentType.CENTER),
          createStyledCell("IVA %", BLUE_HEADER, true, 20, AlignmentType.CENTER),
        ],
      }),
    ],
  })
}

function createDDTItemRows(count: number): Table[] {
  const rows: TableRow[] = []
  for (let i = 0; i < count; i++) {
    const bgColor = i % 2 === 0 ? LIGHT_BLUE : PINK_ROW
    rows.push(
      new TableRow({
        children: [
          createStyledCell(" ", bgColor, false, 10, AlignmentType.CENTER),
          createStyledCell(" ", bgColor, false, 35, AlignmentType.LEFT),
          createStyledCell(" ", bgColor, false, 20, AlignmentType.CENTER),
          createStyledCell(" ", bgColor, false, 15, AlignmentType.CENTER),
          createStyledCell(" ", bgColor, false, 20, AlignmentType.CENTER),
        ],
        height: { value: 400, rule: "atLeast" as unknown as typeof import("docx").HeightRule.AT_LEAST },
      })
    )
  }

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows,
    }),
  ]
}

function createDDTSignatureSection(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Ora di Partenza
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Ora di Partenza:",
                    bold: true,
                    size: 18,
                    font: "Arial",
                  }),
                ],
                spacing: { before: 80, after: 40 },
              }),
              new Paragraph({
                text: "______________________________",
                spacing: { after: 80 },
              }),
            ],
            borders: dashedBorders(),
            columnSpan: 3,
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: " " })],
            borders: thinBorders(),
            columnSpan: 2,
          }),
        ],
      }),
      // Ora di Arrivo
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Ora di Arrivo:",
                    bold: true,
                    size: 18,
                    font: "Arial",
                  }),
                ],
                spacing: { before: 80, after: 40 },
              }),
              new Paragraph({
                text: "______________________________",
                spacing: { after: 80 },
              }),
            ],
            borders: dashedBorders(),
            columnSpan: 3,
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: " " })],
            borders: thinBorders(),
            columnSpan: 2,
          }),
        ],
      }),
      // Firma conducente
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Firma conducente:",
                    bold: true,
                    size: 18,
                    font: "Arial",
                  }),
                ],
                spacing: { before: 80, after: 40 },
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                text: "______________________________",
                spacing: { after: 80 },
              }),
            ],
            borders: dashedBorders(),
            columnSpan: 3,
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: " " })],
            borders: thinBorders(),
            columnSpan: 2,
          }),
        ],
      }),
      // Firma destinatario
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Firma destinatario:",
                    bold: true,
                    size: 18,
                    font: "Arial",
                  }),
                ],
                spacing: { before: 80, after: 40 },
              }),
              new Paragraph({ text: "" }),
              new Paragraph({
                text: "______________________________",
                spacing: { after: 80 },
              }),
            ],
            borders: dashedBorders(),
            columnSpan: 3,
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: " " })],
            borders: thinBorders(),
            columnSpan: 2,
          }),
        ],
      }),
    ],
  })
}

function createDDTFooterTable(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell("Causale Trasporto", BLUE_HEADER, true, 30, AlignmentType.CENTER),
          createStyledCell("Vettore", BLUE_HEADER, true, 30, AlignmentType.CENTER),
          createStyledCell("Sottoscrizione alla consegna", BLUE_HEADER, true, 40, AlignmentType.CENTER),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell(" ", WHITE, false, 30, AlignmentType.CENTER),
          createStyledCell(" ", WHITE, false, 30, AlignmentType.CENTER),
          createStyledCell(" ", WHITE, false, 40, AlignmentType.CENTER),
        ],
        height: { value: 500, rule: "atLeast" as unknown as typeof import("docx").HeightRule.AT_LEAST },
      }),
    ],
  })
}

// ============================================================
// SCHEDA CLIENTE (kept simple)
// ============================================================
function createSchedaDocument(client: Client): Document {
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.6),
              bottom: convertInchesToTwip(0.5),
              left: convertInchesToTwip(0.6),
              right: convertInchesToTwip(0.6),
            },
          },
        },
        children: [
          // Same header as fattura/ddt
          createHeaderTable(),

          new Paragraph({ text: "", spacing: { after: 300 } }),

          new Paragraph({
            text: "Scheda Cliente",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: client.ragione_sociale,
                bold: true,
                size: 32,
                font: "Arial",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),

          createInfoTable([
            ["Ragione Sociale", client.ragione_sociale],
            ["Codice Fiscale", client.codice_fiscale || "-"],
            ["Partita IVA", client.partita_iva || "-"],
            ["Codice Univoco", client.codice_univoco || "-"],
            ["Email", client.email || "-"],
            ["PEC", client.pec || "-"],
            ["Telefono", client.telefono || "-"],
            ["Indirizzo", client.indirizzo || "-"],
            ["Citta", client.citta || "-"],
            ["Provincia", client.provincia || "-"],
            ["CAP", client.cap || "-"],
          ]),

          new Paragraph({ text: "", spacing: { after: 200 } }),
          createFooterParagraph(),
        ],
      },
    ],
  })
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function createStyledCell(
  text: string,
  bgColor: string,
  bold: boolean,
  widthPercent: number,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType]
): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
            size: 17,
            font: "Arial",
          }),
        ],
        alignment,
      }),
    ],
    shading: {
      type: ShadingType.CLEAR,
      fill: bgColor,
    },
    borders: thinBorders(),
    verticalAlign: VerticalAlign.CENTER,
  })
}

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
                  children: [
                    new TextRun({ text: label, bold: true, font: "Arial", size: 18 }),
                  ],
                }),
              ],
              shading: { type: ShadingType.CLEAR, fill: BLUE_HEADER },
              borders: thinBorders(),
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: value, font: "Arial", size: 18 }),
                  ],
                }),
              ],
              borders: thinBorders(),
            }),
          ],
        })
    ),
  })
}

function createFooterParagraph(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `Documento generato il ${new Date().toLocaleDateString("it-IT")} alle ${new Date().toLocaleTimeString("it-IT")}`,
        italics: true,
        size: 16,
        color: "888888",
        font: "Arial",
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
  })
}

function thinBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
  }
}

function dashedBorders() {
  return {
    top: { style: BorderStyle.DASHED, size: 1, color: "999999" },
    bottom: { style: BorderStyle.DASHED, size: 1, color: "999999" },
    left: { style: BorderStyle.DASHED, size: 1, color: "999999" },
    right: { style: BorderStyle.DASHED, size: 1, color: "999999" },
  }
}

function noBorders() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: WHITE },
    bottom: { style: BorderStyle.NONE, size: 0, color: WHITE },
    left: { style: BorderStyle.NONE, size: 0, color: WHITE },
    right: { style: BorderStyle.NONE, size: 0, color: WHITE },
  }
}
