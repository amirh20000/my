import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function NewInvoiceScreen({ navigation }) {
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [products, setProducts] = useState([]);
  
  // تاریخ پیش‌فرض امروز
  const [date, setDate] = useState(new Date().toLocaleDateString('fa-IR'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState('');

  // محاسبه جمع کل
  const calculateTotal = () => {
    return products.reduce((sum, product) => {
      return sum + (product.quantity * product.price);
    }, 0);
  };

  const addProduct = () => {
    navigation.navigate('AddProduct', {
      onAddProduct: (newProduct) => {
        setProducts([...products, newProduct]);
      }
    });
  };

  const removeProduct = (index) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

  const saveInvoice = async () => {
    if (products.length === 0) {
      Alert.alert('خطا', 'لطفا حداقل یک محصول اضافه کنید');
      return;
    }

    const total = calculateTotal();
    const invoice = {
      id: Date.now().toString(),
      date,
      customer,
      phone,
      address,
      products: [...products],
      total,
    };
    
    try {
      // ذخیره در AsyncStorage
      const existingInvoices = await AsyncStorage.getItem('invoices');
      const invoicesArray = existingInvoices ? JSON.parse(existingInvoices) : [];
      invoicesArray.push(invoice);
      await AsyncStorage.setItem('invoices', JSON.stringify(invoicesArray));
      
      Alert.alert('موفق', 'فاکتور با موفقیت ذخیره شد', [
        {
          text: 'باشه',
          onPress: () => {
            navigation.navigate('Invoice', { invoice });
          }
        }
      ]);
    } catch (error) {
      console.error('Error saving invoice:', error);
      Alert.alert('خطا', 'در ذخیره فاکتور مشکلی پیش آمد');
    }
  };

  const editProduct = (index) => {
    const productToEdit = products[index];
    Alert.alert(
      'ویرایش محصول',
      `نام: ${productToEdit.name}\nتعداد: ${productToEdit.quantity}\nقیمت: ${productToEdit.price.toLocaleString()}`,
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => removeProduct(index)
        },
        {
          text: 'ویرایش',
          onPress: () => {
            // برای سادگی، حذف و اضافه مجدد
            removeProduct(index);
            navigation.navigate('AddProduct', {
              initialName: productToEdit.name,
              initialQuantity: productToEdit.quantity.toString(),
              initialPrice: productToEdit.price.toString(),
              onAddProduct: (editedProduct) => {
                const newProducts = [...products];
                newProducts[index] = editedProduct;
                setProducts(newProducts);
              }
            });
          }
        }
      ]
    );
  };

  const openDatePicker = () => {
    setTempDate(date);
    setShowDatePicker(true);
  };

  const saveDate = () => {
    if (tempDate.trim()) {
      setDate(tempDate);
    }
    setShowDatePicker(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* مودال ویرایش تاریخ */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ویرایش تاریخ</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="مثال: ۱۴۰۳/۰۱/۱۵"
              value={tempDate}
              onChangeText={setTempDate}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelModalButtonText}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={saveDate}
              >
                <Text style={styles.saveModalButtonText}>ذخیره</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* هدر با تاریخ قابل ویرایش */}
      <View style={styles.header}>
        <Text style={styles.title}>فاکتور فروش</Text>
        <TouchableOpacity onPress={openDatePicker} style={styles.dateContainer}>
          <Icon name="edit" size={14} color="#666" style={styles.dateEditIcon} />
          <Text style={styles.date}>{date}</Text>
        </TouchableOpacity>
      </View>

      {/* اطلاعات مشتری */}
      <View style={styles.section}>
        <TextInput
          style={styles.input}
          placeholder="مشتری (اختیاری)"
          value={customer}
          onChangeText={setCustomer}
        />
        <TextInput
          style={styles.input}
          placeholder="تلفن (اختیاری)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="آدرس (اختیاری)"
          value={address}
          onChangeText={setAddress}
          multiline
        />
      </View>

      {/* محصولات */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>محصولات</Text>
        
        {products.length === 0 ? (
          <View style={styles.emptyProducts}>
            <Icon name="shopping-cart" size={40} color="#ddd" />
            <Text style={styles.emptyProductsText}>
              هنوز کالایی اضافه نشده است
            </Text>
          </View>
        ) : (
          products.map((product, index) => (
            <TouchableOpacity
              key={index}
              style={styles.productItem}
              onPress={() => editProduct(index)}
              onLongPress={() => removeProduct(index)}
            >
              <View style={styles.productHeader}>
                <Text style={styles.productName}>
                  {index + 1}. {product.name}
                </Text>
                <Icon name="edit" size={16} color="#666" />
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.productText}>
                  تعداد: {product.quantity}
                </Text>
                <Text style={styles.productText}>
                  قیمت واحد: {product.price.toLocaleString()}
                </Text>
              </View>
              <Text style={styles.productTotal}>
                جمع: {(product.quantity * product.price).toLocaleString()} تومان
              </Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={addProduct}>
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>افزودن محصول</Text>
        </TouchableOpacity>
      </View>

      {/* جمع کل */}
      <View style={styles.totalSection}>
        <Text style={styles.totalText}>
          جمع کل: {calculateTotal().toLocaleString()} تومان
        </Text>
      </View>

      {/* متن پایین - خیلی ریز */}
      <View style={styles.footerTextContainer}>
        <Text style={styles.footerText}>
          پخش عمده گل توکلی
        </Text>
      </View>

      {/* دکمه‌ها */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={saveInvoice}>
          <Icon name="save" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>ذخیره فاکتور</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateEditIcon: {
    marginLeft: 6,
  },
  date: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 12,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emptyProducts: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  emptyProductsText: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  productItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  productText: {
    fontSize: 11,
    color: '#555',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  productTotal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  totalSection: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  totalText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  footerTextContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 6,
  },
  footerText: {
    fontSize: 9,
    color: '#888888',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  buttonsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  // استایل‌های مودال
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelModalButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveModalButton: {
    backgroundColor: '#4CAF50',
  },
  cancelModalButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  saveModalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});