import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
  useColorScheme,
  Linking,
} from 'react-native';

import { Link, router } from 'expo-router';
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomer';
import { Colors } from '@/constants/theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

function toE164(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (/^0\d{9}$/.test(digits)) return '233' + digits.slice(1);
  return digits;
}

// Generate a consistent pastel color from name initial
const AVATAR_COLORS = ['#3B82F6','#EC4899','#8B5CF6','#F59E0B','#22C55E','#EF4444','#06B6D4','#F97316'];
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function CustomersScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const { customers, loading, error, fetchCustomers } = useCustomers();
  const { deleteCustomer } = useDeleteCustomer();

  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    fetchCustomers(1, 100, search);
  }, [fetchCustomers, search]);

  useEffect(() => { load(); }, [search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers(1, 100, search);
    setRefreshing(false);
  };

  const handleWhatsApp = (phone: string) => {
    Linking.openURL(`https://wa.me/${toE164(phone)}`).catch(() =>
      Alert.alert('Error', 'Could not open WhatsApp.')
    );
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Customer', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { success, error: delError } = await deleteCustomer(id);
          if (success) load();
          else Alert.alert('Error', delError ?? 'Failed to delete customer.');
        },
      },
    ]);
  };

  const s = styles(colors, isDark);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safeArea}>
        <View style={s.container}>
          {/* ── Header ── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Link href={'/(app)/(tabs)/more'}>
                <Ionicons name="menu-outline" size={32} color="#04a6ecff" />
              </Link>
              <Text style={s.headerTitle}>Customers</Text>
            </View>
            <TouchableOpacity style={s.addBtn} onPress={() => router.push('/(app)/create_cust')}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ── Search ── */}
          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={17} color={colors.icon} style={{ marginRight: 8 }} />
            <TextInput
              style={s.searchInput}
              placeholder="Search by name or phone..."
              placeholderTextColor={colors.icon}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.icon} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={s.countLabel}>
            {customers.length} customer{customers.length !== 1 ? 's' : ''}
          </Text>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#04a6ecff" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={customers}
              keyExtractor={(item) => item.customer_id}
              contentContainerStyle={
                customers.length === 0 ? s.emptyContainer : { paddingBottom: 160, paddingTop: 4 }
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#04a6ecff" />
              }
              ListEmptyComponent={
                <View style={s.emptyState}>
                  <Ionicons name="people-outline" size={56} color={colors.icon} style={{ marginBottom: 12 }} />
                  <Text style={s.emptyText}>No customers yet</Text>
                  <Text style={s.emptySubText}>Tap "+" to add your first customer</Text>
                </View>
              }
              renderItem={({ item }) => {
                const color = avatarColor(item.customer_name);
                return (
                  <TouchableOpacity
                    style={s.card}
                    activeOpacity={0.82}
                    onPress={() =>
                      router.push({ pathname: '/(app)/cust_detail', params: { id: item.customer_id } })
                    }
                  >
                    <View style={s.cardTop}>
                      {/* Avatar in white container */}
                      <View style={s.avatarWrapper}>
                        <View style={[s.avatarCircle, { backgroundColor: color + '22' }]}>
                          <Text style={[s.avatarText, { color }]}>
                            {item.customer_name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {/* Info */}
                      <View style={s.cardBody}>
                        <Text style={s.cardName} numberOfLines={1}>{item.customer_name}</Text>
                        <View style={s.phoneRow}>
                          <Ionicons name="call-outline" size={12} color={colors.icon} />
                          <Text style={s.cardPhone} numberOfLines={1}>
                            {item.customer_phone || 'No phone'}
                          </Text>
                        </View>
                        {item.customer_address ? (
                          <View style={s.addressRow}>
                            <Ionicons name="location-outline" size={12} color={colors.icon} />
                            <Text style={s.cardAddress} numberOfLines={1}>
                              {item.customer_address}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View style={s.cardActions}>
                      <TouchableOpacity
                        style={[s.actionPill, { backgroundColor: '#22C55E18' }]}
                        onPress={() =>
                          item.customer_phone
                            ? Linking.openURL(`tel:${item.customer_phone}`)
                            : Alert.alert('No phone', 'No phone number saved.')
                        }
                      >
                        <Ionicons name="call" size={16} color="#22C55E" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[s.actionPill, { backgroundColor: '#25D36618' }]}
                        onPress={() =>
                          item.customer_phone
                            ? handleWhatsApp(item.customer_phone)
                            : Alert.alert('No phone', 'No phone number saved.')
                        }
                      >
                        <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[s.actionPill, { backgroundColor: '#04a6ec18' }]}
                        onPress={() =>
                          router.push({ pathname: '/(app)/create_cust', params: { id: item.customer_id } })
                        }
                      >
                        <Ionicons name="create-outline" size={16} color="#04a6ecff" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[s.actionPill, { backgroundColor: '#EF444418' }]}
                        onPress={() => handleDelete(item.customer_id, item.customer_name)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: isDark ? '#0F1117' : '#F0F4F8' },
    container: { flex: 1 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 8,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
    addBtn: {
      backgroundColor: '#04a6ecff',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 10,
      backgroundColor: isDark ? '#1A1D27' : '#fff',
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 2,
    },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.text },
    countLabel: {
      fontSize: 13,
      color: colors.icon,
      paddingHorizontal: 20,
      marginBottom: 8,
      fontWeight: '500',
    },
    errorText: { marginHorizontal: 20, color: '#EF4444', fontSize: 14, marginBottom: 8 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyText: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 6 },
    emptySubText: {
      fontSize: 13,
      color: colors.icon,
      textAlign: 'center',
      paddingHorizontal: 40,
    },

    // ── Card ──
    card: {
      backgroundColor: isDark ? '#1A1D27' : '#fff',
      marginHorizontal: 16,
      marginBottom: 10,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 2,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarWrapper: {
      marginRight: 14,
    },
    avatarCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      // white-ish bg via the tinted color above
    },
    avatarText: { fontSize: 22, fontWeight: '800' },
    cardBody: { flex: 1, minWidth: 0 },
    cardName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardPhone: { fontSize: 13, color: colors.icon, flex: 1 },
    cardAddress: { fontSize: 12, color: colors.icon, flex: 1 },

    // Action pills (compact horizontal row)
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 10,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#2A2D3A' : '#F1F5F9',
    },
    actionPill: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
