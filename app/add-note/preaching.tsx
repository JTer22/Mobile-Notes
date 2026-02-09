"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface PreachingNote {
  type: "preaching";
  title: string;
  content: string;
  date: string;
  speaker: string;
  lastEdited: number;
}

export default function PreachingNote() {
  const router = useRouter();
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const canSave = title.trim() && content.trim();

  const saveNote = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const saved = await AsyncStorage.getItem("notes");
      const notes: PreachingNote[] = saved ? JSON.parse(saved) : [];
      notes.push({
        type: "preaching",
        title: title.trim(),
        date: date.trim(),
        speaker: speaker.trim(),
        content: content.trim(),
        lastEdited: Date.now(),
      });
      await AsyncStorage.setItem("notes", JSON.stringify(notes));
      router.back();
    } catch (error) {
      console.error("Error saving preaching note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.pageContainer}>
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
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="Date"
          placeholderTextColor={colors.text + "50"}
          style={[
            styles.metaInput,
            { color: colors.text, borderBottomColor: colors.text + "20" },
          ]}
        />
        <TextInput
          value={speaker}
          onChangeText={setSpeaker}
          placeholder="Speaker"
          placeholderTextColor={colors.text + "50"}
          style={[
            styles.metaInput,
            { color: colors.text, borderBottomColor: colors.text + "20" },
          ]}
        />

        <View style={[styles.contentWrapper, { backgroundColor: colors.card }]}>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write your preaching note..."
            placeholderTextColor={colors.text + "50"}
            style={[styles.contentInput, { color: colors.text }]}
            multiline
            scrollEnabled
          />
        </View>

        <Text style={[styles.lastEdited, { color: colors.text + "60" }]}>
          Last Edited: {new Date().toLocaleDateString()}
        </Text>
      </ScrollView>

      <View style={styles.buttonGroup}>
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={saveNote}
        >
          <Text style={styles.buttonText}>
            {isSaving ? "Saving..." : "Save Note"}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: "#ef4444" }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start", padding: 16 },
  pageContainer: { paddingBottom: 40 },
  titleInput: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  metaInput: {
    fontSize: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  contentWrapper: {
    flex: 1,
    minHeight: 400,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
    flex: 1,
    minHeight: 300,
  },
  lastEdited: { marginTop: 12, fontSize: 12, textAlign: "right" },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
