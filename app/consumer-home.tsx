import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../services/api";
import { router } from "expo-router";
import AppHeader from "../components/AppHeader";
import { MaterialIcons } from "@expo/vector-icons";

export default function ConsumerHome() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchFavorites();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/dashboard/consumer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (error) {
      // Silently fail on background poll to avoid interrupting user
      console.error("Dashboard poll failed");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/favorites/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data);
    } catch (error) {
      console.error("Failed to load favorites");
    }
  };

  if (!data)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Finding fresh meals...</Text>
      </View>
    );

  return (
    <View
      style={[
        styles.mainContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <AppHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDashboard();
              fetchFavorites();
            }}
          />
        }
      >
        {/* Personalized Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>Hungry? 🍱</Text>
          <Text style={styles.subGreeting}>
            Healthy home-cooked meals await you.
          </Text>
        </View>

        {/* High Priority: Active Order Tracker */}
        {data.activeOrder && (
          <View style={styles.activeOrderCard}>
            <View style={styles.activeOrderHeader}>
              <Text style={styles.activeOrderTitle}>Active Order</Text>
              <View style={styles.livePulse}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.activeKitchenName}>
              {data.activeOrder.kitchenId.kitchenName}
            </Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {data.activeOrder.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Primary CTA: Route Search */}
        <TouchableOpacity
          style={styles.searchRouteBtn}
          onPress={() => router.push("/route-search" as any)}
          activeOpacity={0.9}
        >
          <View style={styles.searchIconCircle}>
            <Text style={{ fontSize: 24 }}>🚗</Text>
          </View>
          <View style={styles.searchTextWrapper}>
            <Text style={styles.searchBtnTitle}>Search Along Route</Text>
            <Text style={styles.searchBtnSub}>
              Find kitchens on your commute
            </Text>
          </View>
        </TouchableOpacity>

        {/* Favorites Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Favorites</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {favorites.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No favorites yet. Start exploring!
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.favoritesScroll}
          >
            {favorites.map((favorite: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.favoriteCard}
                onPress={() =>
                  router.push({
                    pathname: "/kitchen-details" as any,
                    params: { id: favorite.kitchenId._id },
                  })
                }
              >
                <View style={styles.favoriteIcon}>
                  <Text style={{ fontSize: 20 }}>❤️</Text>
                </View>
                <Text style={styles.favKitchenName} numberOfLines={1}>
                  {favorite.kitchenId.kitchenName}
                </Text>
                <Text style={styles.favKitchenAddress} numberOfLines={1}>
                  {favorite.kitchenId.address}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Recent Activity Section */}
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {data.recentOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              You haven't ordered anything yet.
            </Text>
          </View>
        ) : (
          data.recentOrders.map((order: any, index: number) => (
            <TouchableOpacity key={index} style={styles.recentOrderCard}>
              <View style={styles.recentIconBox}>
                <Text style={{ fontSize: 18 }}>🍛</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentKitchenName}>
                  {order.kitchenId.kitchenName}
                </Text>
                <Text style={styles.recentDate}>Order Delivered</Text>
              </View>
              <Text style={styles.recentAmount}>₹{order.totalAmount}</Text>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Floating AI Button */}
      <TouchableOpacity
        style={styles.aiBotButton}
        onPress={() => router.push("/recipe-assistant" as any)}
      >
        <MaterialIcons name="smart-toy" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  scrollContent: {
    padding: 20,
  },
  greetingSection: {
    marginBottom: 25,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  subGreeting: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  activeOrderCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#FFDADA",
  },
  activeOrderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activeOrderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF6B6B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  livePulse: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginRight: 4,
  },
  liveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },
  activeKitchenName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  searchRouteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  searchIconCircle: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  searchTextWrapper: {
    flex: 1,
  },
  searchBtnTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  searchBtnSub: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  seeAllText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  favoritesScroll: {
    marginLeft: -20,
    paddingLeft: 20,
    marginBottom: 30,
  },
  favoriteCard: {
    backgroundColor: "#fff",
    width: 160,
    padding: 16,
    borderRadius: 18,
    marginRight: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  favoriteIcon: {
    marginBottom: 12,
  },
  favKitchenName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  favKitchenAddress: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  recentOrderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
  },
  recentIconBox: {
    width: 45,
    height: 45,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  recentKitchenName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  recentDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  recentAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6B6B",
  },
  emptyCard: {
    padding: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
  },
  aiBotButton: {
    position: "absolute",
    right: 20,
    bottom: 100,
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
});
