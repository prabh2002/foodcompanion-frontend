import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { useState, useEffect } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

import FoodCompanionLogo from "./FoodCompanionLogo";

import { Ionicons } from "@expo/vector-icons";

export default function AppHeader() {
  const [showMenu, setShowMenu] = useState(false);

  const [userName, setUserName] = useState("");

  useEffect(() => {
    getUserName();
  }, []);

  const getUserName = async () => {
    const name = await AsyncStorage.getItem("name");

    if (name) {
      setUserName(name);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();

    router.replace("/login" as any);
  };

  return (
    <View style={styles.header}>
      {/* Left side */}
      <View style={styles.leftSection}>
        <FoodCompanionLogo size={45} />

        <Text style={styles.title}>Food Companion</Text>
      </View>

      {/* Right side */}
      <View>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <Ionicons name="person-circle" size={38} color="#FF6B6B" />
        </TouchableOpacity>

        {showMenu && (
          <View style={styles.dropdown}>
            <Text style={styles.userName}>{userName}</Text>

            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 5,
    zIndex: 1000,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF6B6B",
  },

  dropdown: {
    position: "absolute",
    top: 45,
    right: 0,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    minWidth: 140,
  },

  userName: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },

  logoutText: {
    color: "red",
    fontWeight: "bold",
  },
});
