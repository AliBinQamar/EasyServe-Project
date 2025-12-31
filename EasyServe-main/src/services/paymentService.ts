import api from '../config/api';
import { Wallet, Transaction } from '../types';

export const paymentService = {
  // Get wallet
  async getWallet(): Promise<Wallet> {
    const res = await api.get('/payments/wallet');
    return res.data;
  },

  // Get transactions
  async getTransactions(): Promise<Transaction[]> {
    const res = await api.get('/payments/transactions');
    return res.data;
  },

  // Initiate payment
  async initiatePayment(bookingId: string, paymentMethod: string): Promise<any> {
    const res = await api.post('/payments/initiate', { 
      bookingId, 
      paymentMethod 
    });
    return res.data;
  },

  // Withdraw funds
  async withdraw(amount: number): Promise<any> {
    const res = await api.post('/payments/withdraw', { amount });
    return res.data;
  },

  // Add bank details
  // async addBankDetails(details: {
  //   accountName: string;
  //   accountNumber: string;
  //   bankName: string;
  //   iban?: string;
  // }) {
  //   const res = await api.post('/payments/bank-details', details);
  //   return res.data;
  // }
};