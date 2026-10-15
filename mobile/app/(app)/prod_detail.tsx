import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useProduct, useDeleteProduct } from '@/hooks/useProduct';
import { Colors } from '@/constants/theme';

const CATEGORY_COLORS: Record<string, string> = {
  electronics: '#3B82F6',
  fashion: '#EC4899',
  groceries: '#22C55E',
  accessories: '#F59E0B',
  office: '#8B5CF6',
  other: '#6B7280',
};

const CAT_EMOJI: Record<string, string> = {
  electronics: '📱', fashion: '👗', groceries: '🛒',
  accessories: '⌚', office: '🖊️', other: '📦',
};

function InfoRow({ label, value, isDark, colors }: { label: string; value: string; isDark: boolean; colors: typeof Colors.light }) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 14, paddingHorizontal: 18,
      backgroundColor: isDark ? '#1A1D27' : '#fff',
      borderRadius: 12, marginBottom: 8,
    }}>
      <Text style={{ fontSize: 13, color: colors.icon, fontWeight: '500' }}>{label}</Text>
      <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 12 }}>
        {value}
      </Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const { product, loading, error, fetchProduct } = useProduct();
  const { deleteProduct, loading: deleting } = useDeleteProduct();

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Product', `Are you sure you want to delete "${product?.prod_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const { success, error } = await deleteProduct(id!);
          if (success) {
            router.back();
          } else {
            Alert.alert('Error', error ?? 'Failed to delete product.');
          }
        },
      },
    ]);
  };

  const s = styles(colors, isDark);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#EF4444', fontSize: 16 }}>{error ?? 'Product not found.'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ color: colors.tint, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const catColor = CATEGORY_COLORS[product.prod_cat] ?? '#6B7280';
  const createdDate = new Date(product.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[s.hero, { backgroundColor: catColor + '18' }]}>
        <View style={[s.heroIcon, { backgroundColor: catColor + '33' }]}>
          <Text style={s.heroEmoji}>{CAT_EMOJI[product.prod_cat] ?? '📦'}</Text>
        </View>
        <Text style={s.heroName}>{product.prod_name}</Text>
        <View style={[s.catChip, { backgroundColor: catColor + '22', borderColor: catColor + '55' }]}>
          <Text style={[s.catChipText, { color: catColor }]}>{product.prod_cat}</Text>
        </View>
      </View>


      <View style={s.priceCard}>
        <Text style={s.priceLabel}>Unit Price</Text>
        <Text style={s.priceValue}>₵{Number(product.prod_price).toFixed(2)}</Text>
        <Text style={s.stockLabel}>
          {product.prod_quantity > 0 ? `${product.prod_quantity} in stock` : 'Out of stock'}
        </Text>
        <View style={[s.stockBar, { backgroundColor: isDark ? '#2A2D3A' : '#EEF2F7' }]}>
          <View style={[s.stockFill, {
            width: `${Math.min((product.prod_quantity / 100) * 100, 100)}%`,
            backgroundColor: product.prod_quantity > 100 ? '#22C55E' : product.prod_quantity > 50 ? '#F59E0B' : '#EF4444',
          }]} />
        </View>
      </View>


      <View style={s.section}>
        <Text style={s.sectionTitle}>Details</Text>
        <InfoRow label="Category" value={product.prod_cat.charAt(0).toUpperCase() + product.prod_cat.slice(1)} isDark={isDark} colors={colors} />
        <InfoRow label="Quantity" value={String(product.prod_quantity)} isDark={isDark} colors={colors} />
        <InfoRow label="Price" value={`₵${Number(product.prod_price).toFixed(2)}`} isDark={isDark} colors={colors} />
        <InfoRow label="Created" value={createdDate} isDark={isDark} colors={colors} />
      </View>


      <View style={s.actions}>
        <TouchableOpacity
          style={s.editBtn}
          onPress={() => router.push({ pathname: '/(app)/create_prod', params: { id: product.prod_id } })}
        >
          <Text style={s.editBtnText}>Edit Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.deleteActionBtn} onPress={handleDelete} disabled={deleting}>
          {deleting
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.deleteActionBtnText}>Delete</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (colors: typeof Colors.light, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0F1117' : '#F5F7FA'
    },
    hero: {
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 30,
      paddingHorizontal: 20
    },
    heroIcon: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14
    },
    heroEmoji: { fontSize: 40 },
    heroName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
      textTransform: 'capitalize'
    },
    catChip: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 5, borderWidth: 1 },
    catChipText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
    priceCard: {
      margin: 16, backgroundColor: isDark ? '#1A1D27' : '#fff',
      borderRadius: 10, padding: 20,
      shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8, elevation: 4,
    },
    priceLabel: { fontSize: 13, color: colors.icon, fontWeight: '500' },
    priceValue: { fontSize: 34, fontWeight: '800', color: '#04a6ecff', marginVertical: 4 },
    stockLabel: { fontSize: 13, color: colors.icon, marginBottom: 10 },
    stockBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
    stockFill: { height: '100%', borderRadius: 3 },
    section: { paddingHorizontal: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 14, textAlign: 'center', fontWeight: '700', color: colors.icon, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
    actions: { paddingHorizontal: 20, gap: 10 },
    editBtn: { backgroundColor: '#04a6ecff', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    editBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    deleteActionBtn: { backgroundColor: '#EF4444', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
    deleteActionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  });
