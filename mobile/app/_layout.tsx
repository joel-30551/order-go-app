import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

import { useColorScheme } from '@/hooks/use-color-scheme';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env.local'
  );
}

function RootStack() {
  const { isSignedIn } = useAuth();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={!!isSignedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <RootStack />
      </ClerkProvider>
    </ThemeProvider>
  );
}
