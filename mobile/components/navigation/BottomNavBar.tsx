import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  
  const activeColor = isDark ? '#f2f3f7ff' : '#04a6ecff'; 
  const inactiveColor = isDark ? '#a0a0a0' : '#8e8e93';
  const bgColor = isDark ? '#1e1e1e' : '#ffffff';
  const shadowColor = isDark ? '#000' : '#d1d1d1';

  const navItems = [
    { route: '/', icon: 'grid', label: 'Home' },
    { route: '/orders', icon: 'document', label: 'Orders' },
    { route: '/products', icon: 'pricetag', label: 'Products' },
    { route: '/customer', icon: 'people', label: 'Customers' },
    { route: '/more', icon: 'menu', label: 'More' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: bgColor, shadowColor }]}>
      {navItems.map((item) => {
        
        const isActive = pathname === item.route || (item.route !== '/' && pathname.startsWith(item.route));

        return (
          <Pressable 
            key={item.route} 
            style={styles.navItem} 
            onPress={() => router.navigate(item.route as any)}
          >
            <View style={[styles.iconContainer, isActive && { backgroundColor: `${activeColor}20` }]}>
              <Ionicons
                name={isActive ? (item.icon as any) : `${item.icon}-outline` as any}
                size={22}
                color={isActive ? activeColor : inactiveColor}
              />
            </View>
            <Text style={[styles.navText, { color: isActive ? activeColor : inactiveColor, fontWeight: isActive ? '600' : '400' }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12, 
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 20,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  navText: {
    fontSize: 14,
  },
});
