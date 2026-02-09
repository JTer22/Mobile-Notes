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

  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerRight: () => (
            <Pressable
              onPress={() => setScheme(scheme === "dark" ? "light" : "dark")}
              style={{ marginRight: 16 }}
            >
              <Ionicons
                name={scheme === "dark" ? "sunny-outline" : "moon-outline"}
                size={22}
                color={scheme === "dark" ? "#fff" : "#000"}
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
        <Stack.Screen name="edit-note" options={{ title: "Edit Note" }} />
      </Stack>

      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
