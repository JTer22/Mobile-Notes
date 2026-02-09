"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface Note {
  type: "free" | "preaching";
  title: string;
  content: string;
  date?: string;
  speaker?: string;
  lastEdited: number;
}

export default function EditNote() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const index = params?.index ? parseInt(params.index as string, 10) : NaN;

  const [note, setNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadNote = async () => {
    if (isNaN(index)) return;
    const saved = await AsyncStorage.getItem("notes");
    const notes: Note[] = saved ? JSON.parse(saved) : [];
    setNote(notes[index] || null);
  };

  useEffect(() => {
    loadNote();
  }, [index]);

  const saveNote = async () => {
    if (!note || isNaN(index)) return;
    setIsSaving(true);
    try {
      const saved = await AsyncStorage.getItem("notes");
      const notes: Note[] = saved ? JSON.parse(saved) : [];
      notes[index] = { ...note, lastEdited: Date.now() };
      await AsyncStorage.setItem("notes", JSON.stringify(notes));
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = () => {
    if (isNaN(index)) return;
    Alert.alert("Delete Note", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const saved = await AsyncStorage.getItem("notes");
          const notes: Note[] = saved ? JSON.parse(saved) : [];
          notes.splice(index, 1);
          await AsyncStorage.setItem("notes", JSON.stringify(notes));
          router.back();
        },
      },
    ]);
  };

  if (!note) {
    return (
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TextInput
          value={note.title}
          onChangeText={(t) => setNote({ ...note, title: t })}
          placeholder="Title"
          placeholderTextColor={colors.text + "50"}
          style={[styles.title, { color: colors.text }]}
        />

        {note.type === "preaching" && (
          <View style={styles.meta}>
            <TextInput
              value={note.speaker || ""}
              onChangeText={(s) => setNote({ ...note, speaker: s })}
              placeholder="Speaker"
              placeholderTextColor={colors.text + "50"}
              style={[styles.metaText, { color: colors.text }]}
            />
            <TextInput
              value={note.date || ""}
              onChangeText={(d) => setNote({ ...note, date: d })}
              placeholder="Date"
              placeholderTextColor={colors.text + "50"}
              style={[styles.metaText, { color: colors.text }]}
            />
          </View>
        )}

        <TextInput
          value={note.content}
          onChangeText={(c) => setNote({ ...note, content: c })}
          placeholder="Start writing your note..."
          placeholderTextColor={colors.text + "50"}
          style={[styles.content, { color: colors.text }]}
          multiline
          scrollEnabled
        />
      </ScrollView>

      <View style={styles.buttonGroup}>
        <Pressable
          style={[
            styles.button,
            { backgroundColor: colors.primary, opacity: isSaving ? 0.6 : 1 },
          ]}
          onPress={saveNote}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>
            {isSaving ? "Saving..." : "Save"}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.button, { backgroundColor: "#ef4444" }]}
          onPress={deleteNote}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "space-between" },
  scroll: { paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    marginRight: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 300,
    textAlignVertical: "top",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
