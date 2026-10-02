import { BANK_NAME, formatMoney, formatShortDate, type BankAccount, type Statement } from "./bank-data";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 50;
const ROW_HEIGHT = 16;

type Font = "F1" | "F2";

// PDF text uses single-byte WinAnsi encoding, so anything outside Latin-1 is replaced.
function pdfText(value: string): string {
  return value
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\xFF]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

// Helvetica widths (per 1000 units) for the characters that appear in money amounts.
const AMOUNT_WIDTHS: Record<string, number> = { ".": 278, ",": 278, "-": 333, " ": 278 };
const amountWidth = (text: string, size: number) =>
  ([...text].reduce((sum, char) => sum + (AMOUNT_WIDTHS[char] ?? 556), 0) * size) / 1000;

class PageWriter {
  pages: string[][] = [[]];
  y = PAGE_HEIGHT - MARGIN;

  get ops() {
    return this.pages[this.pages.length - 1];
  }

  text(x: number, text: string, { size = 10, font = "F1" as Font } = {}) {
    this.ops.push(`BT /${font} ${size} Tf ${x.toFixed(2)} ${this.y.toFixed(2)} Td (${pdfText(text)}) Tj ET`);
  }

  amount(rightX: number, text: string, { size = 10, font = "F1" as Font } = {}) {
    this.text(rightX - amountWidth(text, size), text, { size, font });
  }

  line(y = this.y) {
    this.ops.push(`0.75 G ${MARGIN} ${y.toFixed(2)} m ${PAGE_WIDTH - MARGIN} ${y.toFixed(2)} l S 0 G`);
  }

  down(by: number) {
    this.y -= by;
  }

  newPage() {
    this.pages.push([]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  roomFor(height: number) {
    return this.y - height > MARGIN + 30;
  }
}

const COLUMNS = { date: MARGIN, description: MARGIN + 80, out: 390, in: 465, balance: PAGE_WIDTH - MARGIN };

function tableHeader(page: PageWriter) {
  page.text(COLUMNS.date, "Date", { font: "F2" });
  page.text(COLUMNS.description, "Description", { font: "F2" });
  page.amount(COLUMNS.out, "Money out", { font: "F2" });
  page.amount(COLUMNS.in, "Money in", { font: "F2" });
  page.amount(COLUMNS.balance, "Balance", { font: "F2" });
  page.down(6);
  page.line();
  page.down(ROW_HEIGHT);
}

type StatementAccount = Pick<BankAccount, "username" | "fullName" | "addressLine1" | "townOrCity" | "postcode" | "sortCode" | "accountNumber">;

export function buildStatementPdf(account: StatementAccount, statement: Statement): Uint8Array {
  const page = new PageWriter();

  page.text(MARGIN, BANK_NAME, { size: 22, font: "F2" });
  page.down(18);
  page.text(MARGIN, "PRACTICE STATEMENT - NOT A REAL BANK. NO REAL MONEY.", { size: 9, font: "F2" });
  page.down(34);

  page.text(MARGIN, `Statement for ${statement.title}`, { size: 15, font: "F2" });
  page.down(22);
  page.text(MARGIN, `Account holder: ${account.fullName || account.username}`);
  page.down(14);
  if (account.addressLine1) {
    page.text(MARGIN, `Address: ${account.addressLine1}, ${account.townOrCity}, ${account.postcode}`);
    page.down(14);
  }
  page.text(MARGIN, `Sort code: ${account.sortCode}    Account number: ${account.accountNumber}`);
  page.down(26);

  const summary: [string, string][] = [
    ["Opening balance", formatMoney(statement.openingBalancePence)],
    ["Money in", formatMoney(statement.inPence)],
    ["Money out", formatMoney(statement.outPence)],
    ["Closing balance", formatMoney(statement.closingBalancePence)],
  ];
  for (const [label, value] of summary) {
    const font: Font = label === "Closing balance" ? "F2" : "F1";
    page.text(MARGIN, label, { font, size: 11 });
    page.amount(MARGIN + 240, value, { font, size: 11 });
    page.down(16);
  }
  page.down(18);

  tableHeader(page);
  for (const transaction of statement.transactions) {
    if (!page.roomFor(ROW_HEIGHT)) {
      page.newPage();
      tableHeader(page);
    }
    page.text(COLUMNS.date, formatShortDate(transaction.postedAt));
    const description = transaction.reference ? `${transaction.description} (${transaction.reference})` : transaction.description;
    page.text(COLUMNS.description, description.length > 40 ? `${description.slice(0, 39)}...` : description);
    if (transaction.amountPence < 0) page.amount(COLUMNS.out, formatMoney(-transaction.amountPence));
    else page.amount(COLUMNS.in, formatMoney(transaction.amountPence));
    page.amount(COLUMNS.balance, formatMoney(transaction.balanceAfterPence));
    page.down(ROW_HEIGHT);
  }

  page.pages.forEach((ops, index) => {
    ops.push(
      `BT /F1 8 Tf ${MARGIN} 30 Td (${pdfText(
        `This is a pretend statement made by Computer Steps for practice. Page ${index + 1} of ${page.pages.length}`,
      )}) Tj ET`,
    );
  });

  return assemblePdf(page.pages.map((ops) => ops.join("\n")));
}

function assemblePdf(pageStreams: string[]): Uint8Array {
  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = add("");
  const pagesId = add("");
  const regular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const bold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

  const pageIds = pageStreams.map((stream) => {
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    return add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
        `/Resources << /Font << /F1 ${regular} 0 R /F2 ${bold} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  // Every character is a single byte, so string lengths are byte offsets.
  let output = "%PDF-1.4\n";
  const offsets = objects.map((body, index) => {
    const offset = output.length;
    output += `${index + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const xrefOffset = output.length;
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  output += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Uint8Array.from(output, (char) => char.charCodeAt(0));
}

export function downloadStatementPdf(account: StatementAccount, statement: Statement, fileName: string) {
  const blob = new Blob([buildStatementPdf(account, statement) as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
