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
  Modal,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCreateCustomer, useUpdateCustomer, useCustomer } from '@/hooks/useCustomer';
import { Colors } from '@/constants/theme';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface FormErrors {
  customer_name?: string;
  customer_phone?: string;
}


const ADDRESS_OPTIONS = [
  'Accra, Greater Accra',
  'Kumasi, Ashanti',
  'Tamale, Northern',
  'Takoradi, Western',
  'Cape Coast, Central',
  'Sunyani, Bono',
  'Ho, Volta',
  'Bolgatanga, Upper East',
  'Wa, Upper West',
  'Koforidua, Eastern',
  'Tema, Greater Accra',
  'Obuasi, Ashanti',
  'Techiman, Bono East',
  'Other',
];


const AVATAR_COLORS = ['#3B82F6','#EC4899','#8B5CF6','#F59E0B','#22C55E','#EF4444','#06B6D4','#F97316'];
function avatarColor(letter: string) {
  return AVATAR_COLORS[letter.charCodeAt(0) % AVATAR_COLORS.length];
}

export default function CreateCustomerScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [addressPickerVisible, setAddressPickerVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { createCustomer, loading: creating } = useCreateCustomer();
  const { updateCustomer, loading: updating } = useUpdateCustomer();
  const { customer, fetchCustomer, loading: loadingCustomer } = useCustomer();

  const loading = creating || updating;
  const avatarLetter = name.trim() ? name.trim().charAt(0).toUpperCase() : '?';
  const color = name.trim() ? avatarColor(avatarLetter) : '#04a6ecff';

  useEffect(() => {
    if (isEdit && id) fetchCustomer(id);
  }, [id]);

  useEffect(() => {
    if (customer && isEdit) {
      setName(customer.customer_name);
      setPhone(customer.customer_phone || '');
      const saved = customer.customer_address || '';
      if (ADDRESS_OPTIONS.includes(saved)) {
        setAddress(saved);
      } else if (saved) {
        setAddress('Other');
        setCustomAddress(saved);
      }
    }
  }, [customer]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!name.trim() || name.trim().length < 4)
      newErrors.customer_name = 'Name must be at least 4 characters.';
    if (phone && phone.trim().length < 10)
      newErrors.customer_phone = 'Phone number seems too short.';
    setErrors(newErrors);
    if (phone && phone.trim().length > 10)
      newErrors.customer_phone = 'Phone number seems too Long.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const effectiveAddress = address === 'Other' ? customAddress.trim() : address;

  const handleSubmit = async () => {
    if (!validate()) return;

    const data = {
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_address: effectiveAddress,
    };

    let result, submitError = null;

    if (isEdit && id) {
      const { data: d, error: e } = await updateCustomer(id, data);
      result = d; submitError = e;
    } else {
      const { data: d, error: e } = await createCustomer(data);
      result = d; submitError = e;
    }

    if (result) {
      Alert.alert('Success', isEdit ? 'Customer updated!' : 'Customer created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('Error', submitError ?? 'Failed to save customer.');
    }
  };

  const s = styles(colors, isDark);

  if (isEdit && loadingCustomer) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#04a6ecff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView style={s.container} keyboardShouldPersistTaps="handled">

            
            <View style={s.avatarSection}>
              <View style={s.avatarOuter}>
                <View style={[s.avatarInner, { backgroundColor: color + '22' }]}>
                  <Text style={[s.avatarLetter, { color }]}>{avatarLetter}</Text>
                </View>
              </View>
              {name.trim() !== '' && (
                <Text style={s.previewName}>{name}</Text>
              )}
              {!name.trim() && (
                <Text style={s.previewHint}>Your customer's avatar will appear here</Text>
              )}
            </View>

            
            <View style={s.card}>
             
              <View style={s.fieldGroup}>
                <Text style={s.label}>Full Name *</Text>
                <View style={[s.inputRow, errors.customer_name && s.inputError]}>
                  <Ionicons name="person-outline" size={18} color={colors.icon} style={s.inputIcon} />
                  <TextInput
                    style={s.inputText}
                    placeholder="Joel Webs"
                    placeholderTextColor={colors.icon}
                    value={name}
                    onChangeText={(t) => { setName(t); setErrors(e => ({ ...e, customer_name: undefined })); }}
                  />
                </View>
                {errors.customer_name && <Text style={s.errorText}>{errors.customer_name}</Text>}
              </View>

              
              <View style={s.fieldGroup}>
                <Text style={s.label}>Phone Number</Text>
                <View style={[s.inputRow, errors.customer_phone && s.inputError]}>
                  <Ionicons name="call-outline" size={18} color={colors.icon} style={s.inputIcon} />
                  <TextInput
                    style={s.inputText}
                    placeholder="0268116047"
                    placeholderTextColor={colors.icon}
                    value={phone}
                    onChangeText={(t) => { setPhone(t); setErrors(e => ({ ...e, customer_phone: undefined })); }}
                    keyboardType="phone-pad"
                  />
                </View>
                {errors.customer_phone && <Text style={s.errorText}>{errors.customer_phone}</Text>}
              </View>

              
              <View style={s.fieldGroup}>
                <Text style={s.label}>Address / Location</Text>
                <TouchableOpacity
                  style={s.inputRow}
                  onPress={() => setAddressPickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="location-outline" size={18} color={colors.icon} style={s.inputIcon} />
                  <Text style={[s.inputText, { color: address ? colors.text : colors.icon, paddingVertical: 14 }]}>
                    {address || 'Select location...'}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={18} color={colors.icon} />
                </TouchableOpacity>

                
                {address === 'Other' && (
                  <TextInput
                    style={[s.inputRow, { marginTop: 8, paddingHorizontal: 14, paddingVertical: 12 }]}
                    placeholder="Type full address..."
                    placeholderTextColor={colors.icon}
                    value={customAddress}
                    onChangeText={setCustomAddress}
                    multiline
                  />
                )}
              </View>
            </View>

            
            <View style={s.submitRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()} disabled={loading}>
                <Text style={[s.cancelBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.submitBtnText}>{isEdit ? 'Update' : 'Create Customer'}</Text>
                }
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        
        <Modal
          visible={addressPickerVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setAddressPickerVisible(false)}
        >
          <TouchableOpacity
            style={s.modalOverlay}
            activeOpacity={1}
            onPress={() => setAddressPickerVisible(false)}
          >
            <View style={[s.pickerSheet, { backgroundColor: isDark ? '#1A1D27' : '#fff' }]}>
              <View style={s.pickerHeader}>
                <Text style={[s.pickerTitle, { color: colors.text }]}>Select Location</Text>
                <TouchableOpacity onPress={() => setAddressPickerVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={ADDRESS_OPTIONS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      s.pickerItem,
                      address === item && { backgroundColor: '#04a6ec15' },
                    ]}
                    onPress={() => {
                      setAddress(item);
                      setAddressPickerVisible(false);
                    }}
                  >
                    <Ionicons
                      name={address === item ? 'location' : 'location-outline'}
                      size={18}
                      color={address === item ? '#04a6ecff' : colors.icon}
                      style={{ marginRight: 12 }}
                    />
                    <Text style={[s.pickerItemText, { color: address === item ? '#04a6ecff' : colors.text }]}>
                      {item}
                    </Text>
                    {address === item && (
                      <Ionicons name="checkmark" size={18} color="#04a6ecff" style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: isDark ? '#0F1117' : '#F0F4F8' },
    container: { flex: 1 },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#0F1117' : '#F0F4F8',
    },

   
    avatarSection: {
      alignItems: 'center',
      paddingVertical: 28,
      marginBottom: 170,
      
    },
    avatarOuter: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.10,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 10,
      elevation: 5,
      marginBottom: 10,
    },
    avatarInner: {
      width: 86,
      height: 86,
      borderRadius: 43,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarLetter: { fontSize: 38, fontWeight: '800' },
    previewName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'capitalize',
    },
    previewHint: { fontSize: 13, color: colors.icon },

    
    card: {
      marginHorizontal: 10,
      marginBottom: 30,
      backgroundColor: isDark ? '#1A1D27' : '#fff',
      borderRadius: 18,
      padding: 18,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 3,
    },
    fieldGroup: { marginBottom: 16 },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.icon,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.7,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#0F1117' : '#F8FAFC',
      borderWidth: 1.5,
      borderColor: isDark ? '#2A2D3A' : '#DDE3EA',
      borderRadius: 12,
      paddingHorizontal: 12,
    },
    inputIcon: { marginRight: 10 },
    inputText: {
      flex: 1,
      paddingVertical: 13,
      fontSize: 15,
      color: colors.text,
      textTransform: 'capitalize'
    },
    inputError: { borderColor: '#EF4444' },
    errorText: { fontSize: 12, color: '#EF4444', marginTop: 5 },

    submitRow: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      gap: 10,
      marginBottom: 10,
    },
    cancelBtn: {
      flex: 1, borderRadius: 8, paddingVertical: 15, alignItems: 'center',
      backgroundColor: isDark ? '#1A1D27' : '#fff',
      borderWidth: 1.5, borderColor: isDark ? '#2A2D3A' : '#DDE3EA',
    },
    cancelBtnText: { fontWeight: '600', fontSize: 15 },
    submitBtn: {
      flex: 1, backgroundColor: '#04a6ecff', borderRadius: 8, paddingVertical: 15, alignItems: 'center',
    },
    submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

    // Address Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: '#00000055',
      justifyContent: 'flex-end',
    },
    pickerSheet: {
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      maxHeight: '75%',
      paddingBottom: 30,
    },
    pickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2A2D3A' : '#F1F5F9',
    },
    pickerTitle: { fontSize: 17, fontWeight: '700' },
    pickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2A2D3A' : '#F8FAFC',
    },
    pickerItemText: { fontSize: 15 },
  });
