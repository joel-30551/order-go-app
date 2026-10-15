import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCustomer, useDeleteCustomer } from '@/hooks/useCustomer';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

/** Convert local Ghana numbers (0XXXXXXXXX) to E.164 without the +. */
function toE164(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (/^0\d{9}$/.test(digits)) return '233' + digits.slice(1);
  return digits;
}

function InfoRow({ label, value, isDark, colors, icon, onPress }: { label: string; value: string; isDark: boolean; colors: typeof Colors.light; icon?: keyof typeof Ionicons.glyphMap; onPress?: () => void }) {
  const content = (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 14, paddingHorizontal: 18,
      backgroundColor: isDark ? '#1A1D27' : '#fff',
      borderRadius: 12, marginBottom: 8,
    }}>
      <Text style={{ fontSize: 13, color: colors.icon, fontWeight: '500' }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
        <Text style={{ fontSize: 15, color: colors.text, fontWeight: '600', textAlign: 'right', marginLeft: 12, marginRight: icon ? 8 : 0 }}>
          {value}
        </Text>
        {icon && <Ionicons name={icon} size={18} color="#04a6ecff" />}
      </View>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const { customer, loading, error, fetchCustomer } = useCustomer();
  const { deleteCustomer, loading: deleting } = useDeleteCustomer();

  useEffect(() => {
    if (id) fetchCustomer(id);
  }, [id]);

  const handleDelete = () => {
    Alert.alert('Delete Customer', `Are you sure you want to delete "${customer?.customer_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { success, error: delError } = await deleteCustomer(id!);
          if (success) {
            router.replace('/(app)/(tabs)/customer');
          } else {
            Alert.alert('Error', delError ?? 'Failed to delete customer.');
          }
        },
      },
    ]);
  };

  const handleCall = () => {
    if (!customer?.customer_phone) return Alert.alert('No phone', 'No phone number saved for this customer.');
    Linking.openURL(`tel:${customer.customer_phone.replace(/[^\d+]/g, '')}`);
  };

  const handleWhatsApp = () => {
    if (!customer?.customer_phone) return Alert.alert('No phone', 'No phone number saved for this customer.');
    Linking.openURL(`https://wa.me/${toE164(customer.customer_phone)}`).catch(() =>
      Alert.alert('Error', 'Could not open WhatsApp.')
    );
  };

  const s = styles(colors, isDark);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  if (error || !customer) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#EF4444', fontSize: 16 }}>{error ?? 'Customer not found.'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, padding: 12 }}>
          <Text style={{ color: colors.tint, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const createdDate = new Date(customer.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const catColor = '#04a6ec';

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[s.hero, { backgroundColor: catColor + '18' }]}>
        <View style={[s.heroIcon, { backgroundColor: catColor + '33' }]}>
          <Text style={s.heroEmoji}>{customer.customer_name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.heroName}>{customer.customer_name}</Text>
        <View style={[s.catChip, { backgroundColor: catColor + '22', borderColor: catColor + '55' }]}>
          <Text style={[s.catChipText, { color: catColor }]}>Customer</Text>
        </View>
      </View>

      <View style={s.actionRow}>
        <TouchableOpacity style={[s.actionBtn, !customer.customer_phone && s.actionBtnDisabled]} onPress={handleCall}>
          <View style={[s.actionIconBg, { backgroundColor: '#22C55E22' }]}>
            <Ionicons name="call" size={22} color={customer.customer_phone ? '#22C55E' : colors.icon} />
          </View>
          <Text style={[s.actionLabel, !customer.customer_phone && { color: colors.icon }]}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.actionBtn, !customer.customer_phone && s.actionBtnDisabled]} onPress={handleWhatsApp}>
          <View style={[s.actionIconBg, { backgroundColor: '#25D36622' }]}>
            <Ionicons name="logo-whatsapp" size={22} color={customer.customer_phone ? '#25D366' : colors.icon} />
          </View>
          <Text style={[s.actionLabel, !customer.customer_phone && { color: colors.icon }]}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => router.push({ pathname: '/(app)/create_cust', params: { id: customer.customer_id } })}
        >
          <View style={[s.actionIconBg, { backgroundColor: '#04a6ec22' }]}>
            <Ionicons name="create-outline" size={22} color="#04a6ecff" />
          </View>
          <Text style={s.actionLabel}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Details</Text>
        <InfoRow 
          label="Phone" 
          value={customer.customer_phone || 'Not provided'} 
          isDark={isDark} 
          colors={colors} 
          icon={customer.customer_phone ? 'call-outline' : undefined} 
          onPress={customer.customer_phone ? handleCall : undefined} 
        />
        {!!customer.customer_phone && (
          <InfoRow 
            label="WhatsApp" 
            value={customer.customer_phone} 
            isDark={isDark} 
            colors={colors} 
            icon="logo-whatsapp" 
            onPress={handleWhatsApp} 
          />
        )}
        <InfoRow label="Address" value={customer.customer_address || 'Not provided'} isDark={isDark} colors={colors} />
        <InfoRow label="Added" value={createdDate} isDark={isDark} colors={colors} />
      </View>

      <View style={s.actions}>
        <TouchableOpacity
          style={s.editBtn}
          onPress={() => router.push({ pathname: '/(app)/create_cust', params: { id: customer.customer_id } })}
        >
          <Text style={s.editBtnText}>Edit Customer</Text>
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
    heroEmoji: { fontSize: 40, fontWeight: 'bold', color: '#04a6ec' },
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
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 24,
      marginTop: 20,
    },
    actionBtn: { alignItems: 'center', flex: 1 },
    actionBtnDisabled: { opacity: 0.45 },
    actionIconBg: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
    },
    actionLabel: { fontSize: 12, fontWeight: '600', color: colors.text },
    section: { paddingHorizontal: 16, marginBottom: 16, marginTop: 24 },
    sectionTitle: { fontSize: 14, textAlign: 'center', fontWeight: '700', color: colors.icon, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
    actions: { paddingHorizontal: 20, gap: 10 },
    editBtn: { backgroundColor: '#04a6ecff', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    editBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    deleteActionBtn: { backgroundColor: '#EF4444', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
    deleteActionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  });
