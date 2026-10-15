import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@clerk/clerk-expo';

export default function MorePage() {
  const menuItems = [
    { title: 'About', route: '/(app)/about', icon: 'information-circle-outline' },
    { title: 'Notification', route: '/(app)/notif', icon: 'notifications-outline' },
    { title: 'Settings', route: '/(app)/settings', icon: 'settings-outline' },
    { title: 'Privacy', route: '/(app)/privacy', icon: 'shield-outline' },
    { title: 'Sign Out', route: '/(app)/sign-out', icon: 'log-out-outline', isDanger: true },
  ];

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useUser();

  const textColor = isDark ? '#ffffff' : '#000000';
  const cardBg = isDark ? '#1e1e1e' : '#72cff7ff';
  const mutedText = isDark ? '#a0a0a0' : '#8e8e93';
  const borderColor = isDark ? '#333333' : '#eaebed';

  const email = user?.primaryEmailAddress?.emailAddress || '';
  const username = email.split('@')[0] || 'User';
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>More</Text>
      <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {initials}
                </Text>
              </View>
              <Text style={[styles.nameText, { color: textColor }]}>
                {username}
              </Text>
              <Text style={[styles.emailText, { color: mutedText }]}>
                {email}
              </Text>
            </View>
      <View style={styles.list}>
        {menuItems.map((item, index) => (
          <Link href={item.route as any} asChild key={index}>
            <Pressable style={styles.listItem}>
              <View style={styles.listItemContent}>
                <Ionicons name={item.icon as any} size={24} color={item.isDanger ? '#ff3b30' : '#333'} />
                <Text style={[styles.listItemText, item.isDanger && styles.dangerText]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#F0F4F8',
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  list: {
    top:0,
    margin:20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#272626ff',
  },
  dangerText: {
    color: '#ff3b30',
  },
  profileCard: {
    alignItems: 'center',
    padding:40,
    borderWidth: 1,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#04a6ec',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#04a6ec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '400',
  },
});
