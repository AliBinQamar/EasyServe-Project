import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BookingSuccessScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>✅</Text>
                <Text style={styles.title}>Booking Successful!</Text>
                <Text style={styles.message}>
                    Your booking has been confirmed. You will receive a notification once the provider accepts your request.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('MyBookings')}
                >
                    <Text style={styles.buttonText}>View My Bookings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.secondaryButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        alignItems: 'center',
        maxWidth: 400,
    },
    icon: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        width: '100%',
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
});