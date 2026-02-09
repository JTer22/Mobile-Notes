import { useTheme } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import Hamburger from "./Hamburger";

interface Props {
  isMenuOpen: boolean;
  onMenuPress: () => void;
}

export default function Header({ isMenuOpen, onMenuPress }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}
    >
      <Hamburger
        color={colors.text}
        isOpen={isMenuOpen}
        onPress={onMenuPress}
      />
      <Text style={[styles.title, { color: colors.text }]}>My Notes</Text>
      <View style={{ width: 40 }} /> {/* Spacer for center alignment */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
});
