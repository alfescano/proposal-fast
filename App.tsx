import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";
import { useAuthStore } from "./src/store/authStore";
import { useOfflineStore } from "./src/store/offlineStore";

// Auth Screens
import LoginScreen from "./src/screens/auth/LoginScreen";
import SignUpScreen from "./src/screens/auth/SignUpScreen";

// Main Screens
import DashboardScreen from "./src/screens/main/DashboardScreen";
import ContractGeneratorScreen from "./src/screens/main/ContractGeneratorScreen";
import ProposalsListScreen from "./src/screens/main/ProposalsListScreen";
import PaymentsScreen from "./src/screens/main/PaymentsScreen";
import ProfileScreen from "./src/screens/main/ProfileScreen";

// Detail Screens
import ProposalDetailScreen from "./src/screens/details/ProposalDetailScreen";
import ContractDetailScreen from "./src/screens/details/ContractDetailScreen";
import PaymentDetailScreen from "./src/screens/details/PaymentDetailScreen";

// Icons
import { Home, FileText, Send, CreditCard, User } from "lucide-react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarIcon: ({ color, size }) => {
          let icon;

          if (route.name === "Dashboard") {
            icon = <Home color={color} size={size} />;
          } else if (route.name === "Contracts") {
            icon = <FileText color={color} size={size} />;
          } else if (route.name === "Proposals") {
            icon = <Send color={color} size={size} />;
          } else if (route.name === "Payments") {
            icon = <CreditCard color={color} size={size} />;
          } else if (route.name === "Profile") {
            icon = <User color={color} size={size} />;
          }

          return icon;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          headerTitleStyle: { fontSize: 18, fontWeight: "600" },
        }}
      />
      <Tab.Screen
        name="Contracts"
        component={ContractGeneratorScreen}
        options={{
          title: "Generate Contract",
          headerTitleStyle: { fontSize: 18, fontWeight: "600" },
        }}
      />
      <Tab.Screen
        name="Proposals"
        component={ProposalsListScreen}
        options={{
          title: "Proposals",
          headerTitleStyle: { fontSize: 18, fontWeight: "600" },
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          title: "Payments",
          headerTitleStyle: { fontSize: 18, fontWeight: "600" },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          headerTitleStyle: { fontSize: 18, fontWeight: "600" },
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator (with modal screens)
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Group>

      {/* Detail Screens as Stack */}
      <Stack.Group
        screenOptions={{
          presentation: "card",
          headerTitleStyle: { fontSize: 18, fontWeight: "600" },
        }}
      >
        <Stack.Screen
          name="ProposalDetail"
          component={ProposalDetailScreen}
          options={{ title: "Proposal Details" }}
        />
        <Stack.Screen
          name="ContractDetail"
          component={ContractDetailScreen}
          options={{ title: "Contract Details" }}
        />
        <Stack.Screen
          name="PaymentDetail"
          component={PaymentDetailScreen}
          options={{ title: "Payment Details" }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

// Root App Component
const App = () => {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const { initializeOfflineStore } = useOfflineStore();

  useEffect(() => {
    // Initialize auth and offline storage
    const initialize = async () => {
      await initializeAuth();
      await initializeOfflineStore();
    };
    initialize();

    // Setup notifications
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification received:", response);
        // Handle notification navigation
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main" component={MainStack} />
          ) : (
            <Stack.Screen name="Auth" component={AuthStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
