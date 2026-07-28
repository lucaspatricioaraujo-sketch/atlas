/**
 * Re-exports and aliases for formatting utilities.
 * Components import from "@/utils/format" for clean DX.
 */

export { formatDate, formatPercentage } from "./formatters"
export { formatCurrencyBRL as formatCurrency } from "./formatters"

/**
 * Compact currency formatter for chart axis labels.
 * E.g.: 1500 → "R$ 1,5k"
 */
export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace(".", ",")}k`
  }
  return `R$ ${value.toFixed(0)}`
}
