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
} from 'react-native';

import { Link, router } from 'expo-router';
import { useProducts, useDeleteProduct } from '@/hooks/useProduct';
import { ProductCategory } from '@/services/productApi';
import { Colors } from '@/constants/theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES: Array<{ label: string; value: ProductCategory | '' }> = [
  { label: 'All', value: '' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Groceries', value: 'groceries' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Office', value: 'office' },
  { label: 'Other', value: 'other' },
];

const CATEGORY_COLORS: Record<string, string> = {
  electronics: '#3B82F6',
  fashion: '#EC4899',
  groceries: '#22C55E',
  accessories: '#F59E0B',
  office: '#8B5CF6',
  other: '#6B7280',
};

export default function ProductsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const { products, loading, error, fetchProducts } = useProducts();
  const { deleteProduct } = useDeleteProduct();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<ProductCategory | ''>('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    (cat?: ProductCategory | '') => {
      const c = cat !== undefined ? cat : selectedCat;
      fetchProducts(c ? { category: c as ProductCategory } : {});
    },
    [fetchProducts, selectedCat],
  );

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(selectedCat ? { category: selectedCat as ProductCategory } : {});
    setRefreshing(false);
  };

  const handleCategoryFilter = (cat: ProductCategory | '') => {
    setSelectedCat(cat);
    fetchProducts(cat ? { category: cat as ProductCategory } : {});
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Product', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { success, error: delErr } = await deleteProduct(id);
          if (success) load();
          else Alert.alert('Error', delErr ?? 'Failed to delete product.');
        },
      },
    ]);
  };

  const filtered = products.filter((p) =>
    p.prod_name.toLowerCase().includes(search.toLowerCase()),
  );

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
              <Text style={s.headerTitle}>Products</Text>
            </View>
            <TouchableOpacity style={s.addBtn} onPress={() => router.push('/(app)/create_prod')}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ── Search ── */}
          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={17} color={colors.icon} style={{ marginRight: 8 }} />
            <TextInput
              style={s.searchInput}
              placeholder="Search products..."
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

          {/* ── Category Pills ── */}
          <View>
            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={(item) => item.value || 'all'}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.pillsRow}
              renderItem={({ item }) => {
                const active = selectedCat === item.value;
                return (
                  <TouchableOpacity
                    style={[s.pill, active && s.pillActive]}
                    onPress={() => handleCategoryFilter(item.value as ProductCategory | '')}
                  >
                    <Text style={[s.pillText, active && s.pillTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* ── Count ── */}
          <Text style={s.countLabel}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </Text>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          {/* ── List ── */}
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#04a6ecff" style={{ marginTop: 50 }} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.prod_id}
              contentContainerStyle={
                filtered.length === 0 ? s.emptyContainer : { paddingBottom: 160, paddingTop: 4 }
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#04a6ecff" />
              }
              ListEmptyComponent={
                <View style={s.emptyState}>
                  <Ionicons name="cube-outline" size={56} color={colors.icon} style={{ marginBottom: 12 }} />
                  <Text style={s.emptyText}>No products found</Text>
                  <Text style={s.emptySubText}>Tap "+" to create your first product</Text>
                </View>
              }
              renderItem={({ item }) => {
                const catColor = CATEGORY_COLORS[item.prod_cat] ?? '#6B7280';
                return (
                  <TouchableOpacity
                    style={s.card}
                    activeOpacity={0.82}
                    onPress={() =>
                      router.push({ pathname: '/(app)/prod_detail', params: { id: item.prod_id } })
                    }
                  >
                    <View style={s.cardTop}>
                      {/* Color icon circle */}
                      <View style={s.iconWrapper}>
                        <View style={[s.iconCircle, { backgroundColor: catColor + '22' }]}>
                          <Ionicons name="pricetag" size={20} color={catColor} />
                        </View>
                      </View>

                      {/* Info */}
                      <View style={s.cardBody}>
                        <Text style={s.cardName} numberOfLines={1}>{item.prod_name}</Text>
                        <View style={s.metaRow}>
                          <View style={[s.catBadge, { backgroundColor: catColor + '18' }]}>
                            <Text style={[s.catBadgeText, { color: catColor }]}>{item.prod_cat}</Text>
                          </View>
                        </View>
                        <View style={s.stockRow}>
                          <Ionicons name="layers-outline" size={12} color={colors.icon} />
                          <Text style={s.stockText}>{item.prod_quantity} in stock</Text>
                        </View>
                      </View>

                      {/* Price */}
                      <Text style={s.cardPrice}>₵{Number(item.prod_price).toFixed(2)}</Text>
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

    // ── Header ──
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

    // ── Search ──
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 12,
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

    // ── Pills ──
    pillsRow: {
      paddingHorizontal: 16,
      gap: 8,
      paddingBottom: 2,
    },
    pill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: isDark ? '#1A1D27' : '#fff',
      borderWidth: 1,
      borderColor: isDark ? '#2A2D3A' : '#DDE3EA',
    },
    pillActive: { backgroundColor: '#04A6EC', borderColor: '#04A6EC' },
    pillText: { fontSize: 14, color: colors.icon, fontWeight: '500' },
    pillTextActive: { color: '#fff', fontWeight: '700' },

    // ── Count ──
    countLabel: {
      fontSize: 14,
      color: colors.icon,
      paddingHorizontal: 20,
      marginTop: 12,
      marginBottom: 8,
      fontWeight: '500',
    },

    errorText: { marginHorizontal: 20, color: '#EF4444', fontSize: 14, marginBottom: 8 },

    // ── Empty ──
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
    iconWrapper: {
      marginRight: 14,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardBody: { flex: 1, minWidth: 0 },
    cardName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
      textTransform: 'capitalize',
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    catBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    stockRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    stockText: { fontSize: 12, color: colors.icon },
    cardPrice: { fontSize: 16, fontWeight: '800', color: '#04a6ecff' },
  });
