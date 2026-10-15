import { Tabs } from 'expo-router';
import BottomNavBar from '@/components/navigation/BottomNavBar';

export default function TabLayout() {

  return (
    <Tabs
      tabBar={() => <BottomNavBar />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      <Tabs.Screen name="products" options={{ title: 'Products' }} />
      <Tabs.Screen name="customer" options={{ title: 'Customer' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
    </Tabs>
  );
}
