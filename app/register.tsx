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

export default function RegisterScreen() {
  const insets = useSafeAreaInsets(); // Hook for Safe Area
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("consumer");

  const handleRegister = async () => {
    try {
      await API.post("/auth/register", {
        name,
        email,
        phone,
        password,
        role,
      });

      Alert.alert("Success", "Registered Successfully");
      router.push("/login");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Registration failed"
      );
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join FoodCompanion today</Text>
          </View>

          <View style={styles.form}>
            <CustomInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />

            <CustomInput
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CustomInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <CustomInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.roleLabel}>I want to:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "consumer" && styles.activeRoleButton,
                ]}
                onPress={() => setRole("consumer")}
              >
                <Text style={[styles.roleText, role === "consumer" && styles.activeRoleText]}>
                  Order Food
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === "cook" && styles.activeRoleButton,
                ]}
                onPress={() => setRole("cook")}
              >
                <Text style={[styles.roleText, role === "cook" && styles.activeRoleText]}>
                  Start Cooking
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <CustomButton title="Register" onPress={handleRegister} />
            </View>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginBold}>Login</Text>
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
    marginBottom: 32,
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
  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginTop: 16,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    backgroundColor: "#fcfcfc",
  },
  activeRoleButton: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
    borderWidth: 2,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeRoleText: {
    color: "#FF6B6B",
  },
  buttonContainer: {
    marginTop: 8,
  },
  loginLink: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    fontSize: 15,
    color: "#666",
  },
  loginBold: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
});