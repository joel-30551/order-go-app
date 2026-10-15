import {Stack} from 'expo-router';

export default function RootLayout(){
  return(
    <Stack screenOptions={{ headerTintColor: '#04a6ec' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen name="create_cust" options={{ title: 'Create Customer', headerShadowVisible: false, headerBackTitle: 'Customer' }} />
      <Stack.Screen name="create_order" options={{ title: 'Create Order', headerShadowVisible: false, headerBackTitle: 'Orders' }} />
      <Stack.Screen name="create_prod" options={{ headerTitle: '' ,headerShadowVisible: false, headerBackTitle: 'Products' }} />
      <Stack.Screen name="cust_detail" options={{ title: 'Customer Details', headerShadowVisible: false, headerBackTitle: 'Customer' }} />
      <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      <Stack.Screen name="notif" options={{ title: 'Notifications', headerShadowVisible: false, headerBackTitle: 'More' }} />
      <Stack.Screen name="order_detail" options={{ title: 'Order Details', headerShadowVisible: false, headerBackTitle: 'Orders' }} />
      <Stack.Screen name="prod_detail" options={{ title: 'Product Details', headerShadowVisible: false, headerBackTitle: 'Products' }} />
      <Stack.Screen name="profile" options={{ title: '', headerShadowVisible: false, headerBackTitle: 'More' }} />
      <Stack.Screen name="settings" options={{ title: '', headerShadowVisible: false, headerBackTitle: 'More' }} />
      <Stack.Screen name="sign-out" options={{ title: '', headerShadowVisible: false, headerBackTitle: 'More' }} />
      <Stack.Screen name="about" options={{ title: '', headerBackTitle: 'More', headerShadowVisible: false }} />
      <Stack.Screen name="privacy" options={{ title: '', headerBackTitle: 'More', headerShadowVisible: false }} />

      
    </Stack>
  );
}