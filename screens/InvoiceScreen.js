import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { printAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function InvoiceScreen({ route, navigation }) {
  const { invoice } = route.params;
  const [isSaving, setIsSaving] = useState(false);

  const createInvoiceHTML = () => {
    const productsHTML = invoice.products.map((product, index) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 5px; text-align: center; font-size: 10px; color: #000;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 5px; text-align: right; font-size: 10px; color: #000;">${product.name}</td>
        <td style="border: 1px solid #ddd; padding: 5px; text-align: center; font-size: 10px; color: #000;">${product.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 10px; color: #000;">${product.price.toLocaleString()}</td>
        <td style="border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 10px; color: #000;">${(product.quantity * product.price).toLocaleString()}</td>
      </tr>
    `).join('');

    // اطلاعات مشتری در یک خط
    let customerLine = '';
    if (invoice.customer) customerLine += `مشتری: ${invoice.customer}`;
    if (invoice.phone) customerLine += ` | تلفن: ${invoice.phone}`;
    if (invoice.address) customerLine += ` | آدرس: ${invoice.address}`;
    if (!customerLine) customerLine = 'محمد علی صعب';

    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page {
            margin: 5mm;
            size: A4 portrait;
          }
          body {
            font-family: 'Tahoma', 'Arial', sans-serif;
            margin: 0;
            padding: 10px;
            background-color: #f8fff8;
            font-size: 9px;
            line-height: 1.2;
            color: #000000;
          }
          .invoice-wrapper {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            border: 2px solid #4CAF50;
            border-radius: 8px;
            padding: 15px;
            background-color: white;
            box-shadow: 0 0 8px rgba(0,0,0,0.05);
            page-break-inside: avoid;
            box-sizing: border-box;
          }
          .header-section {
            text-align: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #4CAF50;
            position: relative;
          }
          .invoice-title {
            font-size: 18px;
            font-weight: bold;
            color: #2E7D32;
            margin-bottom: 4px;
          }
          .invoice-date {
            position: absolute;
            left: 0;
            top: 0;
            font-size: 11px;
            color: #000000;
            font-weight: bold;
            background-color: white;
            padding: 3px 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
          }
          .invoice-subtitle {
            font-size: 10px;
            color: #000000;
            margin-top: 3px;
          }
          .customer-info {
            margin: 10px 0;
            padding: 8px;
            background-color: #f0f9f0;
            border-radius: 5px;
            border: 1px solid #C8E6C9;
            text-align: center;
            font-size: 10px;
            color: #000000;
            direction: rtl;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            border: 1px solid #4CAF50;
            border-radius: 5px;
            overflow: hidden;
            font-size: 9px;
          }
          th {
            background-color: #E8F5E9;
            border: 1px solid #A5D6A7;
            padding: 6px;
            font-weight: bold;
            text-align: center;
            color: #000000;
          }
          td {
            border: 1px solid #ddd;
            padding: 5px;
            color: #000000;
          }
          .total-section {
            margin: 10px 0;
            padding: 10px;
            background-color: #E8F5E9;
            border: 1px solid #A5D6A7;
            border-radius: 5px;
            text-align: left;
            font-size: 11px;
            font-weight: bold;
            color: #000000;
          }
          .footer-section {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #4CAF50;
            text-align: center;
            font-size: 10px;
            color: #000000;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="invoice-wrapper">
          <div class="header-section">
            <div class="invoice-date">${invoice.date}</div>
            <div class="invoice-title">فاکتور فروش</div>
            <div class="invoice-subtitle">
              فاکتور را به شده با آن با خوبی ...... شماره تبلیغی ......
            </div>
          </div>
          
          <div class="customer-info">
            <strong style="color: #000;">آدرس فرهنگانه:</strong> ${customerLine}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>ردیف</th>
                <th>نام کالا</th>
                <th>تعداد</th>
                <th>قیمت واحد</th>
                <th>جمع</th>
              </tr>
            </thead>
            <tbody>
              ${productsHTML}
            </tbody>
          </table>
          
          <div class="total-section">
            جمع کل: ${invoice.total.toLocaleString()} تومان
          </div>
          
          <div class="footer-section">
            عنوان کتاب است و فرهنگانه
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const saveInvoice = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const html = createInvoiceHTML();
      
      // ایجاد PDF با ارتفاع مناسب
      const { uri } = await printAsync({
        html,
        width: 595,
        height: 842,
      });

      // اشتراک‌گذاری
      await shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'اشتراک‌گذاری فاکتور',
        UTI: 'com.adobe.pdf',
      });

      Alert.alert('موفق', 'فاکتور با موفقیت ذخیره شد');
    } catch (error) {
      console.error('Error saving invoice:', error);
      Alert.alert('خطا', 'در ذخیره فاکتور مشکلی پیش آمد');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* هدر فاکتور در گوشی */}
      <View style={styles.invoiceHeader}>
        <Text style={styles.invoiceTitle}>فاکتور فروش</Text>
        <Text style={styles.invoiceDate}>{invoice.date}</Text>
        <Text style={styles.invoiceSubtitle}>
              ****************************
        </Text>
      </View>

      {/* اطلاعات مشتری در گوشی */}
      <View style={styles.customerSection}>
        <Text style={styles.customerTitle}></Text>
        <Text style={styles.customerLine}>
          {invoice.customer ? `خریدار: ${invoice.customer}` : 'محمد علی صعب'}
          {invoice.phone ? ` | تلفن: ${invoice.phone}` : ''}
          {invoice.address ? ` | آدرس: ${invoice.address}` : ''}
        </Text>
      </View>

      {/* جدول محصولات در گوشی */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <View style={[styles.tableCell, styles.headerCell, { flex: 0.5 }]}>
            <Text style={styles.headerText}>ردیف</Text>
          </View>
          <View style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>
            <Text style={styles.headerText}>نام کالا</Text>
          </View>
          <View style={[styles.tableCell, styles.headerCell, { flex: 0.8 }]}>
            <Text style={styles.headerText}>تعداد</Text>
          </View>
          <View style={[styles.tableCell, styles.headerCell, { flex: 1.2 }]}>
            <Text style={styles.headerText}>قیمت واحد</Text>
          </View>
          <View style={[styles.tableCell, styles.headerCell, { flex: 1.2 }]}>
            <Text style={styles.headerText}>جمع</Text>
          </View>
        </View>

        {invoice.products.map((product, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCell, { flex: 0.5 }]}>
              <Text style={styles.cellText}>{index + 1}</Text>
            </View>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Text style={styles.cellText}>{product.name}</Text>
            </View>
            <View style={[styles.tableCell, { flex: 0.8 }]}>
              <Text style={styles.cellText}>{product.quantity}</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1.2 }]}>
              <Text style={styles.cellText}>{product.price.toLocaleString()}</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1.2 }]}>
              <Text style={styles.cellText}>
                {(product.quantity * product.price).toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* جمع کل در گوشی */}
      <View style={styles.totalSection}>
        <Text style={styles.totalText}>
          جمع کل: {invoice.total.toLocaleString()} تومان
        </Text>
      </View>

      {/* فوتر در گوشی */}
      <View style={styles.footerSection}>
        <Text style={styles.footerText}>
          فروش عمده گل توکلی 
        </Text>
      </View>

      {/* دکمه ذخیره */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, isSaving && styles.disabledButton]}
          onPress={saveInvoice}
          disabled={isSaving}
        >
          <Icon name="picture-as-pdf" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>
            {isSaving ? 'در حال ذخیره...' : 'ذخیره فاکتور PDF'}
          </Text>
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
  invoiceHeader: {
    alignItems: 'center',
    marginVertical: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  invoiceSubtitle: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  customerSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  customerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  customerLine: {
    fontSize: 12,
    color: '#555',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginVertical: 16,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  headerCell: {
    backgroundColor: '#f5f5f5',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  cellText: {
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  totalSection: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  totalText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  footerSection: {
    alignItems: 'center',
    marginVertical: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 11,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  buttonsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});