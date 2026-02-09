"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Note {
  type: "free" | "preaching";
  title: string;
  content: string;
  date?: string;
  speaker?: string;
  lastEdited?: number;
}

export default function PreviewNote() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const index = params.index ? parseInt(params.index as string, 10) : NaN;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Load note
  const loadNote = async () => {
    if (isNaN(index)) {
      setLoading(false);
      return;
    }

    try {
      const saved = await AsyncStorage.getItem("notes");
      const notes: Note[] = saved ? JSON.parse(saved) : [];
      setNote(notes[index] || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNote();
  }, [index]);

  // Save note
  const saveNote = async () => {
    if (!note || isNaN(index)) return;

    setIsSaving(true);
    try {
      const saved = await AsyncStorage.getItem("notes");
      const notes: Note[] = saved ? JSON.parse(saved) : [];

      notes[index] = { ...note, lastEdited: Date.now() };

      await AsyncStorage.setItem("notes", JSON.stringify(notes));
      setIsDirty(false);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Track changes
  const handleNoteChange = (field: keyof Note, value: string) => {
    if (!note) return;
    setIsDirty(true);
    setNote({ ...note, [field]: value });
  };

  // Back with discard check
  const handleBack = () => {
    if (!isDirty) {
      router.back();
      return;
    }

    Alert.alert(
      "Discard changes?",
      "You have unsaved changes. Do you want to discard them?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => router.back(),
        },
      ],
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not found
  if (!note) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Note not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={{ color: colors.primary }}>← Back</Text>
        </TouchableOpacity>

        {isSaving ? (
          <Text style={[styles.saveStatus, { color: colors.text + "80" }]}>
            Saving...
          </Text>
        ) : isDirty ? (
          <Text style={[styles.saveStatus, { color: colors.text + "80" }]}>
            Unsaved changes
          </Text>
        ) : (
          <Text style={[styles.saveStatus, { color: "#22c55e" }]}>✓ Saved</Text>
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll}>
        <TextInput
          value={note.title}
          onChangeText={(t) => handleNoteChange("title", t)}
          onBlur={saveNote}
          placeholder="Title"
          placeholderTextColor={colors.text + "50"}
          style={[styles.title, { color: colors.text }]}
        />

        {note.type === "preaching" && (
          <View style={styles.meta}>
            <TextInput
              value={note.speaker || ""}
              onChangeText={(s) => handleNoteChange("speaker", s)}
              onBlur={saveNote}
              placeholder="Speaker"
              placeholderTextColor={colors.text + "50"}
              style={[styles.metaText, { color: colors.text }]}
            />
            <TextInput
              value={note.date || ""}
              onChangeText={(d) => handleNoteChange("date", d)}
              onBlur={saveNote}
              placeholder="Date"
              placeholderTextColor={colors.text + "50"}
              style={[styles.metaText, { color: colors.text }]}
            />
          </View>
        )}

        <TextInput
          value={note.content}
          onChangeText={(c) => handleNoteChange("content", c)}
          onBlur={saveNote}
          placeholder="Write your note..."
          placeholderTextColor={colors.text + "50"}
          style={[styles.content, { color: colors.text }]}
          multiline
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: { padding: 4 },
  saveStatus: { fontSize: 12, fontWeight: "500" },
  scroll: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  meta: { marginBottom: 12 },
  metaText: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    textAlignVertical: "top",
    minHeight: 200,
  },
});
