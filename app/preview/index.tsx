"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
import { WebView } from "react-native-webview";
import { COLORS } from "../noteConfig";
import type { Note } from "../utils/noteUtils";
import { wrapHtmlContent } from "../utils/noteUtils";

export default function PreviewNote() {
  const { colors, dark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#fff");
  const richText = useRef<RichEditor>(null);

  // Load note from AsyncStorage
  useEffect(() => {
    const loadNote = async () => {
      try {
        const saved = await AsyncStorage.getItem("notes");
        const notes = saved ? JSON.parse(saved) : [];
        const noteIndex = parseInt(params.index as string, 10);
        if (!isNaN(noteIndex) && notes[noteIndex]) {
          const n = notes[noteIndex];
          setNote(n);
          setSelectedColor(n.color || "#fff");
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadNote();
  }, [params.index]);

  if (!note) {
    return (
      <Text style={{ color: dark ? "#fff" : "#000", padding: 16 }}>
        Loading...
      </Text>
    );
  }

  // Save note to AsyncStorage
  const saveNote = async () => {
    try {
      const saved = await AsyncStorage.getItem("notes");
      const notes = saved ? JSON.parse(saved) : [];
      const noteIndex = parseInt(params.index as string, 10);
      if (!isNaN(noteIndex) && notes[noteIndex]) {
        notes[noteIndex] = {
          ...note,
          color: selectedColor,
          lastEdited: Date.now(),
        };
        await AsyncStorage.setItem("notes", JSON.stringify(notes));
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Metadata */}
        <TextInput
          value={note.title || ""}
          editable={isEditing}
          placeholder="Title"
          placeholderTextColor={dark ? "#aaa" : "#666"}
          style={[
            styles.metaInput,
            {
              color: dark ? "#fff" : "#000",
              borderBottomColor: dark ? "#555" : "#ccc",
              opacity: isEditing ? 1 : 0.6,
            },
          ]}
          onChangeText={(text) => setNote({ ...note, title: text })}
        />
        {note.type === "preaching" && (
          <>
            <TextInput
              value={note.date || ""}
              editable={isEditing}
              placeholder="Date"
              placeholderTextColor={dark ? "#aaa" : "#666"}
              style={[
                styles.metaInput,
                {
                  color: dark ? "#fff" : "#000",
                  borderBottomColor: dark ? "#555" : "#ccc",
                  opacity: isEditing ? 1 : 0.6,
                },
              ]}
              onChangeText={(text) => setNote({ ...note, date: text })}
            />
            <TextInput
              value={note.speaker || ""}
              editable={isEditing}
              placeholder="Speaker"
              placeholderTextColor={dark ? "#aaa" : "#666"}
              style={[
                styles.metaInput,
                {
                  color: dark ? "#fff" : "#000",
                  borderBottomColor: dark ? "#555" : "#ccc",
                  opacity: isEditing ? 1 : 0.6,
                },
              ]}
              onChangeText={(text) => setNote({ ...note, speaker: text })}
            />
          </>
        )}

        {/* Color Picker */}
        {isEditing && (
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
        )}

        {/* Rich Text Toolbar */}
        {isEditing && (
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
        )}

        {/* Rich Text Editor */}
        <Pressable onPress={() => setIsEditing(true)} style={{ flex: 1 }}>
          <View
            style={[styles.editorContainer, { backgroundColor: selectedColor }]}
          >
            {isEditing ? (
              <RichEditor
                ref={richText}
                initialContentHTML={note.content}
                onChange={(text) => setNote({ ...note, content: text })}
                editorStyle={{
                  backgroundColor: selectedColor,
                  color: dark ? "#fff" : "#000",
                  placeholderColor: "#666",
                }}
                style={styles.richEditor}
              />
            ) : (
              <WebView
                style={styles.richEditor}
                scrollEnabled={true}
                source={{
                  html: wrapHtmlContent(
                    note.content,
                    selectedColor,
                    dark ? "#fff" : "#000",
                  ),
                }}
                originWhitelist={["*"]}
                scalesPageToFit={true}
              />
            )}
          </View>
        </Pressable>

        {/* Save Button */}
        {isEditing && (
          <View style={styles.buttonGroup}>
            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={saveNote}
            >
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            <Pressable
              style={[styles.button, { backgroundColor: "#6b7280" }]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  editorContainer: {
    flex: 1,
    borderRadius: 12,
    minHeight: 300,
    padding: 8,
    marginBottom: 12,
  },
  richEditor: { flex: 1, minHeight: 300 },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
