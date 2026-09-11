export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCentsRupees(cents: number): string {
  return formatRupees(cents / 100);
}