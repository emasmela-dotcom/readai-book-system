/**
 * Genre aisles that need a wider shelf than strict category+subcategory in Neon.
 * Cooking has placeholder subcategory rows; real cookery books are matched by title.
 */

export type ExpandedAisleId = 'cooking'

const EXPANDED_AISLES = new Set<string>(['cooking'])

export function isExpandedAisle(aisleId: string): aisleId is ExpandedAisleId {
  return EXPANDED_AISLES.has(aisleId)
}

/** SQL comment marker — actual queries are inlined in route handlers (Neon fragment rules). */
export const COOKING_SHELF_TITLE =
  'Cookery and kitchen titles on the club shelves (includes cookery classics beyond the cooking tag).'
