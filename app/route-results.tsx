import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";

export default function RouteResults() {
  const insets = useSafeAreaInsets();
  const { kitchens, start, destination } = useLocalSearchParams();
  const kitchenList = JSON.parse(kitchens as string);

  const renderKitchenItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.kitchenCard}
      onPress={() =>
        router.push({
          pathname: "/kitchen-details" as any,
          params: { id: item._id },
        })
      }
    >
      <View style={styles.cardContent}>
        <View style={styles.kitchenInfo}>
          <Text style={styles.kitchenName}>{item.kitchenName}</Text>
          <Text style={styles.kitchenAddress} numberOfLines={1}>
            📍 {item.address}
          </Text>
          <Text style={styles.kitchenDesc} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.chevronBox}>
          <Text style={styles.chevron}>〉</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <AppHeader />

      <View style={styles.content}>
        {/* Route Summary Card */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={styles.dotContainer}>
              <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.line} />
              <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
            </View>
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>From</Text>
              <Text style={styles.addressValue} numberOfLines={1}>{start}</Text>
              <View style={{ height: 12 }} />
              <Text style={styles.addressLabel}>To</Text>
              <Text style={styles.addressValue} numberOfLines={1}>{destination}</Text>
            </View>
          </View>
          <View style={styles.resultsBadge}>
            <Text style={styles.resultsText}>{kitchenList.length} Kitchens along your route</Text>
          </View>
        </View>

        <FlatList
          data={kitchenList}
          keyExtractor={(item) => item._id}
          renderItem={renderKitchenItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No kitchens found on this specific route yet.</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  content: {
    flex: 1,
  },
  routeCard: {
    backgroundColor: "#1a1a1a",
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  routeRow: {
    flexDirection: 'row',
  },
  dotContainer: {
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  addressContainer: {
    flex: 1,
  },
  addressLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  addressValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  resultsBadge: {
    backgroundColor: 'rgba(255,107,107,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 20,
  },
  resultsText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '800',
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  kitchenCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 15,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kitchenInfo: {
    flex: 1,
  },
  kitchenName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  kitchenAddress: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  kitchenDesc: {
    fontSize: 13,
    color: "#999",
    marginTop: 6,
    lineHeight: 18,
  },
  chevronBox: {
    paddingLeft: 10,
  },
  chevron: {
    color: '#ccc',
    fontSize: 20,
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
});