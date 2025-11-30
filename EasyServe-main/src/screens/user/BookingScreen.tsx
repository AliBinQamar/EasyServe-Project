import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../config/firebase';
import { bookingService } from '../../services/bookingService';

// Conditional import for DateTimePicker (only on mobile)
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
}

export default function BookingScreen({ route, navigation }: any) {
    const { provider } = route.params;
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [note, setNote] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    // For web: use text inputs
    const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
    const [timeInput, setTimeInput] = useState('09:00');

    const handleBooking = async () => {
        if (!auth.currentUser) {
            Alert.alert('Error', 'Please login first');
            return;
        }

        setLoading(true);
        try {
            const booking = {
                userId: auth.currentUser.uid,
                userName: auth.currentUser.email || 'User',
                providerId: provider.id,
                providerName: provider.name,
                date: Platform.OS === 'web' ? dateInput : date.toISOString().split('T')[0],
                time: Platform.OS === 'web' ? timeInput : time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                note,
                status: 'pending' as const,
                createdAt: new Date(),
            };

            await bookingService.create(booking);
            navigation.navigate('BookingSuccess');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Book Service</Text>
            <Text style={styles.providerName}>{provider.name}</Text>

            <View style={styles.form}>
                <Text style={styles.label}>Select Date</Text>

                {Platform.OS === 'web' ? (
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={dateInput}
                        onChangeText={setDateInput}
                    />
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateText}>{date.toDateString()}</Text>
                        </TouchableOpacity>

                        {showDatePicker && DateTimePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={(event: any, selectedDate: any) => {
                                    setShowDatePicker(Platform.OS === 'ios');
                                    if (selectedDate) setDate(selectedDate);
                                }}
                                minimumDate={new Date()}
                            />
                        )}
                    </>
                )}

                <Text style={styles.label}>Select Time</Text>

                {Platform.OS === 'web' ? (
                    <TextInput
                        style={styles.input}
                        placeholder="HH:MM (e.g., 09:00)"
                        value={timeInput}
                        onChangeText={setTimeInput}
                    />
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={styles.dateText}>
                                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>

                        {showTimePicker && DateTimePicker && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display="default"
                                onChange={(event: any, selectedTime: any) => {
                                    setShowTimePicker(Platform.OS === 'ios');
                                    if (selectedTime) setTime(selectedTime);
                                }}
                            />
                        )}
                    </>
                )}

                <Text style={styles.label}>Note (Optional)</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Add any special requirements..."
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={4}
                />

                <View style={styles.summary}>
                    <Text style={styles.summaryTitle}>Booking Summary</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service:</Text>
                        <Text style={styles.summaryValue}>{provider.name}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Price:</Text>
                        <Text style={styles.summaryValue}>Rs. {provider.price}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Date:</Text>
                        <Text style={styles.summaryValue}>
                            {Platform.OS === 'web' ? dateInput : date.toDateString()}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Time:</Text>
                        <Text style={styles.summaryValue}>
                            {Platform.OS === 'web' ? timeInput : time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={handleBooking}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.bookButtonText}>Confirm Booking</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    backText: {
        fontSize: 16,
        color: '#4CAF50',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        paddingHorizontal: 20,
        color: '#333',
        marginBottom: 5,
    },
    providerName: {
        fontSize: 16,
        color: '#666',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 15,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        backgroundColor: '#f9f9f9',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 14,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    summary: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
        color: '#333',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    bookButton: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});