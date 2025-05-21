import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Expense } from '../types';

interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'description'>) => void;
  initialExpense?: Expense | null;
  isAddMode?: boolean;
}

export function TransactionModal({
  visible,
  onClose,
  onSave,
  initialExpense,
  isAddMode = true,
}: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (initialExpense) {
      setAmount(initialExpense.amount.toString());
      setCategory(initialExpense.category);
      setDate(new Date(initialExpense.date));
    } else {
      setAmount('');
      setCategory('');
      setDate(new Date());
    }
  }, [initialExpense, visible]);

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || !category.trim()) {
      // You can add an Alert here if you want
      return;
    }
    const dateString = date ? date.toISOString() : new Date().toISOString();
    onSave({ amount: amt, category: category.trim(), date: dateString });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={modalOverlay}>
        <View style={modalContent}>
          <Text style={modalTitle}>{isAddMode ? 'Add Transaction' : 'Edit Transaction'}</Text>
          <TextInput
            style={input}
            placeholder="Amount"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TextInput
            style={input}
            placeholder="Category"
            placeholderTextColor="#aaa"
            value={category}
            onChangeText={setCategory}
          />
          <TouchableOpacity
            style={input}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={{ color: date ? '#fff' : '#aaa', fontSize: 16 }}>
              {date ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()}` : 'Select date'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(event: any, selectedDate?: Date | undefined) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
          <View style={modalActions}>
            <TouchableOpacity style={modalButton} onPress={handleSave}>
              <Text style={modalButtonText}>{isAddMode ? 'Add' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[modalButton, cancelButton]} onPress={onClose}>
              <Text style={modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Inline styles (copy from App.tsx for modal)
const modalOverlay = {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};
const modalContent = {
  backgroundColor: '#23243A',
  borderRadius: 16,
  padding: 24,
  width: '85%' as const,
  alignItems: 'center' as const,
};
const modalTitle = {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold' as const,
  marginBottom: 16,
};
const input = {
  backgroundColor: '#181A20',
  color: '#fff',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 10,
  fontSize: 16,
  marginBottom: 16,
  width: '100%' as const,
};
const modalActions = {
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  width: '100%' as const,
  marginTop: 8,
};
const modalButton = {
  flex: 1,
  backgroundColor: '#E3B53C',
  borderRadius: 8,
  paddingVertical: 10,
  marginHorizontal: 6,
  alignItems: 'center' as const,
};
const cancelButton = {
  backgroundColor: '#bbb',
};
const modalButtonText = {
  color: '#181A20',
  fontWeight: 'bold' as const,
  fontSize: 16,
}; 