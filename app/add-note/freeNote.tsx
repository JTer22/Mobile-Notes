"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface Note {
  type: "free" | "preaching";
  title: string;
  content: string;
  lastEdited: number;
}

export default function FreeNote() {
  const router = useRouter();
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canSave = title.trim() || content.trim();

  const saveNote = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const saved = await AsyncStorage.getItem("notes");
      const notes: Note[] = saved ? JSON.parse(saved) : [];
      notes.push({
        type: "free",
        title: title.trim(),
        content: content.trim(),
        lastEdited: Date.now(),
      });
      await AsyncStorage.setItem("notes", JSON.stringify(notes));
      router.back();
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={colors.text + "80"}
        style={[
          styles.titleInput,
          { color: colors.text, borderBottomColor: colors.text + "20" },
        ]}
      />
      <View style={[styles.contentWrapper, { backgroundColor: colors.card }]}>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write your note..."
          placeholderTextColor={colors.text + "50"}
          style={[styles.contentInput, { color: colors.text }]}
          multiline
          scrollEnabled
        />
      </View>
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            opacity: canSave ? 1 : 0.5,
          },
        ]}
        onPress={saveNote}
        disabled={!canSave || isSaving}
      >
        <Text style={styles.buttonText}>
          {isSaving ? "Saving..." : "Save Note"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-start",
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  contentWrapper: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 300,
    elevation: 2,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
    flex: 1,
  },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
