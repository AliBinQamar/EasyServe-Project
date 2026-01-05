# EasyServe - On-Demand Service Platform

EasyServe is a mobile application that connects users with local service providers in real-time. The platform features a bidding system that allows users to post service requests and receive competitive bids from nearby providers.

## 🎯 Overview

EasyServe solves the common problem of finding reliable local service providers by offering:

- **Instant Connection**: Users can quickly connect with nearby service providers
- **Price Transparency**: Competitive bidding system ensures fair pricing
- **Real-time Updates**: Get instant notifications when providers respond to requests

## ✨ Features

### Current Features

- **User Registration & Authentication**: Separate role-based authentication for users and service providers
- **Service Request Creation**: Users can post detailed service requests with location and budget
- **Bidding System**: Service providers can submit competitive bids on service requests
- **Location-Based Matching**: GPS-powered matching of users with nearby providers
- **Dashboard**: Separate dashboards for users and service providers
- **Real-time Notifications**: Instant updates on request status and new bids
- **Profile Management**: Users and providers can manage their profiles and preferences


## 🛠 Technology Stack

### Frontend
- React Native (Expo)
- TypeScript

### Backend
- Javascript
- Node.js
- Express.js
- REST API

### Database
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: ODM (Object Data Modeling) library

### Additional Tools
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing
- **Geolocation APIs**: Location-based services
- **Push Notifications**: Real-time alert system

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)
- Expo CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/easyserve.git
   cd EasyServe-Project
   ```

2. **Install backend dependencies**
   ```bash
   cd EasyServebackend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../EasyServe-main
   npm install
   ```

4. **Configure environment variables**

   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/easyserve
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

6. **Run the backend server**
   ```bash
   cd EasyServebackend
   node server.js
   ```

7. **Run the mobile app**
   ```bash
   cd EasyServe-main
   npx expo start
   ```

## 📱 Usage

### For Users

1. **Sign Up**: Create an account as a user
2. **Post Request**: Submit a service request with details and budget
3. **Review Bids**: View bids from service providers
4. **Select Provider**: Choose the best provider based on price and profile
5. **Get Service**: Connect with the provider and get your service completed

### For Service Providers

1. **Sign Up**: Register as a service provider
2. **Browse Requests**: View service requests in your area
3. **Submit Bids**: Offer your services with competitive pricing
4. **Complete Service**: Deliver the service once selected by the user
5. **Wallet**: Provider can see their wallet make transactions

## 📁 Project Structure

```
easyserve/
├── EasyServebackend/
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── EasyServe-main/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── utils/
│   ├── App.js
│   ├── app.json
│   └── package.json
│
└── README.md
```

## 🔮 Future Enhancements

- **Payment Integration**: Stripe/PayPal integration for secure online payments
- **Chat System**: Real-time messaging between users and providers
- **Admin Dashboard**: Platform analytics and user management
- **AI Recommendations**: Machine learning-based provider matching
- **Advanced Filters**: More sophisticated search and filtering options
- **Service Categories**: Organized categorization of services
- **Subscription Plans**: Premium features for providers






---

**Note**: This project is currently in active development. Features and documentation may change frequently.
