import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity, Platform } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Expense } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AnalyticsScreenProps {
  expenses: Expense[];
}

const FILTERS = ['Daily', 'Monthly', 'Yearly'];
const CHART_TYPES = ['Line', 'Bar', 'Pie'];

function formatDate(date: Date | null) {
  if (!date) return '';
  const d = date;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const chartConfig = {
  backgroundColor: '#23243A',
  backgroundGradientFrom: '#23243A',
  backgroundGradientTo: '#181A20',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(227, 181, 60, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#E3B53C',
  },
};

export function AnalyticsScreen({ expenses }: AnalyticsScreenProps) {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [period, setPeriod] = useState<'Daily' | 'Monthly' | 'Yearly'>('Daily');
  const [chartType, setChartType] = useState<'Line' | 'Bar' | 'Pie'>('Line');

  // Filter logic: if filters are set, filter; otherwise, show all
  let filteredData = expenses;
  if (categoryFilter) {
    filteredData = filteredData.filter(d =>
      d.category.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }
  if (date) {
    filteredData = filteredData.filter(d =>
      formatDate(new Date(d.date)) === formatDate(date)
    );
  }

  // Group data by selected period
  let chartLabels: string[] = [];
  let chartValues: number[] = [];
  if (period === 'Daily') {
    chartLabels = filteredData.map(d => new Date(d.date).toLocaleDateString());
    chartValues = filteredData.map(d => d.amount);
  } else if (period === 'Monthly') {
    const monthlyMap: { [key: string]: number } = {};
    filteredData.forEach(d => {
      const date = new Date(d.date);
      const label = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyMap[label] = (monthlyMap[label] || 0) + d.amount;
    });
    chartLabels = Object.keys(monthlyMap);
    chartValues = Object.values(monthlyMap);
  } else if (period === 'Yearly') {
    const yearlyMap: { [key: string]: number } = {};
    filteredData.forEach(d => {
      const date = new Date(d.date);
      const label = `${date.getFullYear()}`;
      yearlyMap[label] = (yearlyMap[label] || 0) + d.amount;
    });
    chartLabels = Object.keys(yearlyMap);
    chartValues = Object.values(yearlyMap);
  }
  const showChart = filteredData.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      <TextInput
        style={styles.input}
        placeholder="Filter by category (e.g. Food)"
        value={categoryFilter}
        onChangeText={setCategoryFilter}
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: date ? '#fff' : '#aaa', fontSize: 16 }}>
          {date ? formatDate(date) : 'Select date'}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event: any, selectedDate?: Date | undefined) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
      {/* Period Filter Bar */}
      <View style={styles.periodBar}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.periodButton, period === f && styles.periodButtonActive]}
            onPress={() => setPeriod(f as 'Daily' | 'Monthly' | 'Yearly')}
          >
            <Text style={[styles.periodButtonText, period === f && styles.periodButtonTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Chart Type Selector */}
      <View style={styles.chartTypeBar}>
        {CHART_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.chartTypeButton, chartType === type && styles.chartTypeButtonActive]}
            onPress={() => setChartType(type as 'Line' | 'Bar' | 'Pie')}
          >
            <Text style={[styles.chartTypeButtonText, chartType === type && styles.chartTypeButtonTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {showChart ? (
        chartType === 'Line' ? (
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [
                {
                  data: chartValues,
                },
              ],
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            yAxisLabel="₹"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : chartType === 'Bar' ? (
          <BarChart
            data={{
              labels: chartLabels,
              datasets: [
                {
                  data: chartValues,
                },
              ],
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            yAxisLabel="₹"
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
          />
        ) : (
          <PieChart
            data={(() => {
              // For Pie, show category breakdown
              const pieMap: { [key: string]: number } = {};
              filteredData.forEach(d => {
                pieMap[d.category] = (pieMap[d.category] || 0) + d.amount;
              });
              const colors = ['#E3B53C', '#99DFAD', '#E33C3C', '#6C40D9', '#00A6C2', '#FDC1C1'];
              return Object.keys(pieMap).map((cat, i) => ({
                name: cat,
                amount: pieMap[cat],
                color: colors[i % colors.length],
                legendFontColor: '#fff',
                legendFontSize: 14,
              }));
            })()}
            width={Dimensions.get('window').width - 32}
            height={220}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            chartConfig={chartConfig}
            style={styles.chart}
          />
        )
      ) : (
        <Text style={styles.noData}>No Transactions</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
    padding: 16,
    paddingTop: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#23243A',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
    marginBottom: 16,
  },
  noData: {
    color: '#bbb',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
  periodBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
    backgroundColor: '#23243A',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#E3B53C',
  },
  periodButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  periodButtonTextActive: {
    color: '#181A20',
  },
  chartTypeBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
    backgroundColor: '#23243A',
    borderRadius: 12,
    padding: 4,
  },
  chartTypeButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  chartTypeButtonActive: {
    backgroundColor: '#E3B53C',
  },
  chartTypeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  chartTypeButtonTextActive: {
    color: '#181A20',
  },
});