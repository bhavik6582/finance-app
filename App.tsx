import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Modal, TextInput, FlatList, Platform } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { AIScreen } from './src/screens/AIScreen';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from './src/types';
import DateTimePicker from '@react-native-community/datetimepicker';

// Editable Transactions Screen
interface TransactionsScreenProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  saveExpenses: (newExpenses: Expense[]) => Promise<void>;
}
function TransactionsScreen({ expenses, setExpenses, saveExpenses }: TransactionsScreenProps) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  const handleEdit = (expense: Expense) => {
    setEditExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditDate(new Date(expense.date));
    setEditModalVisible(true);
    setIsAddMode(false);
  };

  const handleAdd = () => {
    setEditExpense(null);
    setEditAmount('');
    setEditCategory('');
    setEditDate(new Date());
    setEditModalVisible(true);
    setIsAddMode(true);
  };

  const handleEditSave = () => {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || !editCategory.trim()) {
      Alert.alert('Error', 'Please enter a valid amount and category.');
      return;
    }
    const dateString = editDate ? editDate.toISOString() : new Date().toISOString();
    if (isAddMode) {
      // Add new transaction
      const newExpense: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        amount: amt,
        category: editCategory.trim(),
        date: dateString,
        description: '',
      };
      const updated = [newExpense, ...expenses];
      setExpenses(updated);
      saveExpenses(updated);
    } else if (editExpense) {
      // Edit existing transaction
      const updated = expenses.map((e: Expense) =>
        e.id === editExpense.id ? { ...e, amount: amt, category: editCategory.trim(), date: dateString } : e
      );
      setExpenses(updated);
      saveExpenses(updated);
    }
    setEditModalVisible(false);
    setEditExpense(null);
    setEditAmount('');
    setEditCategory('');
    setEditDate(null);
  };

  const handleDelete = (expense: Expense) => {
    const updated = expenses.filter((e: Expense) => e.id !== expense.id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  return (
    <View style={styles.transactionsContainer}>
      <View style={styles.transactionsHeader}>
        <Text style={styles.transactionsTitle}>Transactions</Text>
      </View>
      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        style={{ width: '100%' }}
        contentContainerStyle={{ padding: 16, paddingTop: 24, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.transactionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.transactionCategory}>{item.category}</Text>
              <Text style={styles.transactionAmount}>₹{item.amount.toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconBtn}>
              <MaterialIcons name="edit" size={22} color="#FF9500" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
              <MaterialIcons name="delete" size={22} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#A0AEC0', textAlign: 'center', marginTop: 32 }}>No transactions yet.</Text>}
      />
      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAdd} activeOpacity={0.8}>
        <MaterialIcons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
      {/* Edit/Add Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isAddMode ? 'Add Transaction' : 'Edit Transaction'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
              value={editAmount}
              onChangeText={setEditAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              placeholderTextColor="#A0AEC0"
              value={editCategory}
              onChangeText={setEditCategory}
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={{ color: editDate ? '#2D3748' : '#A0AEC0', fontSize: 16 }}>
                {editDate ? `${editDate.getDate().toString().padStart(2, '0')}/${(editDate.getMonth()+1).toString().padStart(2, '0')}/${editDate.getFullYear()}` : 'Select date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={editDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event: any, selectedDate?: Date | undefined) => {
                  setShowDatePicker(false);
                  if (selectedDate) setEditDate(selectedDate);
                }}
              />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={handleEditSave}>
                <Text style={styles.modalButtonText}>{isAddMode ? 'Add' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={styles.screenStub}><Text style={styles.stubText}>Settings</Text></View>
  );
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'analytics' | 'transactions' | 'ai'>('home');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem('expenses');
      if (storedExpenses) {
        const parsed: Expense[] = JSON.parse(storedExpenses);
        setExpenses(parsed);
        setBalance(parsed.reduce((sum: number, e: Expense) => sum + e.amount, 0));
      } else {
        setExpenses([]);
        setBalance(0);
      }
    } catch (error) {
      setExpenses([]);
      setBalance(0);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    setBalance(newExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0));
    await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
  };

  let CurrentScreen;
  if (screen === 'home') CurrentScreen = () => <HomeScreen expenses={expenses} balance={balance} setExpenses={setExpenses} saveExpenses={saveExpenses} />;
  else if (screen === 'analytics') CurrentScreen = () => <AnalyticsScreen expenses={expenses} />;
  else if (screen === 'transactions') CurrentScreen = () => <TransactionsScreen expenses={expenses} setExpenses={setExpenses} saveExpenses={saveExpenses} />;
  else if (screen === 'ai') CurrentScreen = () => <AIScreen expenses={expenses} setExpenses={setExpenses} saveExpenses={saveExpenses} />;
  else CurrentScreen = SettingsScreen;

  return (
    <View style={{ flex: 1 }}>
      <CurrentScreen />
      <StatusBar style="auto" />
      <View style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navButton, screen === 'home' && styles.activeNavButton]}
          onPress={() => setScreen('home')}
        >
          <MaterialIcons name="home" size={24} color={screen === 'home' ? '#FF9500' : '#A0AEC0'} />
          <Text style={[styles.navText, screen === 'home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, screen === 'analytics' && styles.activeNavButton]}
          onPress={() => setScreen('analytics')}
        >
          <Ionicons name="stats-chart" size={24} color={screen === 'analytics' ? '#FF9500' : '#A0AEC0'} />
          <Text style={[styles.navText, screen === 'analytics' && styles.activeNavText]}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, screen === 'transactions' && styles.activeNavButton]}
          onPress={() => setScreen('transactions')}
        >
          <MaterialIcons name="receipt-long" size={24} color={screen === 'transactions' ? '#FF9500' : '#A0AEC0'} />
          <Text style={[styles.navText, screen === 'transactions' && styles.activeNavText]}>Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, screen === 'ai' && styles.activeNavButton]}
          onPress={() => setScreen('ai')}
        >
          <MaterialIcons name="smart-toy" size={24} color={screen === 'ai' ? '#FF9500' : '#A0AEC0'} />
          <Text style={[styles.navText, screen === 'ai' && styles.activeNavText]}>AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#A0AEC0',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  navText: {
    color: '#A0AEC0',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  activeNavButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF9500',
  },
  activeNavText: {
    color: '#FF9500',
  },
  screenStub: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stubText: {
    color: '#2D3748',
    fontSize: 22,
    fontWeight: 'bold',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  transactionCategory: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionAmount: {
    color: '#FF9500',
    fontSize: 15,
    marginTop: 2,
  },
  iconBtn: {
    marginLeft: 10,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#2D3748',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#EBF8FF',
    color: '#2D3748',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#A0AEC0',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  transactionsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  transactionsHeader: {
    backgroundColor: '#EBF8FF',
    paddingTop: 32,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#EBF8FF',
  },
  transactionsTitle: {
    color: '#2D3748',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
});
