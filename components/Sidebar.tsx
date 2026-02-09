"use client";

import { useTheme } from "@react-navigation/native";
import { useEffect } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.75;

export default function Sidebar({ isOpen, onClose }: Props) {
  const { colors } = useTheme();
  const animationValue = useSharedValue(0);

  useEffect(() => {
    animationValue.value = withTiming(isOpen ? 1 : 0, { duration: 300 });
  }, [isOpen, animationValue]);

  const sidebarAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animationValue.value,
      [0, 1],
      [-SIDEBAR_WIDTH, 0],
      Extrapolate.CLAMP,
    );
    return {
      transform: [{ translateX }],
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationValue.value,
      [0, 1],
      [0, 0.6],
      Extrapolate.CLAMP,
    );
    return {
      opacity,
    };
  });

  if (!isOpen) return null;

  return (
    <View style={styles.container}>
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: "#000000" },
          overlayAnimatedStyle,
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          { backgroundColor: colors.card, width: SIDEBAR_WIDTH },
          sidebarAnimatedStyle,
        ]}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onClose}>
            <Text style={[styles.backText, { color: colors.primary }]}>
              ← Back
            </Text>
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Menu
          </Text>

          <Pressable
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              📝 All Notes
            </Text>
          </Pressable>

          <Pressable
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              ⭐ Favorites
            </Text>
          </Pressable>

          <Pressable
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              🔍 Search
            </Text>
          </Pressable>

          <Pressable
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              ⚙️ Settings
            </Text>
          </Pressable>

          <Pressable
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              About
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
  },
  sidebar: {
    height: "100%",
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 16,
    opacity: 0.6,
    textTransform: "uppercase",
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
