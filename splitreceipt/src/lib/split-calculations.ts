// Utility functions for receipt splitting calculations

type SplitUser = {
  userId: string;
  percentage: number;
};

type SplitAmount = {
  userId: string;
  percentage: number;
  amount: number;
};

/**
 * Calculate split amounts based on percentages and total amount
 */
export function calculateSplitAmounts(
  totalAmount: number,
  percentages: SplitUser[]
): SplitAmount[] {
  // 1. Validate percentages total 100%
  const totalPercentage = percentages.reduce((sum, p) => sum + p.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Split percentages must total 100%');
  }
  
  // 2. Calculate raw amounts
  const rawAmounts = percentages.map(p => ({
    userId: p.userId,
    percentage: p.percentage,
    amount: (p.percentage / 100) * totalAmount,
  }));
  
  // 3. Handle rounding errors
  const totalCalculated = rawAmounts.reduce((sum, a) => sum + a.amount, 0);
  const roundingError = totalAmount - totalCalculated;
  
  if (Math.abs(roundingError) > 0.01) {
    // Distribute rounding error to the largest share
    const largestShare = rawAmounts.reduce(
      (max, current) => (current.amount > max.amount ? current : max),
      rawAmounts[0]
    );
    
    return rawAmounts.map(a =>
      a.userId === largestShare.userId
        ? { ...a, amount: a.amount + roundingError }
        : a
    );
  }
  
  return rawAmounts;
}

/**
 * Create even splits among a group of users
 */
export function createEvenSplits(
  totalAmount: number,
  userIds: string[]
): SplitAmount[] {
  if (!userIds.length) {
    throw new Error('At least one user must be provided for splitting');
  }
  
  const count = userIds.length;
  
  // 1. Calculate even percentage
  const percentage = 100 / count;
  
  // 2. Create even percentages array
  const percentages = userIds.map(userId => ({
    userId,
    percentage,
  }));
  
  // 3. Calculate monetary amounts
  return calculateSplitAmounts(totalAmount, percentages);
}

/**
 * Round to 2 decimal places for currency display
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Calculate optimized settlement transactions to resolve balances
 */
export function calculateSettlements(balances: Record<string, number>) {
  // Convert balances object to array format
  const balanceArray = Object.entries(balances).map(([userId, amount]) => ({
    userId,
    amount,
  }));
  
  // Sort by amount ascending (negative to positive)
  balanceArray.sort((a, b) => a.amount - b.amount);
  
  const settlements = [];
  
  // Create minimal number of transactions using sorted balances
  let i = 0; // index for negative balances (people who owe money)
  let j = balanceArray.length - 1; // index for positive balances (people who are owed money)
  
  while (i < j) {
    const debtor = balanceArray[i];
    const creditor = balanceArray[j];
    
    // Skip zero balances
    if (Math.abs(debtor.amount) < 0.01) {
      i++;
      continue;
    }
    
    if (Math.abs(creditor.amount) < 0.01) {
      j--;
      continue;
    }
    
    // The amount to transfer is the smaller of the two amounts
    const transferAmount = Math.min(Math.abs(debtor.amount), creditor.amount);
    
    if (transferAmount > 0) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: roundCurrency(transferAmount),
      });
      
      // Update balances
      debtor.amount += transferAmount;
      creditor.amount -= transferAmount;
    }
    
    // Move indices if balances are settled
    if (Math.abs(debtor.amount) < 0.01) {
      i++;
    }
    
    if (Math.abs(creditor.amount) < 0.01) {
      j--;
    }
  }
  
  return settlements;
}