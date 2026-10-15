import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useSignIn } from '@clerk/clerk-expo'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import { Image, Pressable, StyleSheet, TextInput, View, Text, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { useOAuth } from '@clerk/clerk-expo'

WebBrowser.maybeCompleteAuthSession()


export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  
  const passwordRef = React.useRef<TextInput>(null)
  
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })

  const onGooglePress = React.useCallback(async () => {
    try {
      setLoading(true)
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/(app)/(tabs)', { scheme: 'ordergo' }),
      })

      if (createdSessionId) {
        await setOAuthActive!({ session: createdSessionId })
        router.replace('/(app)/(tabs)' as Href)
      }
    } catch (err: any) {
      console.error('OAuth error', err)
      setError(err?.errors?.[0]?.message ?? 'An error occurred during Google sign in.')
    } finally {
      setLoading(false)
    }
  }, [isLoaded])

  

  const handleSubmit = async () => {
    if (!isLoaded) return

    setLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(app)/(tabs)' as Href)
      } else {
        // Handle additional steps (e.g. MFA)
        console.warn('Sign-in not complete:', result.status)
        setError('Sign-in could not be completed. Please try again.')
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        'An error occurred during sign in.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          <View style={styles.logoRootContainer}>
            <Image
              source={require('@/assets/images/OrderGoLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.appName} >
            <Text style={styles.orderName}>Order</Text>
            <Text style={styles.goName}>go</Text>
          </View>

          <View style={styles.header}>
            <ThemedText style={styles.subtitle}>
              Welcome Back. Sign in to your account to continue.
            </ThemedText>
          </View>

          <View style={styles.form}>
            <ThemedText style={styles.label}>Email Address</ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="username@example.com"
                placeholderTextColor="#999"
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <ThemedText style={styles.label}>Password</ThemedText>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                value={password}
                placeholder="Enter password"
                placeholderTextColor="#999"
                secureTextEntry={true}
                onChangeText={setPassword}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                (!emailAddress || !password || loading) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSubmit}
              disabled={!emailAddress || !password || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Sign In</ThemedText>
              )}
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <ThemedText style={styles.dividerText}>or</ThemedText>
              <View style={styles.divider} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={onGooglePress}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={20} color="#000" style={styles.googleIcon} />
              <ThemedText style={styles.googleButtonText}>Continue with Google</ThemedText>
            </Pressable>
          </View>

          <View style={styles.linkContainer}>
            <ThemedText>Don't have an account? </ThemedText>
            <Link href="/sign-up">
              <ThemedText style={styles.link} suppressHighlighting ={false} type="link">Sign up</ThemedText>
            </Link>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  )

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoRootContainer: {
    alignItems: 'center',
    marginTop:-50,
  },
  logo: {
    marginTop: 50,
    marginLeft:-30,
    width: 200,
    height: 200,
    marginBottom: -40,
  },
  appName: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  orderName: {
    color: '#000',
    fontSize: 40,
    fontWeight: '800',
  },
  goName: {
    color: '#0f5ae6ff',
    fontSize: 40,
    fontWeight: '800',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: -8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: -4,
    textAlign: 'center'
  },
  button: {
    backgroundColor:'#0f5ae6ff' ,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 1,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.9,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e1e1',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 5,
  },
  googleIcon: {
    marginRight: 4,
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },

  linkContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 4,
  },
  link:{
    color:'#0f5ae6ff',
  }
})