import React, { useState } from "react";
import { 
  TextInput, 
  TextInputProps, 
  StyleSheet, 
  View, 
  TouchableOpacity 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Built-in with Expo

interface Props extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  style, // Capture any incoming style
  ...rest
}: Props) {
  // Local state to toggle password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        // If it's a password field, toggle based on local state
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        {...rest}
        style={[styles.input, style]}
      />
      
      {/* Show eye icon only if secureTextEntry is true */}
      {secureTextEntry && (
        <TouchableOpacity 
          style={styles.iconContainer} 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons 
            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    paddingRight: 45, // Make room for the icon
  },
  iconContainer: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});