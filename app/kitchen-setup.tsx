import { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { API } from "../services/api";
import { router } from "expo-router";
import { searchLocation } from "../services/locationService";
import AppHeader from "../components/AppHeader";

export default function KitchenSetup() {
  const insets = useSafeAreaInsets();
  const [kitchenName, setKitchenName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearchAddress = async () => {
    if (!address) return Alert.alert("Wait", "Please enter an address to search");
    try {
      const results = await searchLocation(address);
      setSearchResults(results);
    } catch (error) {
      Alert.alert("Error", "Address search failed");
    }
  };

  const handleCreateKitchen = async () => {
    if (!latitude || !longitude) {
      return Alert.alert("Location Required", "Please search an address or use the map to pin your location.");
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.post(
        "/kitchen/create",
        {
          kitchenName,
          description,
          address: manualAddress || address,
          latitude,
          longitude,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await AsyncStorage.setItem("kitchenId", res.data._id);
      Alert.alert("Success", "Kitchen Created Successfully!");
      router.push("/menu-setup" as any);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Kitchen creation failed"
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
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Kitchen Setup</Text>
            <Text style={styles.subtitle}>Tell us about your cooking space</Text>
          </View>

          {/* Section 1: Basic Details */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>General Information</Text>
            <CustomInput
              placeholder="Kitchen Name (e.g. Grandma's Spices)"
              value={kitchenName}
              onChangeText={setKitchenName}
            />
            <CustomInput
              placeholder="Brief Description"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          {/* Section 2: Location Details */}
          <View style={styles.card}>
            <View style={styles.locationHeader}>
              <Text style={styles.sectionLabel}>Kitchen Location</Text>
              {latitude && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>

            <View style={styles.searchWrapper}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  placeholder="Search Area/City"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearchAddress}>
                <Text style={styles.searchBtnText}>Search</Text>
              </TouchableOpacity>
            </View>

            {searchResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {searchResults.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => {
                      setLatitude(Number(item.lat));
                      setLongitude(Number(item.lon));
                      setAddress(item.display_name);
                      setSearchResults([]);
                      Alert.alert("Location Set", "Coordinates saved!");
                    }}
                  >
                    <Text style={styles.resultText} numberOfLines={2}>📍 {item.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.orText}>— OR —</Text>

            <TouchableOpacity 
                style={styles.mapBtn} 
                onPress={() => router.push("/map-picker" as any)}
            >
              <Text style={styles.mapBtnText}>📍 Pin on Map</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loadBtn}
              onPress={async () => {
                const lat = await AsyncStorage.getItem("selectedLat");
                const lng = await AsyncStorage.getItem("selectedLng");
                if (lat && lng) {
                  setLatitude(Number(lat));
                  setLongitude(Number(lng));
                  Alert.alert("Success", "Coordinates loaded from map selection!");
                } else {
                  Alert.alert("Error", "Please pin a location on the map first.");
                }
              }}
            >
              <Text style={styles.loadBtnText}>Load Map Selection</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 15 }}>
              <CustomInput
                placeholder="Specific Address (Flat No, House No)"
                value={manualAddress}
                onChangeText={setManualAddress}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <CustomButton title="Create My Kitchen" onPress={handleCreateKitchen} />
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
    marginBottom: 20,
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
  card: {
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: -10, // Align with CustomInput margin
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginTop: 10,
    padding: 5,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 13,
    color: '#444',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#bbb',
    fontWeight: '700',
  },
  mapBtn: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  mapBtnText: {
    color: '#FF6B6B',
    fontWeight: '800',
    fontSize: 15,
  },
  loadBtn: {
    marginTop: 10,
    alignItems: 'center',
    padding: 8,
  },
  loadBtnText: {
    color: '#666',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  footer: {
    marginTop: 10,
  },
});