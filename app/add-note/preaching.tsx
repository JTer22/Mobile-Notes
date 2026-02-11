"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
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
import { COLORS } from "../noteConfig";
import { sanitizeNote } from "../utils/noteUtils";

export default function PreachingNote() {
  const router = useRouter();
  const { colors, dark } = useTheme();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("#fff");
  const [isSaving, setIsSaving] = useState(false);
  const richText = useRef<RichEditor>(null);

  const canSave = title.trim() && content.trim();

  const saveNote = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const saved = await AsyncStorage.getItem("notes");
      const notes = saved ? JSON.parse(saved) : [];
      const newNote = sanitizeNote({
        type: "preaching",
        title,
        date,
        speaker,
        content,
        lastEdited: Date.now(),
        color: selectedColor,
      });
      notes.push(newNote);
      await AsyncStorage.setItem("notes", JSON.stringify(notes));
      router.back();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Metadata */}
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={dark ? "#aaa" : "#666"}
        style={[
          styles.metaInput,
          {
            color: dark ? "#fff" : "#000",
            borderBottomColor: dark ? "#555" : "#ccc",
          },
        ]}
      />
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="Date"
        placeholderTextColor={dark ? "#aaa" : "#666"}
        style={[
          styles.metaInput,
          {
            color: dark ? "#fff" : "#000",
            borderBottomColor: dark ? "#555" : "#ccc",
          },
        ]}
      />
      <TextInput
        value={speaker}
        onChangeText={setSpeaker}
        placeholder="Speaker"
        placeholderTextColor={dark ? "#aaa" : "#666"}
        style={[
          styles.metaInput,
          {
            color: dark ? "#fff" : "#000",
            borderBottomColor: dark ? "#555" : "#ccc",
          },
        ]}
      />

      {/* Color Picker */}
      <View style={styles.colorRow}>
        {COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setSelectedColor(c)}
            style={[
              styles.colorCircle,
              {
                backgroundColor: c,
                borderWidth: selectedColor === c ? 2 : 0,
                borderColor: "#000",
              },
            ]}
          />
        ))}
      </View>

      {/* Rich Text Toolbar */}
      <RichToolbar
        editor={richText}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.insertBulletsList,
          actions.setStrikethrough,
        ]}
        iconTint={dark ? "#fff" : "#000"}
        selectedIconTint="#3498db"
      />

      {/* Rich Text Editor */}
      <ScrollView
        style={[styles.editorContainer, { backgroundColor: selectedColor }]}
      >
        <RichEditor
          ref={richText}
          initialContentHTML={content}
          onChange={setContent}
          placeholder="Write your preaching note..."
          editorStyle={{
            backgroundColor: selectedColor,
            color: "#000",
            placeholderColor: "#666",
          }}
          style={styles.richEditor}
        />
      </ScrollView>

      <Pressable
        style={[
          styles.button,
          { backgroundColor: colors.primary, opacity: canSave ? 1 : 0.5 },
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
  container: { flex: 1, padding: 16 },
  metaInput: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingVertical: 6,
  },
  colorRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
  editorContainer: { flex: 1, borderRadius: 12, minHeight: 300, padding: 8 },
  richEditor: { flex: 1, minHeight: 300 },
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
