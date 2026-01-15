import type { MeasurementUnit } from '../../domain/measurementUnit';

export type Recipe = {
  id: number;
  name: string;
  ingredients: string[];
  effortLevel: 'low' | 'medium' | 'high';
};

export type EffortLevel = 'low' | 'medium' | 'high';

export type CreateRecipeBody = {
  name: string;
  ingredientsText: string;
  effortLevel: EffortLevel;
};

export type PatchRecipeBody = Partial<CreateRecipeBody>;

export interface CreateRecipeInput {
  name: string;
  description?: string;
  servings?: number | null;
  effortLevel: 'low' | 'medium' | 'high';

  ingredientsText: string;
  instructionsText?: string;

  prepTime?: number | null;
  cookTime?: number | null;
  dietCategoryId?: number | null;
}

export type IngredientParseStatus = 'parsed' | 'partial' | 'unparsed';

export interface ParsedIngredientLine {
  rawText: string;
  status: IngredientParseStatus;
  quantity: number | null;
  unit: MeasurementUnit | null;
  ingredientName: string | null;
  notes: string | null;
  lineIndex: number;
}

export interface IngredientParseResult {
  lines: ParsedIngredientLine[];
}
