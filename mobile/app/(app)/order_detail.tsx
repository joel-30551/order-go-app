import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useOrder, useDeleteOrder } from '@/hooks/useOrder';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const { order, loading, error, fetchOrder } = useOrder();
  const { deleteOrder, loading: deleting } = useDeleteOrder();

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Order', `Are you sure? This will refund stock to inventory.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          const { success, error: delError } = await deleteOrder(id!);
          if (success) router.replace('/(app)/(tabs)/orders');
          else Alert.alert('Error', delError ?? 'Failed to delete order.');
        } 
      },
    ]);
  };

  const s = styles(colors, isDark);

  if (loading || !order) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        {loading ? <ActivityIndicator size="large" color={colors.tint} /> : <Text style={{ color: '#EF4444' }}>{error}</Text>}
      </View>
    );
  }

  const statusColor = order.order_status === 'completed' ? '#22C55E' : order.order_status === 'cancelled' ? '#EF4444' : '#F59E0B';

  return (
    <SafeAreaProvider style={s.safeArea}>
      <SafeAreaView>
        <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 60 }}>
          
          <View style={[s.hero, { backgroundColor: statusColor + '18' }]}>
            <View style={[s.heroIcon, { backgroundColor: statusColor + '33' }]}>
              <Ionicons name="receipt" size={40} color={statusColor} />
            </View>
            <Text style={s.heroTotal}>₵{Number(order.order_total).toFixed(2)}</Text>
            <View style={[s.catChip, { backgroundColor: statusColor + '22', borderColor: statusColor + '55' }]}>
              <Text style={[s.catChipText, { color: statusColor }]}>{order.order_status}</Text>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Customer Info</Text>
            <View style={s.infoCard}>
              <Text style={s.infoLabel}>Name</Text>
              <Text style={s.infoValue}>{order.customer_name || 'Walk-in'}</Text>
              {order.customer_phone && (
                <>
                  <Text style={[s.infoLabel, { marginTop: 12 }]}>Phone</Text>
                  <Text style={s.infoValue}>{order.customer_phone}</Text>
                </>
              )}
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Order Items</Text>
            {order.items?.map((item) => (
               <View key={item.order_item_id} style={s.itemCard}>
                 <View style={{ flex: 1 }}>
                   <Text style={s.itemName}>{item.prod_name}</Text>
                   <Text style={s.itemCat}>{item.prod_cat}</Text>
                 </View>
                 <View style={{ alignItems: 'flex-end'}}>
                   <Text style={s.itemPrice}>₵{Number(item.price_at_purchase).toFixed(2)}</Text>
                   <Text style={s.itemQty}>x {item.quantity}</Text>
                 </View>
               </View>
            ))}
          </View>

          <View style={s.actions}>
            <TouchableOpacity style={s.deleteActionBtn} onPress={handleDelete} disabled={deleting}>
              {deleting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.deleteActionBtnText}>Delete Order & Refund Stock</Text>}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = (colors: any, isDark: boolean) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: isDark ? '#0F1117' : '#F5F7FA' },
  container: { height: '100%' },
  hero: { alignItems: 'center', paddingTop: 30, paddingBottom: 24, paddingHorizontal: 20 },
  heroIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTotal: { fontSize: 28, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 10 },
  catChip: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 5, borderWidth: 1 },
  catChipText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  section: { paddingHorizontal: 16, marginBottom: 20, marginTop: 10 },
  sectionTitle: { fontSize: 14, textAlign: 'center', fontWeight: '700', color: colors.icon, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  infoCard: { backgroundColor: isDark ? '#1A1D27' : '#fff', padding: 16, borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  infoLabel: { fontSize: 12, color: colors.icon, fontWeight: '600', textTransform: 'uppercase' },
  infoValue: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 2 },
  itemCard: { flexDirection: 'row', backgroundColor: isDark ? '#1A1D27' : '#fff', padding: 16, borderRadius: 14, marginBottom: 8, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: colors.text },
  itemCat: { fontSize: 12, color: colors.icon, marginTop: 2, textTransform: 'capitalize' },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#04a6ecff' },
  itemQty: { fontSize: 13, color: colors.icon, fontWeight: '600', marginTop: 2 },
  actions: { paddingHorizontal: 20, marginTop: 10 },
  deleteActionBtn: { backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  deleteActionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
