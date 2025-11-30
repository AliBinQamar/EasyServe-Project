import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";

// User Screens
import BookingScreen from "../screens/user/BookingScreen";
import BookingSuccessScreen from "../screens/user/BookingSuccessScreen";
import HomeScreen from "../screens/user/HomeScreen";
import MyBookingsScreen from "../screens/user/MyBookingsScreen";
import ProviderDetailsScreen from "../screens/user/ProviderDetailsScreen";
import ProviderListScreen from "../screens/user/ProviderListScreen";

// Admin Screens
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminLoginScreen from "../screens/admin/AdminLoginScreen";
import ManageCategoriesScreen from "../screens/admin/ManageCategoriesScreen";
import ManageProvidersScreen from "../screens/admin/ManageProvidersScreen";
import ViewBookingScreen from "../screens/admin/ViewBookingScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right"
            }}
            initialRouteName="Login"
        >
            {/* AUTH SCREENS */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />

            {/* USER SCREENS */}
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ProviderList" component={ProviderListScreen} />
            <Stack.Screen name="ProviderDetails" component={ProviderDetailsScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} />

            {/* ADMIN SCREENS */}
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} />
            <Stack.Screen name="ManageProviders" component={ManageProvidersScreen} />
            <Stack.Screen name="ViewBookings" component={ViewBookingScreen} />
        </Stack.Navigator>
    );
}