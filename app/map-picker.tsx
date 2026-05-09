import { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export default function MapPicker() {
  const { type } = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to open the map",
        );

        router.back();
      }
    })();
  }, []);
  
  const [location, setLocation] = useState({
    latitude: 28.4595,
    longitude: 77.0266,
  });

  const saveLocation = async () => {
    if (type === "start") {
      await AsyncStorage.setItem("startLat", location.latitude.toString());

      await AsyncStorage.setItem("startLng", location.longitude.toString());
    } else if (type === "end") {
      await AsyncStorage.setItem("endLat", location.latitude.toString());

      await AsyncStorage.setItem("endLng", location.longitude.toString());
    } else {
      await AsyncStorage.setItem("selectedLat", location.latitude.toString());

      await AsyncStorage.setItem("selectedLng", location.longitude.toString());
    }

    Alert.alert("Success", "Location confirmed!");

    router.back();
  };

  return (
    <View style={styles.container}>
      {/* The Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={(e) => setLocation(e.nativeEvent.coordinate)}
      >
        <Marker
          coordinate={location}
          draggable
          pinColor="#FF6B6B" // Matches our theme color
          onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
        />
      </MapView>

      {/* Floating Instruction Card */}
      <SafeAreaView style={styles.overlayTop}>
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Pick Location</Text>
          <Text style={styles.instructionSubtitle}>
            Drag the pin or tap on the map to set your address
          </Text>
        </View>
      </SafeAreaView>

      {/* Floating Confirm Button */}
      <View style={styles.overlayBottom}>
        <TouchableOpacity style={styles.confirmButton} onPress={saveLocation}>
          <Text style={styles.confirmButtonText}>Confirm This Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
  },
  instructionCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  instructionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  overlayBottom: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  confirmButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
