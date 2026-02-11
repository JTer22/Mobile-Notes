"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import type { Note } from "../utils/noteUtils";
import { sanitizeNote } from "../utils/noteUtils";

const COLORS = [
  "#ffffff",
  "#fef3c7",
  "#dbeafe",
  "#dcfce7",
  "#fce7f3",
  "#e9d5ff",
];

export default function EditNote() {
  const router = useRouter();
  const { colors, dark } = useTheme();
  const params = useLocalSearchParams();
  const index = params.index ? parseInt(params.index as string, 10) : NaN;

  const [note, setNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const richText = useRef<RichEditor>(null);

  // Load note
  const loadNote = async () => {
    if (isNaN(index)) return;
    const saved = await AsyncStorage.getItem("notes");
    const notes: Note[] = saved ? JSON.parse(saved) : [];
    setNote(notes[index] || null);
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
      const updatedNote = sanitizeNote({
        ...note,
        lastEdited: Date.now(),
      });
      notes[index] = updatedNote;
      await AsyncStorage.setItem("notes", JSON.stringify(notes));
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete note
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
    <View
      style={[
        styles.container,
        { backgroundColor: note.color || colors.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title Input */}
        <TextInput
          value={note.title}
          onChangeText={(t) => setNote({ ...note, title: t })}
          placeholder="Title"
          placeholderTextColor={dark ? "#ffffff80" : colors.text + "80"}
          style={[
            styles.title,
            {
              color: dark ? "#fff" : colors.text,
              borderBottomColor: dark ? "#fff20" : colors.text + "20",
            },
          ]}
        />

        {note.type === "preaching" && (
          <View style={styles.meta}>
            {/* Speaker */}
            <TextInput
              value={note.speaker || ""}
              onChangeText={(s) => setNote({ ...note, speaker: s })}
              placeholder="Speaker"
              placeholderTextColor={dark ? "#ffffff80" : colors.text + "50"}
              style={[styles.metaText, { color: dark ? "#fff" : colors.text }]}
            />
            {/* Date */}
            <TextInput
              value={note.date || ""}
              onChangeText={(d) => setNote({ ...note, date: d })}
              placeholder="Date"
              placeholderTextColor={dark ? "#ffffff80" : colors.text + "50"}
              style={[styles.metaText, { color: dark ? "#fff" : colors.text }]}
            />
          </View>
        )}

        {/* Color Picker */}
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setNote({ ...note, color: c })}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: c,
                  borderWidth: note.color === c ? 2 : 0,
                  borderColor: "#000",
                },
              ]}
            />
          ))}
        </View>

        {/* Rich Text Editor */}
        <RichEditor
          ref={richText}
          initialContentHTML={note.content}
          onChange={(html) => setNote({ ...note, content: html })}
          editorStyle={{
            backgroundColor: note.color || colors.card,
            color: "#000", // always black for content
            placeholderColor: "#888",
            contentCSSText: "font-size: 16px; line-height: 24px;",
          }}
          placeholder="Write your note..."
          style={styles.richEditor}
        />

        {/* Rich Text Toolbar on top of editor */}
        <RichToolbar
          editor={richText}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.insertBulletsList,
            actions.setStrikethrough,
            actions.setUnderline,
            actions.heading1,
            actions.undo,
            actions.redo,
          ]}
          iconTint="#000"
          selectedIconTint={colors.primary}
          style={styles.richToolbar}
        />
      </ScrollView>

      {/* Save & Delete Buttons */}
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
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metaText: { fontSize: 14, fontWeight: "500", flex: 1, marginRight: 12 },
  contentWrapper: { flex: 1, borderRadius: 12, padding: 16, minHeight: 300 },
  richEditor: { flex: 1, minHeight: 300, borderRadius: 12, padding: 12 },
  richToolbar: {
    borderTopWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    backgroundColor: "#eee",
    borderRadius: 12,
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
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  colorRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  colorCircle: { width: 28, height: 28, borderRadius: 14 },
});
