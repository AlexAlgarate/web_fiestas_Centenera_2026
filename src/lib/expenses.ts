const COLUMN_NAME = 0;
const COLUMN_TOTAL = 1;

export interface ExpenseCategory {
  name: string;
  total: number;
}

export interface ExpenseCategoryWithShare extends ExpenseCategory {
  percentage: number;
}

export interface ExpensesData {
  categories: ExpenseCategoryWithShare[];
  grandTotal: number;
  updatedAt: string;
  source: 'google-sheet';
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

function parseSpanishNumber(raw: string): number {
  const cleaned = raw.replace(/[€\s\u00A0]/g, '');
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

async function fetchFromGoogleSheet(
  url: string,
): Promise<ExpenseCategory[] | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(
        `[expenses] No se pudo descargar el CSV (HTTP ${response.status}).`,
      );
      return null;
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      console.warn(
        '[expenses] El CSV descargado está vacío o solo tiene cabecera.',
      );
      return null;
    }

    const dataRows = rows.slice(1);
    const categories: ExpenseCategory[] = [];

    for (const row of dataRows) {
      const name = (row[COLUMN_NAME] ?? '').trim();
      if (!name) continue;

      if (/^(total( general)?|suma( total)?)$/i.test(name)) continue;

      const total = parseSpanishNumber(row[COLUMN_TOTAL] ?? '0');

      categories.push({ name, total });
    }

    return categories.length > 0 ? categories : null;
  } catch (error) {
    console.warn('[expenses] Error al consultar Google Sheets:', error);
    return null;
  }
}

export async function getExpensesData(): Promise<ExpensesData> {
  const sheetUrl = import.meta.env.GOOGLE_SHEET_EXPENSES_CSV_URL as
    | string
    | undefined;

  let categories: ExpenseCategory[] | null = null;

  if (sheetUrl) {
    categories = await fetchFromGoogleSheet(sheetUrl);
  }

  if (!categories) {
    return {
      categories: [],
      grandTotal: 0,
      updatedAt: new Date().toISOString().slice(0, 10),
      source: 'google-sheet',
    };
  }

  const grandTotal = categories.reduce((sum, c) => sum + c.total, 0);

  const categoriesWithShare: ExpenseCategoryWithShare[] = categories.map(
    (c) => ({
      ...c,
      percentage:
        grandTotal > 0 ? Math.round((c.total / grandTotal) * 10000) / 100 : 0,
    }),
  );

  return {
    categories: categoriesWithShare,
    grandTotal,
    updatedAt: new Date().toISOString().slice(0, 10),
    source: 'google-sheet',
  };
}
