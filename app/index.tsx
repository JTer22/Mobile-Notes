"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import type { Note } from "./utils/noteUtils";
import { getContrastColor, stripHtmlTags } from "./utils/noteUtils";

const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const PADDING = 12;
const CARD_WIDTH = (width - PADDING * 2 - CARD_GAP) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isFocused = useIsFocused();

  const loadNotes = async () => {
    const saved = await AsyncStorage.getItem("notes");
    setNotes(saved ? JSON.parse(saved) : []);
  };

  useEffect(() => {
    if (isFocused) loadNotes();
  }, [isFocused]);

  const deleteNote = (index: number) => {
    Alert.alert("Delete Note", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = [...notes];
          updated.splice(index, 1);
          setNotes(updated);
          await AsyncStorage.setItem("notes", JSON.stringify(updated));
        },
      },
    ]);
  };

  const navigateToAdd = (type: "free" | "preaching") => {
    setModalVisible(false);
    router.push(type === "free" ? "/add-note/freeNote" : "/add-note/preaching");
  };

  const renderCard = ({ item, index }: { item: Note; index: number }) => {
    const textColor = item.color ? getContrastColor(item.color) : colors.text;

    return (
      <Pressable
        style={[styles.card, { backgroundColor: item.color || colors.card }]}
        onPress={() =>
          router.push({
            pathname: "/preview",
            params: { index: index.toString() },
          })
        }
      >
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {item.title || "Untitled"}
        </Text>

        {item.type === "preaching" && item.speaker && (
          <Text style={[styles.speaker, { color: textColor }]}>
            {item.speaker}
          </Text>
        )}

        <ScrollView style={{ flex: 1, marginTop: 8 }}>
          <Text
            style={[styles.content, { color: textColor }]}
            numberOfLines={6}
          >
            {stripHtmlTags(item.content)}
          </Text>
        </ScrollView>

        <Pressable style={styles.deleteBtn} onPress={() => deleteNote(index)}>
          <Text style={{ fontSize: 16, color: "#666" }}>🗑️</Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <Header
        isMenuOpen={menuOpen}
        onMenuPress={() => setMenuOpen((p) => !p)}
      />

      {notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No notes yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text }]}>
            Tap + to create your first note
          </Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={{ gap: CARD_GAP, paddingHorizontal: PADDING }}
          contentContainerStyle={{
            gap: CARD_GAP,
            paddingBottom: 80,
            paddingTop: CARD_GAP,
          }}
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose Note Type
            </Text>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => navigateToAdd("free")}
            >
              <Text style={styles.modalButtonText}>Free Note</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={() => navigateToAdd("preaching")}
            >
              <Text style={styles.modalButtonText}>Preaching Note</Text>
            </Pressable>
            <Pressable
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.text }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    width: CARD_WIDTH,
    minHeight: 180,
    borderRadius: 16,
    padding: 16,
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "700" },
  speaker: { fontSize: 14, fontWeight: "500", marginTop: 4 },
  content: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  deleteBtn: { position: "absolute", top: 8, right: 8 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: "#fff", fontSize: 28, fontWeight: "600" },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: PADDING,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center", maxWidth: 220 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000060",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  modalButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 6,
  },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalCancel: {
    marginTop: 12,
    paddingVertical: 12,
    width: "100%",
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelText: { fontSize: 16, fontWeight: "600" },
});
