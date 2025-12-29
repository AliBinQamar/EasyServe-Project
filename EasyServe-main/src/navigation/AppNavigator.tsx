import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Auth
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import SplashScreen from "../screens/SplashScreen";

// User
import HomeScreen from "../screens/user/HomeScreen";
import ServiceRequestScreen from "../screens/user/ServiceRequestScreen";
import MyRequestsScreen from "../screens/user/MyRequestsScreen";
import MyBookingsScreen from "../screens/user/MyBookingsScreen";
import ProviderListScreen from "../screens/user/ProviderListScreen";
import ProviderDetailsScreen from "../screens/user/ProviderDetailsScreen";
import RequestDetailsScreen from "../screens/user/RequestDetailsScreen";
import BookingDetailsScreen from '../screens/user/BookingDetailsScreen';
// Provider
import ProviderHomeScreen from "../screens/Provider/ProviderHomeScreen";
import AvailableRequestsScreen from "../screens/Provider/AvailableRequestScreen";
import MyBidsScreen from "../screens/Provider/MyBidsScreen";
import WalletScreen from "../screens/Provider/WalletScreen";
import ProfileScreen from "../screens/Provider/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
      initialRouteName="Splash"
    >
      {/* Auth */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

      {/* User */}
      <Stack.Screen name="Home" component={HomeScreen} />

      <Stack.Screen name="ProviderList" component={ProviderListScreen} />
      <Stack.Screen name="ProviderDetails" component={ProviderDetailsScreen} />
      <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} />
      <Stack.Screen name="MyRequests" component={MyRequestsScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
 <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      {/* Provider */}
      <Stack.Screen name="ProviderHome" component={ProviderHomeScreen} />
      <Stack.Screen name="AvailableRequests" component={AvailableRequestsScreen} />
      <Stack.Screen name="MyBids" component={MyBidsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}