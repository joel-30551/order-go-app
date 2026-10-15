import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, useColorScheme, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useCreateOrder } from '@/hooks/useOrder';
import { useCustomers } from '@/hooks/useCustomer';
import { useProducts } from '@/hooks/useProduct';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const CATEGORY_COLORS: Record<string, string> = {
  electronics: '#3B82F6', fashion: '#EC4899', groceries: '#22C55E',
  accessories: '#F59E0B', office: '#8B5CF6', other: '#6B7280',
};

const CAT_EMOJI: Record<string, string> = {
  electronics: '📱', fashion: '👗', groceries: '🛒',
  accessories: '⌚', office: '🖊️', other: '📦',
};

export default function CreateOrderScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const { customers, fetchCustomers } = useCustomers();
  const { products, fetchProducts } = useProducts();
  const { createOrder, loading: saving } = useCreateOrder();

  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  
  const [searchCust, setSearchCust] = useState('');
  const [searchProd, setSearchProd] = useState('');

  useEffect(() => {
    fetchCustomers(1, 100);
    fetchProducts();
  }, []);

  const handleIncrement = (prodId: string, maxQuantity: number) => {
    setCart((prev) => {
      const current = prev[prodId] || 0;
      if (current >= maxQuantity) {
         Alert.alert('Limit Reached', 'Not enough stock available.');
         return prev;
      }
      return { ...prev, [prodId]: current + 1 };
    });
  };

  const handleDecrement = (prodId: string) => {
    setCart((prev) => {
      const current = prev[prodId] || 0;
      if (current <= 1) {
        const newCart = { ...prev };
        delete newCart[prodId];
        return newCart;
      }
      return { ...prev, [prodId]: current - 1 };
    });
  };

  const cartTotal = Object.entries(cart).reduce((sum, [prodId, qty]) => {
    const prod = products.find(p => p.prod_id === prodId);
    return sum + (Number(prod?.prod_price || 0) * qty);
  }, 0);

  const handleSubmit = async () => {
    if (!selectedCustId) return Alert.alert('Error', 'Please select a customer.');
    const items = Object.entries(cart).map(([prodId, qty]) => ({ prod_id: prodId, quantity: qty }));
    if (items.length === 0) return Alert.alert('Error', 'Please add at least one product.');

    const { data, error } = await createOrder({ cust_id: selectedCustId, items });
    if (data) {
      Alert.alert('Success', 'Order created successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    } else {
      Alert.alert('Error', error || 'Failed to create order.');
    }
  };

  const s = styles(colors, isDark);
  
  const filteredCustomers = customers.filter(c => c.customer_name.toLowerCase().includes(searchCust.toLowerCase()));
  const filteredProducts = products.filter(p => p.prod_name.toLowerCase().includes(searchProd.toLowerCase()));
  const selectedCustomer = customers.find(c => c.customer_id === selectedCustId);

  return (
    <SafeAreaProvider style={{ backgroundColor: isDark ? '#0F1117' : '#F5F7FA' }}>
      <SafeAreaView>
        <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 140 }}>
          
          <View style={s.pageHeader}>
            <Text style={s.pageTitle}>New Order</Text>
            <Text style={s.pageSubtitle}>Select a customer and add products</Text>
          </View>

          {/* Customer Selection */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>1. Customer Delivery</Text>
            {selectedCustomer ? (
               <View style={s.selectedCard}>
                 <View style={s.avatarSmall}>
                    <Text style={s.avatarSmallText}>{selectedCustomer.customer_name.charAt(0).toUpperCase()}</Text>
                 </View>
                 <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.selectedName}>{selectedCustomer.customer_name}</Text>
                    {selectedCustomer.customer_phone ? <Text style={s.selectedPhone}>{selectedCustomer.customer_phone}</Text> : null}
                 </View>
                 <TouchableOpacity style={s.changeBtn} onPress={() => setSelectedCustId(null)}>
                    <Text style={s.changeBtnText}>Change</Text>
                 </TouchableOpacity>
               </View>
            ) : (
               <>
                 <View style={s.searchRow}>
                   <Ionicons name="search-outline" size={17} color={colors.icon} style={{ marginRight: 8 }} />
                   <TextInput
                     style={s.searchInput}
                     placeholder="Search customers..."
                     placeholderTextColor={colors.icon}
                     value={searchCust}
                     onChangeText={setSearchCust}
                   />
                 </View>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollRow}>
                   {filteredCustomers.map((c) => (
                     <TouchableOpacity 
                       key={c.customer_id} 
                       style={s.pill}
                       onPress={() => setSelectedCustId(c.customer_id)}
                     >
                       <View style={s.pillAvatar}>
                          <Text style={s.pillAvatarText}>{c.customer_name.charAt(0).toUpperCase()}</Text>
                       </View>
                       <Text style={s.pillText}>{c.customer_name}</Text>
                     </TouchableOpacity>
                   ))}
                   {filteredCustomers.length === 0 && <Text style={s.emptyMsg}>No matching customers.</Text>}
                 </ScrollView>
               </>
            )}
          </View>

          {/* Product Selection */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>2. Cart Items</Text>
            
            <View style={[s.searchRow, { marginHorizontal: 20, marginBottom: 16 }]}>
              <Ionicons name="search-outline" size={17} color={colors.icon} style={{ marginRight: 8 }} />
              <TextInput
                style={s.searchInput}
                placeholder="Search products..."
                placeholderTextColor={colors.icon}
                value={searchProd}
                onChangeText={setSearchProd}
              />
            </View>

            {filteredProducts.length === 0 ? (
               <Text style={s.emptyMsg}>No products match your search.</Text>
            ) : (
              filteredProducts.map((p) => {
                const qtyInCart = cart[p.prod_id] || 0;
                const catColor = CATEGORY_COLORS[p.prod_cat] ?? '#6B7280';
                const catEmoji = CAT_EMOJI[p.prod_cat] ?? '📦';

                return (
                  <View key={p.prod_id} style={[s.productCard, qtyInCart > 0 && s.productCardActive]}>
                    <View style={[s.prodIconWrap, { backgroundColor: catColor + '22' }]}>
                       <Text style={s.prodIconEmoji}>{catEmoji}</Text>
                    </View>
                    <View style={s.prodInfo}>
                      <Text style={s.prodName} numberOfLines={1}>{p.prod_name}</Text>
                      <Text style={s.prodPrice}>₵{Number(p.prod_price).toFixed(2)}  <Text style={s.stockLabel}>({p.prod_quantity} left)</Text></Text>
                    </View>
                    <View style={s.controls}>
                      {qtyInCart > 0 && (
                        <>
                          <TouchableOpacity style={s.ctrlBtn} onPress={() => handleDecrement(p.prod_id)}>
                            <Ionicons name="remove" size={18} color={isDark ? '#fff' : '#000'} />
                          </TouchableOpacity>
                          <Text style={s.qtyText}>{qtyInCart}</Text>
                        </>
                      )}
                      <TouchableOpacity 
                        style={[s.ctrlBtn, qtyInCart > 0 ? s.ctrlBtnAddMore : s.ctrlBtnAddInit]} 
                        onPress={() => handleIncrement(p.prod_id, p.prod_quantity)}
                      >
                        <Ionicons name="add" size={18} color={qtyInCart > 0 ? colors.text : '#fff'} />
                        {qtyInCart === 0 && <Text style={s.addInitText}>Add</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Floating Bottom Action */}
      <View style={s.bottomBar}>
        <View style={s.bottomBarInfo}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>₵{cartTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
            style={[s.submitBtn, (!selectedCustId || cartTotal === 0) && s.submitBtnDisabled]} 
            onPress={handleSubmit} 
            disabled={saving || !selectedCustId || cartTotal === 0}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Text style={s.submitBtnText}>Place Order</Text>
               <Ionicons name="arrow-forward" size={18} color="#fff" style={{marginLeft: 6}} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

const styles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { height: '100%', backgroundColor: isDark ? '#0F1117' : '#F5F7FA' },
  pageHeader: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: colors.text },
  pageSubtitle: { fontSize: 14, color: colors.icon, marginTop: 4 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.icon, textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 14, letterSpacing: 0.8 },
  
  searchRow: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16,
    backgroundColor: isDark ? '#1A1D27' : '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 2,
    shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 1,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.text },
  
  scrollRow: { paddingHorizontal: 20, gap: 12 },
  pill: { 
    flexDirection: 'row', alignItems: 'center', paddingRight: 16, paddingLeft: 6, paddingVertical: 6, 
    borderRadius: 30, backgroundColor: isDark ? '#1A1D27' : '#fff', 
    borderWidth: 1, borderColor: isDark ? '#2A2D3A' : '#DDE3EA' 
  },
  pillAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#04a6ecff', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  pillAvatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pillText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  
  selectedCard: { 
     flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1A1D27' : '#fff', 
     marginHorizontal: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#04a6ec44',
     shadowColor: '#04a6ec', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3
  },
  avatarSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#04a6ecff', justifyContent: 'center', alignItems: 'center' },
  avatarSmallText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  selectedName: { fontSize: 16, fontWeight: '700', color: colors.text },
  selectedPhone: { fontSize: 13, color: colors.icon, marginTop: 2 },
  changeBtn: { backgroundColor: '#04a6ec22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  changeBtnText: { color: '#04a6ecff', fontWeight: '700', fontSize: 12 },

  emptyMsg: { paddingHorizontal: 20, color: colors.icon, fontStyle: 'italic' },
  
  productCard: { 
    flexDirection: 'row', backgroundColor: isDark ? '#1A1D27' : '#fff', 
    marginHorizontal: 20, marginBottom: 12, borderRadius: 16, padding: 14, alignItems: 'center', 
    shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 1,
    borderWidth: 1, borderColor: 'transparent'
  },
  productCardActive: {
    borderColor: '#04a6ec44', backgroundColor: isDark ? '#1A1D27' : '#F4FAFE'
  },
  prodIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  prodIconEmoji: { fontSize: 22 },
  prodInfo: { flex: 1 },
  prodName: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4, textTransform: 'capitalize' },
  prodPrice: { fontSize: 14, color: '#04a6ecff', fontWeight: '800' },
  stockLabel: { color: colors.icon, fontWeight: '500', fontSize: 12 },
  
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctrlBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: isDark ? '#2A2D3A' : '#EEF2F7', justifyContent: 'center', alignItems: 'center' },
  ctrlBtnAddInit: { backgroundColor: '#04a6ecff', width: 'auto', paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', gap: 4 },
  addInitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  ctrlBtnAddMore: { backgroundColor: isDark ? '#2A2D3A' : '#EEF2F7' },
  qtyText: { fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 20, textAlign: 'center' },
  
  bottomBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: isDark ? '#1A1D27' : '#fff', 
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, 
    flexDirection: 'row', alignItems: 'center', 
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: -4 }, shadowRadius: 12, elevation: 15,
    borderTopWidth: 1, borderTopColor: isDark ? '#2A2D3A' : '#F1F5F9'
  },
  bottomBarInfo: { flex: 1 },
  totalLabel: { fontSize: 12, color: colors.icon, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2, letterSpacing: 0.5 },
  totalValue: { fontSize: 24, fontWeight: '800', color: colors.text },
  submitBtn: { backgroundColor: '#04a6ecff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  submitBtnDisabled: { backgroundColor: isDark ? '#2A2D3A' : '#DDE3EA' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
