import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Are you sure you want to sign out?</Text>
      
      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out completely</Text>
      </Pressable>
      
      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#cddbeaff',
  },
  cancelText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
