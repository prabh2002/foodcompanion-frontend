import { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { API } from "../services/api";
import { searchLocation } from "../services/locationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function RouteSearch() {
  const insets = useSafeAreaInsets();
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [startCoordinates, setStartCoordinates] = useState<any>(null);
  const [endCoordinates, setEndCoordinates] = useState<any>(null);
  const [startResults, setStartResults] = useState<any[]>([]);
  const [endResults, setEndResults] = useState<any[]>([]);

  const handleStartSearch = async () => {
    if (!startAddress) return;
    const results = await searchLocation(startAddress);
    setStartResults(results);
  };

  const handleEndSearch = async () => {
    if (!endAddress) return;
    const results = await searchLocation(endAddress);
    setEndResults(results);
  };

  const handleSearch = async () => {
    if (!startCoordinates || !endCoordinates) {
      return Alert.alert("Incomplete", "Please select both locations to find tiffins on your route.");
    }
    try {
      const res = await API.post("/route/search", {
        startLat: Number(startCoordinates.lat),
        startLng: Number(startCoordinates.lon),
        endLat: Number(endCoordinates.lat),
        endLng: Number(endCoordinates.lon),
      });

      router.push({
        pathname: "/route-results" as any,
        params: {
          kitchens: JSON.stringify(res.data.kitchens),
          start: startAddress,
          destination: endAddress,
        },
      });
    } catch (error: any) {
      Alert.alert("Error", "Route search failed. Please try again.");
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
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Plan Your Commute</Text>
            <Text style={styles.subtitle}>Find healthy meals along your path</Text>
          </View>

          {/* Source Section */}
          <View style={styles.card}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.cardLabel}>STARTING FROM</Text>
              {startCoordinates && <Text style={styles.verifiedText}>✓ Set</Text>}
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  placeholder="Enter pickup point"
                  value={startAddress}
                  onChangeText={setStartAddress}
                />
              </View>
              <TouchableOpacity style={styles.smallSearchBtn} onPress={handleStartSearch}>
                <Text style={styles.smallSearchBtnText}>Find</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.mapLink}
              onPress={() => router.push("/map-picker?type=start" as any)}
            >
              <Text style={styles.mapLinkText}>📍 Select on Map</Text>
            </TouchableOpacity>

            {startResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {startResults.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => {
                      setStartCoordinates(item);
                      setStartAddress(item.display_name);
                      setStartResults([]);
                    }}
                  >
                    <Text style={styles.resultItemText} numberOfLines={1}>{item.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Destination Section */}
          <View style={styles.card}>
            <View style={styles.cardLabelRow}>
              <Text style={styles.cardLabel}>DESTINATION</Text>
              {endCoordinates && <Text style={styles.verifiedText}>✓ Set</Text>}
            </View>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  placeholder="Enter drop point"
                  value={endAddress}
                  onChangeText={setEndAddress}
                />
              </View>
              <TouchableOpacity style={styles.smallSearchBtn} onPress={handleEndSearch}>
                <Text style={styles.smallSearchBtnText}>Find</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.mapLink}
              onPress={() => router.push("/map-picker?type=end" as any)}
            >
              <Text style={styles.mapLinkText}>📍 Select on Map</Text>
            </TouchableOpacity>

            {endResults.length > 0 && (
              <View style={styles.resultsContainer}>
                {endResults.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => {
                      setEndCoordinates(item);
                      setEndAddress(item.display_name);
                      setEndResults([]);
                    }}
                  >
                    <Text style={styles.resultItemText} numberOfLines={1}>{item.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <TouchableOpacity
            style={styles.loadMapBtn}
            onPress={async () => {
              const startLat = await AsyncStorage.getItem("startLat");
              const startLng = await AsyncStorage.getItem("startLng");
              const endLat = await AsyncStorage.getItem("endLat");
              const endLng = await AsyncStorage.getItem("endLng");

              if (startLat && startLng && endLat && endLng) {
                setStartCoordinates({ lat: startLat, lon: startLng });
                setEndCoordinates({ lat: endLat, lon: endLng });
                setStartAddress("Location pinned on map");
                setEndAddress("Location pinned on map");
                Alert.alert("Success", "Both locations synced from Map Picker");
              } else {
                Alert.alert("Missing Pins", "Please pick both locations on the map first");
              }
            }}
          >
            <Text style={styles.loadMapBtnText}>Sync Pins from Map</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <CustomButton title="Search Tiffin Service" onPress={handleSearch} />
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
  container: {
    padding: 20,
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
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#999",
    letterSpacing: 1,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4CAF50",
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smallSearchBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: -10,
  },
  smallSearchBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapLink: {
    marginTop: 5,
  },
  mapLinkText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },
  resultsContainer: {
    marginTop: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultItemText: {
    fontSize: 13,
    color: '#444',
  },
  loadMapBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loadMapBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  footer: {
    marginTop: 10,
  },
});