import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function AddProductScreen({ route, navigation }) {
  const { onAddProduct } = route.params || {};
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');

  const handleAddProduct = () => {
    if (!name.trim()) {
      Alert.alert('خطا', 'لطفا نام کالا را وارد کنید');
      return;
    }
    
    const numericPrice = parseInt(price.replace(/,/g, '')) || 0;
    if (numericPrice <= 0) {
      Alert.alert('خطا', 'لطفا قیمت معتبر وارد کنید');
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: parseInt(quantity) || 1,
      price: numericPrice,
    };

    if (onAddProduct) {
      onAddProduct(newProduct);
    }
    
    navigation.goBack();
  };

  const increaseQuantity = () => {
    const qty = parseInt(quantity) || 1;
    setQuantity((qty + 1).toString());
  };

  const decreaseQuantity = () => {
    const qty = parseInt(quantity) || 1;
    if (qty > 1) {
      setQuantity((qty - 1).toString());
    }
  };

  const formatPrice = (text) => {
    // حذف همه غیر اعداد
    const numericText = text.replace(/[^\d]/g, '');
    setPrice(numericText);
  };

  const getFormattedPrice = () => {
    const num = parseInt(price) || 0;
    return num.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>افزودن کالا</Text>
        <View style={styles.emptySpace} />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>نام کالا</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: لپ‌تاپ"
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>تعداد</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={decreaseQuantity}
            >
              <Icon name="remove" size={20} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{quantity}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={increaseQuantity}
            >
              <Icon name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>قیمت واحد (تومان)</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: 15000000"
            value={price ? getFormattedPrice() : ''}
            onChangeText={formatPrice}
            keyboardType="numeric"
          />
        </View>

        {/* پیش‌نمایش */}
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>پیش‌نمایش:</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>
              کالا: {name || '---'}
            </Text>
            <Text style={styles.previewText}>
              تعداد: {quantity}
            </Text>
            <Text style={styles.previewText}>
              قیمت واحد: {price ? getFormattedPrice() : '0'} تومان
            </Text>
            <Text style={styles.previewTotal}>
              جمع: {price && quantity 
                ? (parseInt(price) * parseInt(quantity)).toLocaleString() 
                : '0'} تومان
            </Text>
          </View>
        </View>

        {/* دکمه افزودن کالا - بزرگ و واضح */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddProduct}
        >
          <Icon name="add-shopping-cart" size={24} color="#fff" />
          <Text style={styles.addButtonText}>افزودن کالا</Text>
        </TouchableOpacity>

        {/* دکمه لغو */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>لغو</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emptySpace: {
    width: 32,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: '#2196F3',
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginHorizontal: 12,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  previewSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  previewBox: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  previewText: {
    fontSize: 13,
    marginBottom: 6,
    color: '#555',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  previewTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});