/**
 * Formats a number to Brazilian Real (BRL) currency string.
 * @param value The numeric value to format
 * @returns Formatted currency string (e.g. R$ 1.234,56)
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Formats a date or string into a Brazilian date format (DD/MM/YYYY).
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat("pt-BR").format(d)
}

/**
 * Formats a decimal number into a percentage string.
 * @param value The value to format (e.g., 0.15 for 15%)
 * @param fractionDigits Number of decimal places
 * @returns Formatted percentage string (e.g. 15,00%)
 */
export function formatPercentage(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}
