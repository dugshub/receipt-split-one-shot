// utils/split-calculations.ts - Helper functions for receipt splitting

// Type for split calculation
type SplitUser = {
  userId: string;
  percentage: number;
};

// Calculate split amounts based on percentages and total amount
export function calculateSplitAmounts(
  totalAmount: number,
  splits: SplitUser[]
): { userId: string; percentage: number; amount: number }[] {
  // 1. Validate percentages total 100%
  const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Split percentages must total 100%');
  }

  // 2. Calculate amounts and handle rounding
  let calculatedTotal = 0;
  const result = splits.map((split, index) => {
    // For the last split, use the remaining amount to avoid rounding errors
    const isLastSplit = index === splits.length - 1;
    const amount = isLastSplit
      ? parseFloat((totalAmount - calculatedTotal).toFixed(2))
      : parseFloat(((split.percentage / 100) * totalAmount).toFixed(2));

    if (!isLastSplit) {
      calculatedTotal += amount;
    }

    return {
      userId: split.userId,
      percentage: split.percentage,
      amount,
    };
  });

  return result;
}

// Create even splits among a group of users
export function createEvenSplits(
  totalAmount: number,
  userIds: string[]
): { userId: string; percentage: number; amount: number }[] {
  if (!userIds.length) {
    throw new Error('At least one user is required for splitting');
  }

  // 1. Calculate even percentage
  const evenPercentage = parseFloat((100 / userIds.length).toFixed(2));
  
  // 2. Handle rounding of percentages to ensure they total exactly 100%
  const percentages = userIds.map((_, index) => {
    // For the last user, use the remaining percentage to ensure total is 100%
    if (index === userIds.length - 1) {
      const totalSoFar = evenPercentage * (userIds.length - 1);
      return 100 - totalSoFar;
    }
    return evenPercentage;
  });

  // 3. Calculate monetary amounts for each user
  let calculatedTotal = 0;
  const result = userIds.map((userId, index) => {
    // For the last split, use the remaining amount to avoid rounding errors
    const isLastSplit = index === userIds.length - 1;
    const amount = isLastSplit
      ? parseFloat((totalAmount - calculatedTotal).toFixed(2))
      : parseFloat(((percentages[index] / 100) * totalAmount).toFixed(2));

    if (!isLastSplit) {
      calculatedTotal += amount;
    }

    return {
      userId,
      percentage: percentages[index],
      amount,
    };
  });

  return result;
}

// Round to 2 decimal places
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

// Calculate optimal settlement transactions
export function calculateSettlements(
  balances: Record<string, { net: number }>
): { from: string; to: string; amount: number }[] {
  // Create separate arrays of debtors and creditors
  const debtors = Object.entries(balances)
    .filter(([_, balance]) => balance.net < 0)
    .map(([id, balance]) => ({ id, amount: Math.abs(balance.net) }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  const creditors = Object.entries(balances)
    .filter(([_, balance]) => balance.net > 0)
    .map(([id, balance]) => ({ id, amount: balance.net }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending

  const transactions = [];

  // Iterate through debtors and creditors to create optimal transactions
  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];

    // Calculate the transaction amount (minimum of what is owed and what is due)
    const amount = roundCurrency(Math.min(debtor.amount, creditor.amount));

    transactions.push({
      from: debtor.id,
      to: creditor.id,
      amount,
    });

    // Update remaining balances
    debtor.amount = roundCurrency(debtor.amount - amount);
    creditor.amount = roundCurrency(creditor.amount - amount);

    // Remove users who have settled their debts/credits
    if (debtor.amount < 0.01) debtors.shift();
    if (creditor.amount < 0.01) creditors.shift();
  }

  return transactions;
}