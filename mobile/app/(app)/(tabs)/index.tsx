import { useAuth, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function Page() {
  const { user } = useUser();
  const { isSignedIn } = useAuth();

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <View style={styles.headerTab}>
          <View style={styles.headerStyle}>
            <Link href={'/(app)/(tabs)/more'}><Ionicons name="menu-outline" size={35} color="#04a6ecff" /></Link>
            <Text style={styles.header}>Dashboard</Text>
          </View>
          <Link href={'/(app)/notif'}>
            <Ionicons name="notifications-outline" size={30} color='#363636ff' />
          </Link>
        </View>
        <View style={styles.container}>
          {!isSignedIn && (
            <>
              <Link href="/(auth)/sign-in">
                <Text style={styles.link}>Sign in</Text>
              </Link>
              <Link href="/(auth)/sign-up">
                <Text style={styles.link}>Sign up</Text>
              </Link>
            </>
          )}
          {isSignedIn && (
            <>
              <View style={styles.mainChart}>
                <View>
                  <Text style={styles.mainTitle}>Total Orders</Text>
                  <Text style={styles.title}>267</Text>
                  <Text style={styles.subtitle}>+12.5% from last Month</Text>
                </View>
                <View>
                  <Ionicons color='#edededff' name="stats-chart-outline" size={50} />
                </View>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>

    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 10,
  },

  mainChart: {
    height: 120,
    padding: 10,
    backgroundColor: '#04a6ecff',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#027cb9ff',
    shadowOffset: { width: 0.5, height: 0.5 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
  },

  title: {
    marginTop: 5,
    fontSize: 30,
    fontWeight: 'condensedBold',
    color: '#edededff'
  },
  mainTitle: {
    marginTop: 5,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f3fa24ff',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#e0dcdcff',
  },
  link: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#0f5ae6ff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    fontSize: 25,
    fontWeight: 700,
    fontFamily: 'system',
  },
  headerTab: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight:10,
  },
  headerStyle: {
    margin: 10,
    gap: 5,
    flexDirection: "row",
    alignItems: 'center',
  },


});
