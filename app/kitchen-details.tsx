import { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API } from "../services/api";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppHeader from "../components/AppHeader";

export default function KitchenDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchDetails();
    checkFavoriteStatus();
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await API.get(`/kitchen-details/${id}`);
      setData(res.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load kitchen details");
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/favorites/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const exists = res.data.find((fav: any) => fav.kitchenId._id === id);
      if (exists) setIsFavorite(true);
    } catch (error) {
      console.log("Favorite status check failed");
    }
  };

  const toggleItem = (item: any) => {
    const exists = selectedItems.find((i) => i.itemName === item.itemName);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.itemName !== item.itemName));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const isSelected = (item: any) => {
    return selectedItems.find((i) => i.itemName === item.itemName);
  };

  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await API.post(
        "/favorites/toggle",
        { kitchenId: data.kitchen._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavorite(res.data.isFavorite);
      Alert.alert("Updated", res.data.message);
    } catch (error) {
      Alert.alert("Error", "Action failed");
    }
  };

  const placeOrder = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (selectedItems.length === 0) {
        Alert.alert("Empty Cart", "Please select at least one item");
        return;
      }
      const totalAmount = selectedItems.reduce((total, item) => total + item.price, 0);

      await API.post(
        "/order/place",
        {
          kitchenId: data.kitchen._id,
          items: selectedItems,
          totalAmount,
          deliveryAddress: "Consumer Selected Address",
          messageForCook: message,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success 🎉", "Your order has been placed!");
      router.replace("/consumer-home" as any);
    } catch (error) {
      Alert.alert("Error", "Order placement failed");
    }
  };

  if (!data) return null;

  const renderMenuSection = (title: string, items: any[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.itemCard, isSelected(item) && styles.itemCardSelected]}
          onPress={() => toggleItem(item)}
          activeOpacity={0.8}
        >
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, isSelected(item) && styles.whiteText]}>
              {item.itemName}
            </Text>
            <Text style={[styles.itemPrice, isSelected(item) && styles.whiteText]}>
              ₹{item.price}
            </Text>
          </View>
          <View style={[styles.checkbox, isSelected(item) && styles.checkboxSelected]}>
            {isSelected(item) && <Text style={styles.checkIcon}>✓</Text>}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <AppHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Kitchen Header Card */}
          <View style={styles.kitchenHero}>
            <View style={styles.heroHeader}>
              <Text style={styles.kitchenName}>{data.kitchen.kitchenName}</Text>
              <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
                <Text style={styles.favIcon}>{isFavorite ? "❤️" : "🤍"}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.kitchenDesc}>{data.kitchen.description}</Text>
            
            {/* CORRECTED TAG BELOW */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👨‍🍳 Chef:</Text>
              <Text style={styles.infoValue}>{data.kitchen.ownerId.name}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={() => Linking.openURL(`tel:${data.kitchen.ownerId.phone}`)}
              >
                <Text style={styles.secondaryActionText}>📞 Call Cook</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryAction}
                onPress={() => router.push({
                  pathname: "/view-kitchen-location" as any,
                  params: {
                    lat: data.kitchen.location.coordinates[1],
                    lng: data.kitchen.location.coordinates[0],
                    kitchenName: data.kitchen.kitchenName,
                  },
                })}
              >
                <Text style={styles.secondaryActionText}>📍 View Map</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Menu Sections */}
          {renderMenuSection("🍳 Breakfast", data.menu.breakfast)}
          {renderMenuSection("🍱 Lunch", data.menu.lunch)}
          {renderMenuSection("🍛 Dinner", data.menu.dinner)}

          {/* Special Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <CustomInput
              placeholder="e.g. Less spicy, don't use onions..."
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>

          {/* Place Order CTA */}
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>
                ₹{selectedItems.reduce((acc, curr) => acc + curr.price, 0)}
              </Text>
            </View>
            <CustomButton title="Place Order Now" onPress={placeOrder} />
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  kitchenHero: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kitchenName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a1a1a",
    flex: 1,
  },
  favBtn: {
    padding: 5,
  },
  favIcon: {
    fontSize: 24,
  },
  kitchenDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginRight: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#444",
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#FF6B6B',
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: "#fff",
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemCardSelected: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  whiteText: {
    color: "#fff",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxSelected: {
    borderColor: "#fff",
    backgroundColor: "#fff",
  },
  checkIcon: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF6B6B',
  },
});
