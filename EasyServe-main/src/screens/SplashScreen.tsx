import React, { useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

const TAG = 'SplashScreen';
const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        const user = await authService.getCurrentUser();

        logger.info(TAG, `Auth check: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);

        if (isAuthenticated && user) {
          if (user.role === 'provider') {
            navigation.replace('ProviderHome');
          } else {
            navigation.replace('Home');
          }
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        logger.error(TAG, 'Auth check failed', error);
        navigation.replace('Login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🛠️</Text>
        </View>
        <Text style={styles.appName}>EasyServe</Text>
        <Text style={styles.tagline}>Find. Bid. Get it Done.</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>Your Service Marketplace</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center' },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  icon: { fontSize: 60 },
  appName: { fontSize: 48, fontWeight: '800', color: '#fff', marginBottom: 10, letterSpacing: 1 },
  tagline: { fontSize: 18, color: 'rgba(255,255,255,0.9)', fontWeight: '400', letterSpacing: 2 },
  footer: { position: 'absolute', bottom: 50 },
  footerText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
});