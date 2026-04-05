'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Space, Transaction, FinanceState, TransactionType, TripMember, TripSpace, Bill, UserProfile, LiquidMode } from '@/types';

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_SPACE'; payload: Space }
  | { type: 'ADD_TRIP_MEMBER'; payload: { spaceId: string, member: TripMember } }
  | { type: 'TOGGLE_TRIP_MEMBER_STATUS'; payload: { spaceId: string, memberId: string, targetSpaceId?: string, mode?: LiquidMode } }
  | { type: 'DELETE_TRIP_MEMBER'; payload: { spaceId: string, memberId: string } }
  | { type: 'TOGGLE_PRIVACY' }
  | { type: 'ADD_BILL'; payload: Bill }
  | { type: 'RESET_ALL' }
  | { type: 'DELETE_BILL'; payload: string }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'SET_THEME'; payload: 'SAGE' | 'OBSIDIAN' }
  | { type: 'SET_VISUAL_MODE'; payload: 'LIGHT' | 'DARK' }
  | { type: 'SET_INITIAL_DATA'; payload: FinanceState };

const initialState: FinanceState = {
  spaces: [
    { id: '1', name: 'Business Cash', balance: 0 },
    { id: '2', name: 'Personal Cash', balance: 0 },
    { id: '3', name: 'Institution Cash', balance: 0 },
    { id: '4', name: 'Others Cash', balance: 0 },
    { id: '5', name: 'Debts', balance: 0, isTrip: true, members: [] } as TripSpace,
  ],
  userProfile: {
    name: 'BUSINESS HUB',
    purpose: 'BUSINESS',
    language: 'en',
    banks: [
      { id: 'BANK_1712345678901', name: 'SBI' },
      { id: 'BANK_1712345678902', name: 'BARODA' },
      { id: 'BANK_1712345678903', name: 'SIB' }
    ]
  },
  transactions: [],
  bills: [],
  privacyMode: false,
  theme: 'SAGE',
  visualMode: 'LIGHT',
  liquidBalances: {
    'IN_HAND': 0,
    'BANK_1712345678901': 0,
    'BANK_1712345678902': 0,
    'BANK_1712345678903': 0
  }
};

const adjustLiquidBalance = (balances: Record<string, number>, mode: string, amount: number, isAdd: boolean) => {
  const newBalances = { ...balances };
  const val = isAdd ? amount : -amount;
  newBalances[mode] = (newBalances[mode] || 0) + val;
  return newBalances;
};

