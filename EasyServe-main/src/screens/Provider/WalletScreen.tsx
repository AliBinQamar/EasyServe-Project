import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { paymentService } from '../../services/paymentService';
import { validators } from '../../utils/validators';
import { logger } from '../../utils/logger';
import { formatters } from '../../utils/formatter';
import { Wallet, Transaction } from '../../types';

const TAG = 'WalletScreen';

export default function WalletScreen({ navigation }: any) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    loadWallet();
    return () => setWallet(null);
  }, []);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const walletData = await paymentService.getWallet();
      setWallet(walletData);

      const sortedTx = (walletData.transactions || []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setTransactions(sortedTx);

      logger.info(TAG, 'Wallet loaded successfully');
    } catch (error) {
      logger.error(TAG, 'Failed to load wallet', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const validation = validators.price(withdrawAmount);
    if (!validation.valid) {
      Alert.alert('Error', validation.error);
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (!wallet || amount > wallet.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw ${formatters.currency(amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Call backend withdrawal API (optional)
              await paymentService.withdraw(amount);

              // Update wallet locally
              const updatedWallet = { ...wallet };
              updatedWallet.balance -= amount;
              updatedWallet.transactions = [
                {
                  type: 'debit',
                  amount,
                  reference: 'withdrawal',
                  status: 'withdrawn',
                  createdAt: new Date().toISOString(),
                },
                ...(updatedWallet.transactions || []),
              ];

              setWallet(updatedWallet);
              setTransactions(updatedWallet.transactions);
              setWithdrawAmount('');
              Alert.alert('Success', `Withdrawn ${formatters.currency(amount)}`);
            } catch (err: any) {
              logger.error(TAG, 'Withdrawal failed', err);
              Alert.alert('Error', err.message || 'Withdrawal failed');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Wallet</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Wallet Card */}
      <View style={styles.walletCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>{formatters.currency(wallet?.balance || 0)}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Held</Text>
            <Text style={styles.statValue}>{formatters.currency(wallet?.heldBalance || 0)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Earned</Text>
            <Text style={styles.statValue}>{formatters.currency(wallet?.totalEarned || 0)}</Text>
          </View>
        </View>
      </View>

      {/* Withdraw Section */}
      <View style={styles.withdrawSection}>
        <Text style={styles.sectionTitle}>Withdraw Funds</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
          keyboardType="numeric"
          placeholderTextColor="#999"
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.withdrawButton, loading && styles.buttonDisabled]}
          onPress={handleWithdraw}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.withdrawButtonText}>Withdraw</Text>}
        </TouchableOpacity>
      </View>

      {/* Transactions */}
      <Text style={styles.sectionTitle}>Transaction History</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item, index) => item._id || `tx-${index}`}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View>
              <Text style={styles.transactionAmount}>{formatters.currency(item.amount)}</Text>
              <Text style={styles.transactionStatus}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
            <Text style={styles.transactionDate}>{formatters.date(item.createdAt || '')}</Text>
          </View>
        )}
        contentContainerStyle={styles.transactionsList}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: { fontSize: 16, color: '#4CAF50', fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#333' },
  walletCard: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: { fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: '700', color: '#fff', marginBottom: 20 },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { flex: 1 },
  statLabel: { fontSize: 12, color: '#fff', opacity: 0.8, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '600', color: '#fff' },
  withdrawSection: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 15, paddingHorizontal: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    backgroundColor: '#F8F9FA',
  },
  withdrawButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  withdrawButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  transactionsList: { padding: 20, paddingTop: 0 },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  transactionAmount: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  transactionStatus: { fontSize: 14, color: '#666' },
  transactionDate: { fontSize: 14, color: '#999' },
});
