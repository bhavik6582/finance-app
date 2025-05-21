import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Expense } from '../types';
import { TransactionModal } from '../components/TransactionModal';

interface AIScreenProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  saveExpenses: (newExpenses: Expense[]) => Promise<void>;
}

export function AIScreen({ expenses, setExpenses, saveExpenses }: AIScreenProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<{ amount: string; date: string; category: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleParse = async () => {
    setLoading(true);
    setParsed(null);
    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
      if (!apiKey) {
        Alert.alert('API Key Missing', 'Please set your OPENROUTER_API_KEY in your environment.');
        setLoading(false);
        return;
      }
      const prompt = `Extract the amount, date (YYYY-MM-DD), and category (merchant or reason) from this transaction message:\n"${input}"\nRespond with ONLY valid JSON, no explanation, no markdown, no extra text.\nExample:\nInput: Dear UPI user A/C X3412 debited by 169.0 on date 18May25 trf to AVENUE FOOD PLAZ Refno 513852311488. If not u? call 1800111109. -SBI\nOutput: {"amount":169.0,"date":"2025-05-18","category":"AVENUE FOOD PLAZ"}`;
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick:free',
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
          temperature: 0.0,
        }),
      });
      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '';
      // Try to extract JSON from the response
      let match = content.match(/\{[\s\S]*\}/);
      if (!match) {
        // Try to fix common issues (single quotes to double quotes)
        content = content.replace(/'/g, '"');
        match = content.match(/\{[\s\S]*\}/);
      }
      if (!match) {
        Alert.alert('Parse Error', 'No JSON found. Raw response: ' + content);
        setLoading(false);
        return;
      }
      const parsedJson = JSON.parse(match[0]);
      setParsed({
        amount: parsedJson.amount?.toString() || '',
        date: parsedJson.date || '',
        category: parsedJson.category || '',
      });
      setModalVisible(true);
    } catch (err: any) {
      Alert.alert('Parse Error', err.message || 'Failed to parse transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (expense: Omit<Expense, 'id' | 'description'>) => {
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
    setParsed(null);
    setInput('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Transaction Input</Text>
      <Text style={styles.subtitle}>Describe your transaction in plain English. Example: "Spent 500 on groceries yesterday"</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter transaction message..."
        placeholderTextColor="#aaa"
        value={input}
        onChangeText={setInput}
        multiline
      />
      <TouchableOpacity
        style={[styles.button, (!input || loading) && styles.buttonDisabled]}
        onPress={handleParse}
        disabled={!input || loading}
      >
        {loading ? <ActivityIndicator color="#181A20" /> : <Text style={styles.buttonText}>Parse</Text>}
      </TouchableOpacity>
      <TransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAdd}
        isAddMode={true}
        initialExpense={parsed ? {
          id: '',
          amount: Number(parsed.amount) || 0,
          category: parsed.category,
          date: parsed.date,
          description: '',
        } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 32,
  },
  subtitle: {
    color: '#bbb',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#23243A',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    width: '100%',
    minHeight: 60,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#E3B53C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#bbb',
  },
  buttonText: {
    color: '#181A20',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 