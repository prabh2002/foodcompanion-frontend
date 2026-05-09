import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Linking, 
  Alert, 
  StyleSheet, 
  ActivityIndicator 
} from "react-native";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../services/api";
import AppHeader from "../components/AppHeader";

export default function CookOrders() {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/order/cook-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await API.put(
        "/order/update-status",
        { orderId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", `Order marked as ${status}`);
      fetchOrders();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return '#2196F3';
      case 'preparing': return '#FF9800';
      case 'delivered': return '#4CAF50';
      default: return '#757575';
    }
  };

  const renderOrderItem = ({ item }: any) => (
    <View style={styles.orderCard}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.customerName}>{item.consumerId.name}</Text>
          <Text style={styles.kitchenName}>Kitchen: {item.kitchenId.kitchenName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Items Section */}
      <View style={styles.itemsBox}>
        <Text style={styles.sectionTitle}>Ordered Items:</Text>
        {item.items.map((food: any, index: number) => (
          <View key={index} style={styles.foodRow}>
            <Text style={styles.foodName}>• {food.itemName}</Text>
            <Text style={styles.foodPrice}>₹{food.price}</Text>
          </View>
        ))}
      </View>

      {/* Special Message */}
      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>Note from customer:</Text>
        <Text style={styles.messageText}>"{item.messageForCook || "No specific instructions"}"</Text>
      </View>

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <Text style={styles.totalText}>Total Amount: <Text style={styles.priceHighlight}>₹{item.totalAmount}</Text></Text>
        <TouchableOpacity 
          style={styles.callButton} 
          onPress={() => Linking.openURL(`tel:${item.consumerId.phone}`)}
        >
          <Text style={styles.callButtonText}>📞 Call</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {item.status !== 'accepted' && item.status !== 'preparing' && item.status !== 'delivered' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.acceptBtn]} 
            onPress={() => updateStatus(item._id, "accepted")}
          >
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'accepted' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.preparingBtn]} 
            onPress={() => updateStatus(item._id, "preparing")}
          >
            <Text style={styles.btnText}>Start Preparing</Text>
          </TouchableOpacity>
        )}

        {item.status === 'preparing' && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deliveredBtn]} 
            onPress={() => updateStatus(item._id, "delivered")}
          >
            <Text style={styles.btnText}>Ready to Deliver</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <AppHeader />
      <View style={styles.headerPadding}>
        <Text style={styles.pageTitle}>Current Orders</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item: any) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No active orders at the moment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  headerPadding: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 5,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  kitchenName: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  itemsBox: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 14,
    color: "#444",
  },
  foodPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  messageBox: {
    borderLeftWidth: 3,
    borderLeftColor: "#FF6B6B",
    paddingLeft: 10,
    marginVertical: 10,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
  },
  messageText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: "#555",
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalText: {
    fontSize: 14,
    color: "#666",
  },
  priceHighlight: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FF6B6B",
  },
  callButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  callButtonText: {
    color: "#FF6B6B",
    fontWeight: "700",
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: "#2196F3",
  },
  preparingBtn: {
    backgroundColor: "#FF9800",
  },
  deliveredBtn: {
    backgroundColor: "#4CAF50",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  }
});