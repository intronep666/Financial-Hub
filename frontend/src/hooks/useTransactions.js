import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export const transactionsKeys = {
  all: ['transactions'],
};

const fetchTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

export const useTransactions = (options = {}) =>
  useQuery({
    queryKey: transactionsKeys.all,
    queryFn: fetchTransactions,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    ...options,
  });

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/transactions', payload);
      return response.data;
    },
    onSuccess: (newTransaction) => {
      queryClient.setQueryData(transactionsKeys.all, (existing = []) => [newTransaction, ...(existing || [])]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionsKeys.all });
    },
  });
};
