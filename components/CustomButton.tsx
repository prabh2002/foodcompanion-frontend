import { TouchableOpacity, Text } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
}

export default function CustomButton({
  title,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
      }}
    >
      <Text
        style={{
          color: "white",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}