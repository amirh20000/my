import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import NewInvoiceScreen from './screens/NewInvoiceScreen';
import InvoiceScreen from './screens/InvoiceScreen';
import AddProductScreen from './screens/AddProductScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'لیست فاکتورها' }}
        />
        <Stack.Screen 
          name="NewInvoice" 
          component={NewInvoiceScreen} 
          options={{ title: 'فاکتور جدید' }}
        />
        <Stack.Screen 
          name="Invoice" 
          component={InvoiceScreen} 
          options={{ title: 'نمایش فاکتور' }}
        />
        <Stack.Screen 
          name="AddProduct" 
          component={AddProductScreen} 
          options={{ title: 'افزودن کالا' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}