import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  useColorScheme,
} from 'react-native';

import { Link, router, useFocusEffect } from 'expo-router';
import { useOrders } from '@/hooks/useOrder';
import { Colors } from '@/constants/theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OrdersScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { orders, loading, error, fetchOrders } = useOrders();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const filtered = orders.filter((o) =>
    o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const s = styles(colors, isDark);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safeArea}>
        <View style={s.container}>
          
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Link href={'/(app)/(tabs)/more'}>
                <Ionicons name="menu-outline" size={32} color="#04a6ecff" />
              </Link>
              <Text style={s.headerTitle}>Orders</Text>
            </View>
            <TouchableOpacity style={s.addBtn} onPress={() => router.push('/(app)/create_order')}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ── Search ── */}
          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={17} color={colors.icon} style={{ marginRight: 8 }} />
            <TextInput
              style={s.searchInput}
              placeholder="Search by customer..."
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
            {filtered.length} order{filtered.length !== 1 ? 's' : ''}
          </Text>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          {/* ── List ── */}
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#04a6ecff" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.order_id}
              contentContainerStyle={
                filtered.length === 0 ? s.emptyContainer : { paddingBottom: 160, paddingTop: 4 }
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#04a6ecff" />
              }
              ListEmptyComponent={
                <View style={s.emptyState}>
                  <Ionicons name="receipt-outline" size={56} color={colors.icon} style={{ marginBottom: 12 }} />
                  <Text style={s.emptyText}>No orders found</Text>
                  <Text style={s.emptySubText}>Tap "+" to create a new order</Text>
                </View>
              }
              renderItem={({ item }) => {
                const statusColor = item.order_status === 'completed' ? '#22C55E' : item.order_status === 'cancelled' ? '#EF4444' : '#F59E0B';
                return (
                  <TouchableOpacity
                    style={s.card}
                    activeOpacity={0.82}
                    onPress={() =>
                      router.push({ pathname: '/(app)/order_detail', params: { id: item.order_id } })
                    }
                  >
                    <View style={s.cardTop}>
                      {/* Icon */}
                      <View style={s.iconWrapper}>
                        <View style={[s.iconCircle, { backgroundColor: statusColor + '22' }]}>
                          <Ionicons name="receipt" size={20} color={statusColor} />
                        </View>
                      </View>

                      {/* Info */}
                      <View style={s.cardBody}>
                        <Text style={s.cardName} numberOfLines={1}>{item.customer_name || 'Walk-in Customer'}</Text>
                        <View style={s.metaRow}>
                          <View style={[s.catBadge, { backgroundColor: statusColor + '18' }]}>
                            <Text style={[s.catBadgeText, { color: statusColor }]}>{item.order_status}</Text>
                          </View>
                        </View>
                        <View style={s.stockRow}>
                          <Ionicons name="time-outline" size={12} color={colors.icon} />
                          <Text style={s.stockText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>
                      </View>

                      {/* Price */}
                      <Text style={s.cardPrice}>₵{Number(item.order_total).toFixed(2)}</Text>
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
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
    addBtn: {
      backgroundColor: '#04a6ecff', width: 40, height: 40, borderRadius: 20,
      justifyContent: 'center', alignItems: 'center',
    },
    searchRow: {
      flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12,
      backgroundColor: isDark ? '#1A1D27' : '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 2,
      shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2,
    },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.text },
    countLabel: { fontSize: 14, color: colors.icon, paddingHorizontal: 20, marginTop: 12, marginBottom: 8, fontWeight: '500' },
    errorText: { marginHorizontal: 20, color: '#EF4444', fontSize: 14, marginBottom: 8 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyText: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 6 },
    emptySubText: { fontSize: 13, color: colors.icon, textAlign: 'center', paddingHorizontal: 40 },
    card: {
      backgroundColor: isDark ? '#1A1D27' : '#fff', marginHorizontal: 16, marginBottom: 10,
      borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14,
      shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 2,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    iconWrapper: { marginRight: 14 },
    iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    cardBody: { flex: 1, minWidth: 0 },
    cardName: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4, textTransform: 'capitalize' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    catBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    stockRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    stockText: { fontSize: 12, color: colors.icon },
    cardPrice: { fontSize: 16, fontWeight: '800', color: '#04a6ecff' },
  });
