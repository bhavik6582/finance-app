import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Expense } from '../types';
import { TransactionModal } from '../components/TransactionModal';

interface HomeScreenProps {
  expenses: Expense[];
  balance: number;
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  saveExpenses: (newExpenses: Expense[]) => Promise<void>;
}

// --- UI Subcomponents ---
const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Expensify</Text>
  </View>
);

const BalanceCard = ({ balance }: { balance: number }) => (
  <View style={styles.balanceCard}>
    <Text style={styles.balanceLabel}>Total Spent</Text>
    <Text style={styles.balanceAmount}>₹{balance.toLocaleString('en-IN')}</Text>
  </View>
);

const QuickActions = ({ onAdd }: { onAdd: () => void }) => (
  <View style={styles.quickActions}>
    <TouchableOpacity style={styles.quickActionBtn} onPress={onAdd}>
      <Text style={styles.quickActionIcon}>＋</Text>
      <Text style={styles.quickActionText}>Add</Text>
    </TouchableOpacity>
  </View>
);

const TransactionCard = ({ item }: { item: Expense }) => (
  <View style={styles.transactionCard}>
    <View style={styles.transactionLeft}>
      <View style={[styles.categoryCircle, { backgroundColor: getCategoryColor(item.category) }] }>
        <Text style={styles.categoryLetter}>{item.category[0]?.toUpperCase() || '?'}</Text>
      </View>
      <View>
        <Text style={styles.transactionTitle}>{item.category}</Text>
        <Text style={styles.transactionDesc}>{item.description}</Text>
        <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </View>
    <Text style={[styles.transactionAmount, { color: item.amount < 0 ? '#E33C3C' : '#2ecc71' }]}>₹{item.amount.toFixed(2)}</Text>
  </View>
);

function getCategoryColor(category: string) {
  const colors = ['#E3B53C', '#99DFAD', '#E33C3C', '#6C40D9', '#00A6C2', '#FDC1C1'];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// --- Main HomeScreen ---
export function HomeScreen({ expenses, balance, setExpenses, saveExpenses }: HomeScreenProps) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleAdd = () => {
    setModalVisible(true);
  };

  const handleSave = (expense: Omit<Expense, 'id' | 'description'>) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: expense.amount,
      category: expense.category,
      description: '',
      date: expense.date,
    };
    const newExpenses = [newExpense, ...expenses];
    setExpenses(newExpenses);
    saveExpenses(newExpenses);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#181A20" />
      <View style={styles.container}>
        <Header />
        <BalanceCard balance={balance} />
        <QuickActions onAdd={handleAdd} />
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <FlatList
          data={expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          renderItem={({ item }) => <TransactionCard item={item} />}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet.</Text>}
        />
        <TransactionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          isAddMode={true}
        />
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 38,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  balanceCard: {
    backgroundColor: '#23243A',
    borderRadius: 20,
    marginHorizontal: 24,
    marginBottom: 18,
    marginTop: 4,
    padding: 28,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#E3B53C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  balanceLabel: {
    color: '#E3B53C',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  quickActionBtn: {
    backgroundColor: '#23243A',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 8,
    elevation: 2,
  },
  quickActionIcon: {
    color: '#E3B53C',
    fontSize: 20,
    marginRight: 6,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 24,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  transactionCard: {
    backgroundColor: '#23243A',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  categoryCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryLetter: {
    color: '#181A20',
    fontSize: 20,
    fontWeight: '700',
  },
  transactionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDesc: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
  },
  transactionDate: {
    color: '#888',
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyText: {
    color: '#bbb',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});