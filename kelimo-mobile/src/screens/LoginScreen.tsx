import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation, setIsLoggedIn }: any) {
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = useMemo(() => {
    const base = process.env.EXPO_PUBLIC_API_URL;
    const returnUrl = Linking.createURL('google-auth'); // Expo Go -> exp.direct döner
    return `${base}/auth/google/mobile?returnUrl=${encodeURIComponent(returnUrl)}`;
  }, []);


  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('google-auth'); 

      const result = await WebBrowser.openAuthSessionAsync(BACKEND_URL, redirectUrl);

      if (result.type !== 'success' || !result.url) {
        return;
      }

      const parsed = Linking.parse(result.url);
      const token = (parsed.queryParams?.token as string) || '';

      if (!token) {
        Alert.alert('Hata', 'Token gelmedi.');
        return;
      }

      await AsyncStorage.setItem('token', token);
      setIsLoggedIn?.(true);

      // Senin navigator’da route ismi neyse ona göre değiştir
      navigation?.replace?.('Dashboard');
    } catch (e) {
      Alert.alert('Hata', 'Bağlantı hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>K</Text>
      </View>

      <Text style={styles.title}>KelimoApp</Text>
      <Text style={styles.subtitle}>En eğlenceli dil öğrenme deneyimi.</Text>

      <View style={{ height: 40 }} />

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <View style={styles.googleButtonContent}>
            <AntDesign name="google" size={24} color="black" />
            <Text style={styles.googleButtonText}>Google ile Devam Et</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Debug için istersen aç */}
      {/* <Text style={{ color: '#94a3b8', marginTop: 16 }}>{BACKEND_URL}</Text> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logoContainer: { width: 80, height: 80, backgroundColor: '#8b5cf6', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20, transform: [{ rotate: '-10deg' }] },
  logoText: { fontSize: 40, fontWeight: 'bold', color: 'white' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  googleButton: { backgroundColor: 'white', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  googleButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  googleButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },
});
