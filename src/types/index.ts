export type CalculatorMode = 'standard' | 'sales' | 'fiscal' | 'python-code' | 'guide';

export interface TapeEntry {
  id: string;
  timestamp: string;
  operation: string;
  value: number;
  subtotal: number;
  note?: string;
}

export interface DiscountStep {
  percent: number;
  discountAmount: number;
  subtotal: number;
}

export interface Denomination {
  name: string;
  value: number;
  type: 'bill' | 'coin';
  quantity: number;
}

export interface RetentionItem {
  id: string;
  name: string;
  rate: number;
  enabled: boolean;
  amount: number;
}

export interface AmortizationRow {
  period: number;
  installment: number;
  amortization: number;
  interest: number;
  balance: number;
}
