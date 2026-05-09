import { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { API } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const insets = useSafeAreaInsets(); // Handle notch and bottom bar
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      // Securely store user session details
      await AsyncStorage.setItem("name", res.data.name);
      await AsyncStorage.setItem("role", res.data.role);
      await AsyncStorage.setItem("token", res.data.token);

      console.log("Stored Token:", res.data.token);
      Alert.alert("Success", "Welcome back!");

      // Role-based routing
      if (res.data.role === "cook") {
        router.push("/cook-home" as any);
      } else {
        router.push("/consumer-home" as any);
      }
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Login failed");
    }
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: '#fff' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent, 
            { 
              paddingTop: insets.top + 20, 
              paddingBottom: insets.bottom + 20 
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to continue with FoodCompanion
            </Text>
          </View>

          <View style={styles.form}>
            <CustomInput
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CustomInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry // The eye icon will now show up here automatically
            />

            

            <View style={styles.buttonContainer}>
              <CustomButton title="Login" onPress={handleLogin} />
            </View>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.registerText}>
                Don't have an account?{" "}
                <Text style={styles.registerBold}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 20,
  },
  forgotText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: 10,
  },
  registerLink: {
    marginTop: 25,
    alignItems: "center",
  },
  registerText: {
    fontSize: 15,
    color: "#666",
  },
  registerBold: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
});