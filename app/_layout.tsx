"use client";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable } from "react-native";

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const [scheme, setScheme] = useState(systemScheme);

  const toggleScheme = () =>
    setScheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Select theme for Navigation
  const theme = scheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.card },
          headerTintColor: theme.colors.text,
          headerRight: () => (
            <Pressable
              onPress={toggleScheme}
              style={{ marginRight: 16, padding: 4 }}
            >
              <Ionicons
                name={scheme === "dark" ? "sunny-outline" : "moon-outline"}
                size={22}
                color={theme.colors.text}
              />
            </Pressable>
          ),
        }}
      >
        <Stack.Screen name="index" options={{ title: "Notes" }} />
        <Stack.Screen
          name="add-note/freeNote"
          options={{ title: "Free Note" }}
        />
        <Stack.Screen
          name="add-note/preaching"
          options={{ title: "Preaching Note" }}
        />
        <Stack.Screen name="preview" options={{ title: "Preview Note" }} />
      </Stack>

      {/* StatusBar respects dark/light theme */}
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
