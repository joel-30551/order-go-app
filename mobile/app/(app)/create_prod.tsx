import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useColorScheme,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCreateProduct, useUpdateProduct, useProduct } from '@/hooks/useProduct';
import { ProductCategory } from '@/services/productApi';
import { Colors } from '@/constants/theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES: Array<{ label: string; value: ProductCategory; emoji: string }> = [
  { label: 'Electronics', value: 'electronics', emoji: '📱' },
  { label: 'Fashion', value: 'fashion', emoji: '👗' },
  { label: 'Groceries', value: 'groceries', emoji: '🛒' },
  { label: 'Accessories', value: 'accessories', emoji: '⌚' },
  { label: 'Office', value: 'office', emoji: '🖊️' },
  { label: 'Other', value: 'other', emoji: '📦' },
];



const CATEGORY_COLORS: Record<string, string> = {
  electronics: '#3B82F6', fashion: '#EC4899', groceries: '#22C55E',
  accessories: '#F59E0B', office: '#8B5CF6', other: '#6B7280',
};

interface FormErrors {
  prod_name?: string;
  prod_price?: string;
  prod_quantity?: string;
}

export default function CreateProductScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';


  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodQuantity, setProdQuantity] = useState('0');
  const [prodCat, setProdCat] = useState<ProductCategory>('other');
  const [errors, setErrors] = useState<FormErrors>({});

  const { createProduct, loading: creating, error: createError } = useCreateProduct();
  const { updateProduct, loading: updating, error: updateError } = useUpdateProduct();
  const { product, fetchProduct, loading: loadingProduct } = useProduct();

  const loading = creating || updating;


  useEffect(() => {
    if (isEdit) fetchProduct(id);
  }, [id]);

  useEffect(() => {
    if (product && isEdit) {
      setProdName(product.prod_name);
      setProdPrice(String(product.prod_price));
      setProdQuantity(String(product.prod_quantity));
      setProdCat(product.prod_cat);
    }
  }, [product]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!prodName.trim() || prodName.trim().length < 4) newErrors.prod_name = 'Name must be at least 4 characters.';
    if (!prodPrice || isNaN(Number(prodPrice)) || Number(prodPrice) <= 0) newErrors.prod_price = 'Enter a valid positive price.';
    if (prodQuantity === '' || isNaN(Number(prodQuantity)) || Number(prodQuantity) < 0) newErrors.prod_quantity = 'Enter a valid quantity (≥ 0).';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const data = {
      prod_name: prodName.trim(),
      prod_price: parseFloat(prodPrice),
      prod_quantity: parseInt(prodQuantity),
      prod_cat: prodCat,
    };

    let result;
    let submitError = null;

    if (isEdit) {
      const { data: updatedProduct, error: apiError } = await updateProduct(id, data);
      result = updatedProduct;
      submitError = apiError;
    } else {
      const { data: newProduct, error: apiError } = await createProduct(data);
      result = newProduct;
      submitError = apiError;
    }

    if (result) {
      Alert.alert('Success', isEdit ? 'Product updated!' : 'Product created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', submitError ?? 'Failed to save product. Please check if the backend is running.');
    }
  };

  const s = styles(colors, isDark);

  if (isEdit && loadingProduct) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: '#F5F7FA' }}>
      <SafeAreaView>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={s.container} keyboardShouldPersistTaps="handled">

            <View style={s.pageHeader}>
              <Text style={s.pageTitle}>{isEdit ? 'Edit Product' : 'New Product'}</Text>
              <Text style={s.pageSubtitle}>{isEdit ? 'Update product information' : 'Fill in the details below'}</Text>
            </View>


            <View style={s.card}>

              <View style={s.fieldGroup}>
                <Text style={s.label}>Product Name *</Text>
                <TextInput
                  style={[s.input, errors.prod_name && s.inputError]}
                  placeholder="IPhone 13 Pro"
                  placeholderTextColor={colors.icon}
                  value={prodName}
                  onChangeText={(t) => { setProdName(t); setErrors((e) => ({ ...e, prod_name: undefined })); }}
                />
                {errors.prod_name && <Text style={s.errorText}>{errors.prod_name}</Text>}
              </View>


              <View style={s.fieldGroup}>
                <Text style={s.label}>Price (GH₵) *</Text>
                <View style={[s.prefixInput, errors.prod_price && s.inputError]}>
                  <Text style={s.prefix}>₵</Text>
                  <TextInput
                    style={s.prefixTextInput}
                    placeholder="0.00"
                    placeholderTextColor={colors.icon}
                    value={prodPrice}
                    onChangeText={(t) => { setProdPrice(t); setErrors((e) => ({ ...e, prod_price: undefined })); }}
                    keyboardType="decimal-pad"
                  />
                </View>
                {errors.prod_price && <Text style={s.errorText}>{errors.prod_price}</Text>}
              </View>


              <View style={s.fieldGroup}>
                <Text style={s.label}>Quantity</Text>
                <TextInput
                  style={[s.input, errors.prod_quantity && s.inputError]}
                  placeholder="0"
                  placeholderTextColor={colors.icon}
                  value={prodQuantity}
                  onChangeText={(t) => { setProdQuantity(t); setErrors((e) => ({ ...e, prod_quantity: undefined })); }}
                  keyboardType="number-pad"
                />
                {errors.prod_quantity && <Text style={s.errorText}>{errors.prod_quantity}</Text>}
              </View>
            </View>


            <View style={s.section}>
              <Text style={s.sectionTitle}>Category</Text>
              <View style={s.catGrid}>
                {CATEGORIES.map((cat) => {
                  const active = prodCat === cat.value;
                  const catColor = CATEGORY_COLORS[cat.value];
                  return (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        s.catCard,
                        active && { borderColor: catColor, backgroundColor: catColor + '18' },
                      ]}
                      onPress={() => setProdCat(cat.value)}
                    >
                      <Text style={s.catCardIcon}>{cat.emoji}</Text>
                      <Text style={[s.catCardLabel, active && { color: catColor, fontWeight: '700' }]}>
                        {cat.label}
                      </Text>
                      {active && (
                        <View style={[s.catSelected, { backgroundColor: catColor }]}>
                          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={s.submitRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()} disabled={loading}>
                <Text style={[s.cancelBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.submitBtnText}>{isEdit ? 'Update Product' : 'Create Product'}</Text>
                }
              </TouchableOpacity>
            </View>


          </ScrollView>
        </KeyboardAvoidingView>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = (colors: typeof Colors.light, isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#0F1117' : '#F5F7FA',
      height: '100%',
    },

    pageHeader: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 16,
    },
    pageTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
    },

    pageSubtitle: {
      fontSize: 14,
      color: colors.icon,
      marginTop: 4
    },

    card: {
      marginHorizontal: 16, marginBottom: 20,
      backgroundColor: isDark ? '#1A1D27' : '#fff',
      borderRadius: 16, padding: 18,
      shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3,
    },

    fieldGroup: { marginBottom: 18 },

    label: { fontSize: 13, fontWeight: '600', color: colors.icon, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
    input: {
      borderWidth: 1.5, borderColor: isDark ? '#2A2D3A' : '#DDE3EA',
      borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
      fontSize: 15, color: colors.text, backgroundColor: isDark ? '#0F1117' : '#F8FAFC',
    },
    inputError: { borderColor: '#EF4444' },
    prefixInput: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1.5, borderColor: isDark ? '#2A2D3A' : '#DDE3EA',
      borderRadius: 12, paddingHorizontal: 14, backgroundColor: isDark ? '#0F1117' : '#F8FAFC',
    },
    prefix: { fontSize: 16, color: colors.icon, marginRight: 6 },
    prefixTextInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.text },
    errorText: { fontSize: 12, color: '#EF4444', marginTop: 5 },

    section: { paddingHorizontal: 16, marginBottom: 24 },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      textTransform: 'uppercase',
      color: '#6B7280',
      marginBottom: 20,
      textAlign: 'center',
      letterSpacing: 0.8
    },

    catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    catCard: {
      width: '30%', alignItems: 'center', paddingVertical: 35,
      backgroundColor: isDark ? '#1A1D27' : '#fff',
      borderRadius: 14, borderWidth: 2, borderColor: isDark ? '#2A2D3A' : '#E8ECF0',
      position: 'relative',
    },
    catCardIcon: { fontSize: 26, marginBottom: 6 },
    catCardLabel: { fontSize: 12, fontWeight: '500', color: colors.icon },
    catSelected: {
      position: 'absolute', top: 6, right: 6,
      width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    },

    submitRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 10,
    },
    cancelBtn: {
      flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
      backgroundColor: isDark ? '#1A1D27' : '#fff',
      borderWidth: 1.5, borderColor: isDark ? '#2A2D3A' : '#DDE3EA',
    },
    cancelBtnText: { fontWeight: '600', fontSize: 15 },
    submitBtn: { flex: 1, backgroundColor: '#04a6ecff', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  });
