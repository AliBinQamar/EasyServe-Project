import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { providerService } from '../../services/providerService';
import { Provider } from '../../types';

interface Props {
  route: { params?: { providerId?: string } };
  navigation: any;
}

export default function ProviderDetailsScreen({ route, navigation }: Props) {
  const providerId = route.params?.providerId; // only declare once
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) {
      console.error('Provider ID is missing!');
      setLoading(false);
      return;
    }
    const loadProvider = async () => {
      try {
        const data = await providerService.getById(providerId);
        setProvider(data);
      } catch (error) {
        console.error('Error fetching provider:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProvider();
  }, [providerId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>Provider not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Text style={styles.imagePlaceholder}>👤</Text>
        </View>

        <Text style={styles.name}>{provider.name}</Text>
        <Text style={styles.category}>{provider.categoryName || 'Service Provider'}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Price</Text>
            <Text style={styles.infoValue}>Rs. {provider.price}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Rating</Text>
            <Text style={styles.infoValue}>⭐ {provider.rating}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Area</Text>
            <Text style={styles.infoValue}>{provider.area}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{provider.description || 'No description available.'}</Text>
        </View>

        {provider.reviews?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {provider.reviews.map((review, index) => (
              <View key={index} style={styles.review}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{review.userName}</Text>
                  <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('Booking', { provider })}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  errorText: { fontSize: 16, color: '#666', marginBottom: 20 },
  backBtn: { paddingHorizontal: 30, paddingVertical: 12, backgroundColor: '#4CAF50', borderRadius: 10 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backButton: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  backText: { fontSize: 16, color: '#4CAF50' },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  imageContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginVertical: 20 },
  imagePlaceholder: { fontSize: 60 },
  name: { fontSize: 24, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 8 },
  category: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
  infoCard: { flex: 1, backgroundColor: '#f9f9f9', borderRadius: 12, padding: 15, alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#333' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
  description: { fontSize: 15, color: '#666', lineHeight: 24 },
  review: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 15, marginBottom: 12 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewName: { fontSize: 14, fontWeight: '600', color: '#333' },
  reviewRating: { fontSize: 14, color: '#FF9800' },
  reviewComment: { fontSize: 14, color: '#666', lineHeight: 20 },
  bookButton: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#4CAF50', padding: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
