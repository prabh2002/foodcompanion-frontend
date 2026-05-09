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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../services/api";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";

export default function CookHome() {
  const insets = useSafeAreaInsets();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/dashboard/cook", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(res.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await API.put("/dashboard/toggle-availability", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboard();
    } catch (error) {
      Alert.alert("Error", "Failed to update availability");
    }
  };

  if (!dashboardData)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Preparing your kitchen...</Text>
      </View>
    );

  const isAvailable = dashboardData.kitchen?.isAvailable;

  return (
   <View style={[
      styles.mainContainer, 
      { 
        // 3. Apply padding dynamically to the wrapper
        paddingTop: insets.top, 
        paddingBottom: insets.bottom 
      }
    ]}>
      <AppHeader />

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchDashboard();
          }} />
        }
      >
        {/* Chef Profile & Availability */}
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.welcomeText}>Welcome Chef 👋</Text>
            <Text style={styles.kitchenName}>
              {dashboardData.kitchen?.kitchenName || "Setup your kitchen"}
            </Text>
          </View>
          
          {dashboardData.kitchen && (
            <TouchableOpacity
              style={[
                styles.statusBadge,
                { backgroundColor: isAvailable ? "#E8F5E9" : "#FFEBEE" },
              ]}
              onPress={toggleAvailability}
            >
              <View style={[styles.dot, { backgroundColor: isAvailable ? "#4CAF50" : "#F44336" }]} />
              <Text style={[styles.statusText, { color: isAvailable ? "#2E7D32" : "#C62828" }]}>
                {isAvailable ? "Open" : "Closed"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Revenue</Text>
            <Text style={styles.statValue}>₹{dashboardData.totalRevenue}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftWidth: 1, borderLeftColor: '#eee' }]}>
            <Text style={styles.statLabel}>Total Orders</Text>
            <Text style={styles.statValue}>{dashboardData.totalOrders}</Text>
          </View>
        </View>

        {/* Menu Management Section */}
        <Text style={styles.sectionHeading}>Today's Menu</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <Text style={styles.mealType}>🍳 Breakfast</Text>
            <Text style={styles.itemName} numberOfLines={1}>
              {dashboardData.menu?.breakfast?.[0]?.itemName || "Not added"}
            </Text>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.menuItem}>
            <Text style={styles.mealType}>🍱 Lunch</Text>
            <Text style={styles.itemName} numberOfLines={1}>
              {dashboardData.menu?.lunch?.[0]?.itemName || "Not added"}
            </Text>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.menuItem}>
            <Text style={styles.mealType}>🍛 Dinner</Text>
            <Text style={styles.itemName} numberOfLines={1}>
              {dashboardData.menu?.dinner?.[0]?.itemName || "Not added"}
            </Text>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push("/cook-orders" as any)}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData.recentOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No orders received yet.</Text>
          </View>
        ) : (
          dashboardData.recentOrders.slice(0, 3).map((order: any, index: number) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.customerName}>{order.consumerId.name}</Text>
                <Text style={styles.orderAmount}>₹{order.totalAmount}</Text>
              </View>
              <View style={[styles.statusTag, { backgroundColor: order.status === 'completed' ? '#E8F5E9' : '#FFF3E0' }]}>
                <Text style={[styles.statusTagText, { color: order.status === 'completed' ? '#2E7D32' : '#E65100' }]}>
                  {order.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Quick Actions Grid */}
        <Text style={[styles.sectionHeading, { marginTop: 20 }]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/menu-setup" as any)}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>Edit Menu</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/kitchen-setup" as any)}>
            <Text style={styles.actionIcon}>🏠</Text>
            <Text style={styles.actionText}>Kitchen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/cook-orders" as any)}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Orders</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 40 }} /> 
      </ScrollView>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  kitchenName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FF6B6B",
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    elevation: 2,
  },
  menuItem: {
    paddingVertical: 8,
  },
  mealType: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAll: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  orderAmount: {
    fontSize: 14,
    color: "#666",
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: "800",
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#999",
  },
});