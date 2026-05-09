import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import CustomButton from "../components/CustomButton";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FoodCompanion</Text>
      <Text style={styles.subtitle}>
        Find homemade food on your commute route
      </Text>

      <CustomButton
        title="Login"
        onPress={() => router.push("/login")}
      />

      <CustomButton
        title="Register"
        onPress={() => router.push("/register")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    color: "gray",
  },
});