export const CATEGORIES = [
  "Food", "Transport", "Rent", "Shopping", "Bills", "Health",
  "Entertainment", "Education", "Salary", "Other",
];

export const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n || 0);

export const currentMonth = () => new Date().toISOString().slice(0, 7);
