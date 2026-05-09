import { View, StyleSheet } from "react-native";

import MapView, { Marker } from "react-native-maps";

import { useLocalSearchParams } from "expo-router";

import AppHeader from "../components/AppHeader";

export default function ViewKitchenLocation() {
  const { lat, lng, kitchenName } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <AppHeader />

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: Number(lat),
            longitude: Number(lng),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: Number(lat),
              longitude: Number(lng),
            }}
            title={kitchenName as string}
            description="Kitchen Location"
          />
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
});
