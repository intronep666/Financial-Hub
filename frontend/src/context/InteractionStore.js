import { create } from 'zustand';

export const useInteractionStore = create((set) => ({
  selectedTransactionCategory: null,
  setSelectedTransactionCategory: (payload) => set({ selectedTransactionCategory: payload }),
  selectedGoal: null,
  setSelectedGoal: (payload) => set({ selectedGoal: payload }),
}));
