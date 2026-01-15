import type {
  IngredientParseResult,
  ParsedIngredientLine,
} from "./recipe.types";
import type { MeasurementUnit } from "../../domain/measurementUnit";

// Map user strings into canonical MeasurementUnit
const UNIT_ALIASES: Record<string, MeasurementUnit> = {
  g: "g",
  gram: "g",
  grams: "g",

  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",

  ml: "ml",
  millilitre: "ml",
  millilitres: "ml",

  l: "l",
  litre: "l",
  litres: "l",

  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",

  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",

  cup: "cup",
  cups: "cup",

  piece: "piece",
  pieces: "piece",

  slice: "slice",
  slices: "slice",

  pinch: "pinch",
  can: "can",
  cans: "can",
  packet: "packet",
  packets: "packet",
  "to taste": "to_taste",
};

function normaliseUnit(raw: string): MeasurementUnit | null {
  const key = raw.trim().toLowerCase();
  return UNIT_ALIASES[key] ?? null;
}

// Parse "1", "1.5", "1/2", "1 1/2" quantities to number
function parseQuantity(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // e.g. "1 1/2"
  const parts = trimmed.split(" ");
  if (parts.length === 2) {
    const whole = Number(parts[0]);
    const frac = fractionToNumber(parts[1] ?? "");
    if (!Number.isNaN(whole) && frac !== null) return whole + frac;
  }

  // e.g. "1/2"
  if (trimmed.includes("/")) {
    const frac = fractionToNumber(trimmed);
    if (frac !== null) return frac;
  }

  // e.g. "1" or "1.5"
  const asNum = Number(trimmed);
  if (!Number.isNaN(asNum)) return asNum;

  return null;
}

function fractionToNumber(raw: string): number | null {
  const [num, den] = raw.split("/");
  if (!num || !den) return null;
  const n = Number(num);
  const d = Number(den);
  if (Number.isNaN(n) || Number.isNaN(d) || d === 0) return null;
  return n / d;
}

export function parseIngredientLine(
  rawText: string,
  lineIndex: number
): ParsedIngredientLine {
  const original = rawText;
  const line = rawText.trim();

  if (!line) {
    return {
      rawText: original,
      status: "unparsed",
      quantity: null,
      unit: null,
      ingredientName: null,
      notes: null,
      lineIndex,
    };
  }

  const tokens = line.split(/\s+/);

  // Try pattern: [qty] [unit] [rest]
  // e.g. "100 g chicken breast", "1 cup rice", "1 1/2 cups milk"
  if (tokens.length >= 3) {
    const maybeQty = parseQuantity(tokens[0] ?? "");
    const maybeUnit = normaliseUnit(tokens[1] ?? "");

    if (maybeQty !== null && maybeUnit !== null) {
      const name = tokens.slice(2).join(" ");
      return {
        rawText: original,
        status: "parsed",
        quantity: maybeQty,
        unit: maybeUnit,
        ingredientName: name || null,
        notes: null,
        lineIndex,
      };
    }

    // quantity but unknown unit - partial
    if (maybeQty !== null && maybeUnit === null) {
      const name = tokens.slice(1).join(" ");
      return {
        rawText: original,
        status: "partial",
        quantity: maybeQty,
        unit: null,
        ingredientName: name || null,
        notes: null,
        lineIndex,
      };
    }
  }

  // No obvious quantity/unit, treat whole line as ingredient name (partial)
  return {
    rawText: original,
    status: "partial",
    quantity: null,
    unit: null,
    ingredientName: line,
    notes: null,
    lineIndex,
  };
}

// Parse a textarea block into lines
export function parseIngredientsBlock(block?: string): IngredientParseResult {
  const safe = block ?? "";
  const lines = safe.split(/\r?\n/);
  return {
    lines: lines.map((line, index) => parseIngredientLine(line, index)),
  };
}
