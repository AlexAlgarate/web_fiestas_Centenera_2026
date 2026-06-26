import localData from '../data/expenses.json';

/**
 * Reads expense data for the "Cuentas de las Fiestas" chart.
 *
 * Two data sources are supported, in this order of priority:
 *
 * 1. A published Google Sheet (CSV), if the env var
 *    `GOOGLE_SHEET_EXPENSES_CSV_URL` is set. The fetch happens at BUILD
 *    TIME (this is a static site), so a new deploy is needed to pick up
 *    changes made in the sheet — see the README section for how to get
 *    that URL and how to trigger a rebuild without pushing code.
 *
 * 2. `src/data/expenses.json`, used whenever the env var above is not
 *    set, or if the fetch/parse fails for any reason (network issue,
 *    sheet unpublished, unexpected format, etc.). This keeps a build from
 *    ever breaking because of a spreadsheet problem, and lets you maintain
 *    the numbers by hand if you prefer — exactly like `sponsors.json`.
 *
 * Expected sheet layout (same as the existing accounting sheet):
 *   Column A: Tipo                     -> category name
 *   Column B: N Gastos                 -> number of expenses (optional, informational)
 *   Column C: Total / Tipo de gasto    -> amount in euros (Spanish format, e.g. "7.700,00 €")
 *   Column D: % / total de gasto       -> ignored; we recompute the percentage from the
 *                                          totals so it's always consistent, even if a row
 *                                          is added or edited later.
 *
 * If you ever reorder the columns in the sheet, update the three
 * COLUMN_* constants below to match.
 */

const COLUMN_NAME = 0;
const COLUMN_COUNT = 1;
const COLUMN_TOTAL = 2;

export interface ExpenseCategory {
  name: string;
  total: number;
  count: number;
}

export interface ExpenseCategoryWithShare extends ExpenseCategory {
  percentage: number;
}

export interface ExpensesData {
  categories: ExpenseCategoryWithShare[];
  grandTotal: number;
  updatedAt: string;
  source: 'google-sheet' | 'local-json';
}

/** Minimal RFC4180-style CSV parser (handles quoted fields and escaped quotes). */
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

/** Parses a Spanish-formatted amount like "7.700,00 €" or "360,39" into a number. */
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
        `[expenses] No se pudo descargar el CSV (HTTP ${response.status}). Usando datos locales.`,
      );
      return null;
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      console.warn(
        '[expenses] El CSV descargado está vacío o solo tiene cabecera. Usando datos locales.',
      );
      return null;
    }

    const dataRows = rows.slice(1);
    const categories: ExpenseCategory[] = [];

    for (const row of dataRows) {
      const name = (row[COLUMN_NAME] ?? '').trim();
      if (!name) continue;
      // Skip footer/summary rows like "Total", "Total general", "Suma total".
      if (/^(total( general)?|suma( total)?)$/i.test(name)) continue;

      const total = parseSpanishNumber(row[COLUMN_TOTAL] ?? '0');
      const count =
        parseInt((row[COLUMN_COUNT] ?? '0').replace(/[^\d-]/g, ''), 10) || 0;

      categories.push({ name, total, count });
    }

    return categories.length > 0 ? categories : null;
  } catch (error) {
    console.warn(
      '[expenses] Error al consultar Google Sheets, se usarán los datos locales:',
      error,
    );
    return null;
  }
}

export async function getExpensesData(): Promise<ExpensesData> {
  const sheetUrl = import.meta.env.GOOGLE_SHEET_EXPENSES_CSV_URL as
    | string
    | undefined;

  let categories: ExpenseCategory[] | null = null;
  let source: ExpensesData['source'] = 'local-json';

  if (sheetUrl) {
    categories = await fetchFromGoogleSheet(sheetUrl);
    if (categories) source = 'google-sheet';
  }

  if (!categories) {
    categories = localData.categories as ExpenseCategory[];
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
    updatedAt:
      source === 'local-json'
        ? (localData.updatedAt as string)
        : new Date().toISOString().slice(0, 10),
    source,
  };
}
