import { useState } from "react";
import { 
  View, 
  Text, 
  Alert, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { API } from "../services/api";
import { router } from "expo-router";
import AppHeader from "../components/AppHeader";

export default function MenuSetup() {
  const insets = useSafeAreaInsets();
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");

  const [breakfastPrice, setBreakfastPrice] = useState("");
  const [lunchPrice, setLunchPrice] = useState("");
  const [dinnerPrice, setDinnerPrice] = useState("");

  const handleCreateMenu = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const kitchenId = await AsyncStorage.getItem("kitchenId");

      await API.post(
        "/menu/create",
        {
          kitchenId,
          breakfast: [{ itemName: breakfast, price: Number(breakfastPrice) }],
          lunch: [{ itemName: lunch, price: Number(lunchPrice) }],
          dinner: [{ itemName: dinner, price: Number(dinnerPrice) }],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Success", "Menu Created Successfully");
      router.replace("/cook-home" as any);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Menu creation failed"
      );
    }
  };

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <AppHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Menu Setup</Text>
            <Text style={styles.subtitle}>Define your daily meals and pricing</Text>
          </View>

          {/* Breakfast Section */}
          <View style={styles.mealCard}>
            <Text style={styles.mealTitle}>🍳 Breakfast</Text>
            <CustomInput
              placeholder="Dish Name (e.g., Poha, Omelette)"
              value={breakfast}
              onChangeText={setBreakfast}
            />
            <CustomInput
              placeholder="Price (₹)"
              value={breakfastPrice}
              onChangeText={setBreakfastPrice}
              keyboardType="numeric"
            />
          </View>

          {/* Lunch Section */}
          <View style={styles.mealCard}>
            <Text style={styles.mealTitle}>🍱 Lunch</Text>
            <CustomInput
              placeholder="Dish Name (e.g., Thali, Rajma Chawal)"
              value={lunch}
              onChangeText={setLunch}
            />
            <CustomInput
              placeholder="Price (₹)"
              value={lunchPrice}
              onChangeText={setLunchPrice}
              keyboardType="numeric"
            />
          </View>

          {/* Dinner Section */}
          <View style={styles.mealCard}>
            <Text style={styles.mealTitle}>🍛 Dinner</Text>
            <CustomInput
              placeholder="Dish Name (e.g., Paneer, Dal Makhani)"
              value={dinner}
              onChangeText={setDinner}
            />
            <CustomInput
              placeholder="Price (₹)"
              value={dinnerPrice}
              onChangeText={setDinnerPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.buttonWrapper}>
            <CustomButton title="Save & Create Menu" onPress={handleCreateMenu} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
  },
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  buttonWrapper: {
    marginTop: 10,
  },
});