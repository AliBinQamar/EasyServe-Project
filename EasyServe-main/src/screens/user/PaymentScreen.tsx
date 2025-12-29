import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { paymentService } from '../../services/paymentService';

export default function PaymentScreen({ route, navigation }: any) {
    const { booking, amount } = route.params;
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [loading, setLoading] = useState(false);

    const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
        { id: 'jazzcash', name: 'JazzCash', icon: '📱' },
        { id: 'easypaisa', name: 'Easypaisa', icon: '💰' },
        { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
    ];

    const handlePayment = async () => {
        setLoading(true);
        try {
            await paymentService.initiatePayment(booking._id || booking.id, selectedMethod);
            Alert.alert('Success', 'Payment successful!');
            navigation.navigate('MyBookings');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Payment failed';
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Complete Payment</Text>
            <Text style={styles.amount}>Rs. {amount}</Text>

            <Text style={styles.label}>Select Payment Method:</Text>

            {paymentMethods.map((method) => (
                <TouchableOpacity
                    key={method.id}
                    style={[
                        styles.methodCard,
                        selectedMethod === method.id && styles.methodCardSelected
                    ]}
                    onPress={() => setSelectedMethod(method.id)}
                >
                    <Text style={styles.methodIcon}>{method.icon}</Text>
                    <Text style={styles.methodName}>{method.name}</Text>
                    {selectedMethod === method.id && (
                        <Text style={styles.checkmark}>✓</Text>
                    )}
                </TouchableOpacity>
            ))}

            <TouchableOpacity
                style={styles.payButton}
                onPress={handlePayment}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.payButtonText}>Pay Rs. {amount}</Text>
                )}
            </TouchableOpacity>

            <Text style={styles.secureNote}>
                🔒 Your payment is secure and protected
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10,
    },
    amount: {
        fontSize: 36,
        fontWeight: '700',
        color: '#4CAF50',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    methodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#f0f0f0',
    },
    methodCardSelected: {
        borderColor: '#4CAF50',
        backgroundColor: '#f0fdf4',
    },
    methodIcon: {
        fontSize: 30,
        marginRight: 15,
    },
    methodName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    checkmark: {
        fontSize: 24,
        color: '#4CAF50',
    },
    payButton: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 30,
    },
    payButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    secureNote: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginTop: 20,
    },
});