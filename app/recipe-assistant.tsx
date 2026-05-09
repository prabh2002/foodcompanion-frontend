import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "../services/api";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";

export default function RecipeAssistant() {
  const insets = useSafeAreaInsets();
  const [ingredients, setIngredients] = useState("");
  const [dietType, setDietType] = useState("vegetarian");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async () => {
    if (!ingredients) return Alert.alert("Wait", "Please enter some ingredients first!");
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await API.post(
        "/recipe/generate",
        { ingredients, dietType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRecipes(res.data.recipes);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch recipes");
    } finally {
      setLoading(false);
    }
  };

  const renderRecipe = ({ item }: { item: any }) => {
    const ingredientsList = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = item[`strIngredient${i}`];
      if (ingredient && ingredient.trim() !== "") {
        ingredientsList.push(ingredient);
      }
    }

    return (
      <View style={styles.recipeCard}>
        <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
        
        <View style={styles.cardContent}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.badgeText}>{item.strCategory}</Text>
            </View>
            <Text style={styles.cuisineText}>📍 {item.strArea}</Text>
          </View>

          <Text style={styles.recipeTitle}>{item.strMeal}</Text>
          
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>⏱️ 30-45 mins</Text>
          </View>

          <Text style={styles.sectionHeading}>Required Ingredients:</Text>
          <Text style={styles.ingredientsText}>{ingredientsList.join(" • ")}</Text>

          <Text style={styles.sectionHeading}>Cooking Steps:</Text>
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>{item.strInstructions}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* Header Area */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recipe Assistant 🍳</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.idMeal}
          renderItem={renderRecipe}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.inputSection}>
              <Text style={styles.label}>What's in your fridge?</Text>
              <CustomInput
                placeholder="rice, onion, tomato..."
                value={ingredients}
                onChangeText={setIngredients}
              />

              <Text style={styles.label}>Dietary Preference</Text>
              <View style={styles.dietContainer}>
                <TouchableOpacity
                  style={[styles.dietBtn, dietType === "vegetarian" && styles.activeBtn]}
                  onPress={() => setDietType("vegetarian")}
                >
                  <Text style={[styles.dietBtnText, dietType === "vegetarian" && styles.activeBtnText]}>
                    🥗 Vegetarian
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dietBtn, dietType === "non-vegetarian" && styles.activeBtn]}
                  onPress={() => setDietType("non-vegetarian")}
                >
                  <Text style={[styles.dietBtnText, dietType === "non-vegetarian" && styles.activeBtnText]}>
                    🍗 Non-Veg
                  </Text>
                </TouchableOpacity>
              </View>

              <CustomButton
                title={loading ? "Searching..." : "Find Recipes"}
                onPress={fetchRecipes}
              />
              
              {loading && <ActivityIndicator color="#FF6B6B" style={{ marginTop: 20 }} />}
              
              {recipes.length > 0 && (
                <Text style={styles.resultsCount}>{recipes.length} Delicious Matches Found</Text>
              )}
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backArrow: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 10,
  },
  dietContainer: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 15,
  },
  dietBtn: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: '#EEE',
  },
  activeBtn: {
    backgroundColor: "#FF6B6B",
    borderColor: '#FF6B6B',
  },
  dietBtnText: {
    fontWeight: '700',
    color: '#666',
  },
  activeBtnText: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
  },
  resultsCount: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    marginBottom: 25,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  recipeImage: {
    width: "100%",
    height: 220,
  },
  cardContent: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '800',
  },
  cuisineText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 5,
  },
  timeRow: {
    marginBottom: 15,
  },
  timeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginTop: 15,
    marginBottom: 8,
  },
  ingredientsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 10,
  },
  instructionBox: {
    marginTop: 5,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
  },
});