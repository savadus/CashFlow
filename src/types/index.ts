export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type LiquidMode = string;

export interface Space {
  id: string;
  name: string;
  balance: number;
  icon?: string;
  color?: string;
}

export interface BankAccount {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  spaceId: string;
  toSpaceId?: string; // For transfers
  mode: LiquidMode; // Where the cash is (In Hand vs Specific Bank)
  toMode?: LiquidMode; // For transfers between specific liquid nodes
  date: string;
  note: string;
  tags?: string[];
  category?: string;
}

export interface TripMember {
  id: string;
  name: string;
  amount: number;
  status: 'PAID' | 'UNPAID';
  recoveredToId?: string;
}

export interface TripSpace extends Space {
  isTrip: true;
  members: TripMember[];
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface Bill {
  id: string;
  customerName: string;
  customerPhone?: string;
  items: BillItem[];
  total: number;
  status: 'PAID' | 'UNPAID';
  date: string;
  style: 'BASIC' | 'THERMAL' | 'PREMIUM';
  headline: string;
}

export interface UserProfile {
  name: string;
  language: string;
  purpose: string;
  image?: string;
  banks: BankAccount[];
}

export interface FinanceState {
  spaces: Space[];
  transactions: Transaction[];
  bills: Bill[];
  privacyMode: boolean;
  userProfile?: UserProfile;
  liquidBalances: Record<string, number>;
  theme?: 'SAGE' | 'OBSIDIAN';
  visualMode?: 'LIGHT' | 'DARK';
}