const financeReducer = (state: FinanceState, action: Action): FinanceState => {
  switch (action.type) {
    case 'ADD_TRIP_MEMBER': {
      const { spaceId, member } = action.payload;
      return {
        ...state,
        spaces: state.spaces.map(s => {
          if (s.id === spaceId) {
            const trip = s as TripSpace;
            return {
              ...trip,
              members: [member, ...(trip.members || [])],
              balance: member.status === 'UNPAID' ? trip.balance + member.amount : trip.balance
            } as TripSpace;
          }
          return s;
        })
      };
    }
    case 'DELETE_TRIP_MEMBER': {
      const { spaceId, memberId } = action.payload;
      let targetAccId = '';
      let memberAmount = 0;
      let memberStatus: 'PAID' | 'UNPAID' = 'UNPAID';
      let memberMode: any = 'IN_HAND';

      const midwaySpaces = state.spaces.map(s => {
        if (s.id === spaceId) {
          const trip = s as TripSpace;
          const m = trip.members.find(mx => mx.id === memberId);
          if (m) {
            memberAmount = m.amount;
            targetAccId = m.recoveredToId || '1';
            memberStatus = m.status;
          }
          return {
            ...trip,
            members: trip.members.filter(mx => mx.id !== memberId),
            balance: (m && m.status === 'UNPAID') ? trip.balance - m.amount : trip.balance
          } as TripSpace;
        }
        return s;
      });

      // If it was paid, also subtract from the account it was recovered to
      const finalSpaces = midwaySpaces.map(s => {
        if ((memberStatus as string) === 'PAID' && s.id === targetAccId) {
          return { ...s, balance: s.balance - memberAmount };
        }
        return s;
      });

      let updatedLiquid = state.liquidBalances;
      if ((memberStatus as string) === 'PAID') {
         updatedLiquid = adjustLiquidBalance(state.liquidBalances, 'IN_HAND', memberAmount, false);
      }

      return { ...state, spaces: finalSpaces, liquidBalances: updatedLiquid };
    }
    case 'TOGGLE_TRIP_MEMBER_STATUS': {
      const { spaceId, memberId, targetSpaceId = '1', mode = 'IN_HAND' } = action.payload as { spaceId: string, memberId: string, targetSpaceId?: string, mode?: LiquidMode };
      let memberAmount = 0;
      let memberName = '';
      let newStatus: 'PAID' | 'UNPAID' = 'PAID';
      let prevRecoveredTo: string | undefined = undefined;

      const updatedSpaces = state.spaces.map(s => {
        if (s.id === spaceId) {
          const trip = s as TripSpace;
          return {
            ...trip,
            members: trip.members.map(m => {
              if (m.id === memberId) {
                memberAmount = m.amount;
                memberName = m.name;
                prevRecoveredTo = m.recoveredToId;
                newStatus = m.status === 'PAID' ? 'UNPAID' : 'PAID';
                return { 
                   ...m, 
                   status: newStatus,
                   recoveredToId: newStatus === 'PAID' ? targetSpaceId : undefined
                };
              }
              return m;
            }),
            balance: newStatus === 'PAID' ? trip.balance - memberAmount : trip.balance + memberAmount
          } as TripSpace;
        }
        return s;
      });

      const finalSpaces = updatedSpaces.map(s => {
        if (newStatus === 'PAID' && s.id === targetSpaceId) {
          return { ...s, balance: s.balance + memberAmount };
        }
        if (newStatus === 'UNPAID' && s.id === (prevRecoveredTo || '1')) {
          return { ...s, balance: s.balance - memberAmount };
        }
        return s;
      });

      const updatedLiquid = adjustLiquidBalance(state.liquidBalances, mode, memberAmount, newStatus === 'PAID');

      if ((newStatus as string) === 'UNPAID') {
        return {
          ...state,
          spaces: finalSpaces,
          liquidBalances: updatedLiquid,
          transactions: state.transactions.filter(t => !t.note?.includes(`from ${memberName}`))
        };
      }

      const newTransaction: Transaction = {
        id: `recovery-${memberId}-${Date.now()}`,
        amount: memberAmount,
        type: 'INCOME',
        spaceId: targetSpaceId,
        mode: mode, 
        date: new Date().toISOString(),
        note: `Settlement from ${memberName}`,
        category: 'Settlement'
      };

      return { 
        ...state, 
        spaces: finalSpaces,
        liquidBalances: updatedLiquid,
        transactions: [newTransaction, ...state.transactions]
      };
    }
    case 'ADD_TRANSACTION': {
      const { amount, type, spaceId, toSpaceId, mode, toMode } = action.payload;
      const updatedSpaces = state.spaces.map((space) => {
        if (space.id === spaceId) {
          if (type === 'INCOME') return { ...space, balance: space.balance + amount };
          if (type === 'EXPENSE') return { ...space, balance: space.balance - amount };
          if (type === 'TRANSFER') return { ...space, balance: space.balance - amount };
        }
        if (type === 'TRANSFER' && space.id === toSpaceId) {
          return { ...space, balance: space.balance + amount };
        }
        return space;
      });

      let updatedLiquid = state.liquidBalances;
      if (type === 'INCOME') updatedLiquid = adjustLiquidBalance(updatedLiquid, mode, amount, true);
      else if (type === 'EXPENSE') updatedLiquid = adjustLiquidBalance(updatedLiquid, mode, amount, false);
      else if (type === 'TRANSFER') {
        updatedLiquid = adjustLiquidBalance(updatedLiquid, mode, amount, false);
        updatedLiquid = adjustLiquidBalance(updatedLiquid, toMode || mode, amount, true);
      }

      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        spaces: updatedSpaces,
        liquidBalances: updatedLiquid
      };
    }
    case 'DELETE_TRANSACTION': {
      const transactionToDelete = state.transactions.find((t) => t.id === action.payload);
      if (!transactionToDelete) return state;

      const updatedSpaces = state.spaces.map((space) => {
        if (space.id === transactionToDelete.spaceId) {
          if (transactionToDelete.type === 'INCOME') return { ...space, balance: space.balance - transactionToDelete.amount };
          if (transactionToDelete.type === 'EXPENSE') return { ...space, balance: space.balance + transactionToDelete.amount };
          if (transactionToDelete.type === 'TRANSFER') return { ...space, balance: space.balance + transactionToDelete.amount };
        }
        if (transactionToDelete.type === 'TRANSFER' && space.id === transactionToDelete.toSpaceId) {
          return { ...space, balance: space.balance - transactionToDelete.amount };
        }
        return space;
      });

      let updatedLiquid = state.liquidBalances;
      if (transactionToDelete.type === 'INCOME') updatedLiquid = adjustLiquidBalance(updatedLiquid, transactionToDelete.mode, transactionToDelete.amount, false);
      else if (transactionToDelete.type === 'EXPENSE') updatedLiquid = adjustLiquidBalance(updatedLiquid, transactionToDelete.mode, transactionToDelete.amount, true);
      else if (transactionToDelete.type === 'TRANSFER') {
        updatedLiquid = adjustLiquidBalance(updatedLiquid, transactionToDelete.mode, transactionToDelete.amount, true);
        updatedLiquid = adjustLiquidBalance(updatedLiquid, transactionToDelete.toMode || transactionToDelete.mode, transactionToDelete.amount, false);
      }

      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
        spaces: updatedSpaces,
        liquidBalances: updatedLiquid
      };
    }
    case 'UPDATE_TRANSACTION': {
      const updatedTx = action.payload;
      const oldTx = state.transactions.find(t => t.id === updatedTx.id);
      if (!oldTx) return state;

      // 1. Undo old transaction impact
      let tempSpaces = state.spaces.map(s => {
        if (s.id === oldTx.spaceId) {
          if (oldTx.type === 'INCOME') return { ...s, balance: s.balance - oldTx.amount };
          if (oldTx.type === 'EXPENSE' || oldTx.type === 'TRANSFER') return { ...s, balance: s.balance + oldTx.amount };
        }
        if (oldTx.type === 'TRANSFER' && s.id === oldTx.toSpaceId) {
          return { ...s, balance: s.balance - oldTx.amount };
        }
        return s;
      });

      // 2. Apply new transaction impact
      const finalSpaces = tempSpaces.map(s => {
        if (s.id === updatedTx.spaceId) {
          if (updatedTx.type === 'INCOME') return { ...s, balance: s.balance + updatedTx.amount };
          if (updatedTx.type === 'EXPENSE' || updatedTx.type === 'TRANSFER') return { ...s, balance: s.balance - updatedTx.amount };
        }
        if (updatedTx.type === 'TRANSFER' && s.id === updatedTx.toSpaceId) {
          return { ...s, balance: s.balance + updatedTx.amount };
        }
        return s;
      });

      return {
        ...state,
        transactions: state.transactions.map(t => t.id === updatedTx.id ? updatedTx : t),
        spaces: finalSpaces
      };
    }
    case 'TOGGLE_PRIVACY':
      return { ...state, privacyMode: !state.privacyMode };
    case 'ADD_BILL':
      return { ...state, bills: [action.payload, ...state.bills] };
    case 'RESET_ALL': {
      return {
        ...state,
        spaces: state.spaces.map(s => {
           if ('isTrip' in s) {
             const ts = s as TripSpace;
             return { ...ts, balance: 0, members: ts.members.map(m => ({ ...m, amount: 0, status: 'UNPAID' })) };
           }
           return { ...s, balance: 0 };
        }),
        transactions: [],
        bills: []
      };
    }
    case 'DELETE_BILL':
      return { ...state, bills: state.bills.filter(b => b.id !== action.payload) };
    case 'SET_VISUAL_MODE':
      return { ...state, visualMode: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'SET_INITIAL_DATA':
      return { ...initialState, ...action.payload };
    default:
      return state;
  }
};

const FinanceContext = createContext<{
  state: FinanceState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('cashflow_data');
    if (savedData) {
      try {
        dispatch({ type: 'SET_INITIAL_DATA', payload: JSON.parse(savedData) });
      } catch (err) {
        console.error('Failed to load storage data', err);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cashflow_data', JSON.stringify(state));
    if (state.theme === 'OBSIDIAN') {
      document.documentElement.setAttribute('data-theme', 'obsidian');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    if (state.visualMode === 'DARK') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
