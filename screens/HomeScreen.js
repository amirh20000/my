import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HomeScreen({ navigation }) {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const storedInvoices = await AsyncStorage.getItem('invoices');
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const deleteInvoice = async (id) => {
    Alert.alert(
      'حذف فاکتور',
      'آیا مطمئن هستید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const updatedInvoices = invoices.filter(inv => inv.id !== id);
            setInvoices(updatedInvoices);
            await AsyncStorage.setItem('invoices', JSON.stringify(updatedInvoices));
          }
        }
      ]
    );
  };

  const renderInvoiceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.invoiceItem}
      onPress={() => navigation.navigate('Invoice', { invoice: item })}
    >
      <View style={styles.invoiceHeader}>
        <Text style={styles.invoiceNumber}>فاکتور #{item.id.toString().slice(-4)}</Text>
        <Text style={styles.invoiceDate}>{item.date}</Text>
      </View>
      
      <View style={styles.invoiceDetails}>
        <Text style={styles.customerName}>
          {item.customer || 'بدون نام'}
        </Text>
        <Text style={styles.invoiceTotal}>
          {item.total.toLocaleString()} تومان
        </Text>
      </View>
      
      <View style={styles.invoiceFooter}>
        <Text style={styles.productCount}>
          {item.products.length} کالا
        </Text>
        <TouchableOpacity
          onPress={() => deleteInvoice(item.id)}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.newInvoiceButton}
        onPress={() => navigation.navigate('NewInvoice')}
      >
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.newInvoiceButtonText}>فاکتور جدید</Text>
      </TouchableOpacity>

      {invoices.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="receipt" size={60} color="#ddd" />
          <Text style={styles.emptyStateText}>هنوز فاکتوری ثبت نشده است</Text>
          <Text style={styles.emptyStateSubText}>
            برای ایجاد فاکتور جدید، روی دکمه بالا کلیک کنید
          </Text>
        </View>
      ) : (
        <FlatList
          data={invoices.sort((a, b) => b.id - a.id)}
          renderItem={renderInvoiceItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  newInvoiceButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newInvoiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  invoiceItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  invoiceDate: {
    fontSize: 11,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  invoiceTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2196F3',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  productCount: {
    fontSize: 11,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emptyStateSubText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});