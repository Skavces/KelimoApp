import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
  Pressable,
  Dimensions,
  Platform,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import { Search, BookOpen } from "lucide-react-native"

type Word = {
  id: string
  text: string
  meaning: string
  example: string | null
  level: string | null
}

const { width: W } = Dimensions.get("window")

function pickNumColumns() {
  if (W >= 900) return 4
  if (W >= 650) return 3
  return 2
}

export default function MyWordsScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL

  const [token, setToken] = useState<string | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [numColumns, setNumColumns] = useState(pickNumColumns())

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", () => {
      setNumColumns(pickNumColumns())
    })
    return () => sub.remove()
  }, [])

  useEffect(() => {
    ;(async () => {
      const t = await AsyncStorage.getItem("token")
      setToken(t)
    })()
  }, [])

  const fetchLearnedWords = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }
    if (!apiUrl) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${apiUrl}/words/learned`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("learned fetch failed")
      const data = await res.json()

      // backend zaten doğru format dönüyorsa direkt set
      setWords(Array.isArray(data) ? data : [])
    } catch {
      setWords([])
    } finally {
      setLoading(false)
    }
  }, [token, apiUrl])

  useEffect(() => {
    fetchLearnedWords()
  }, [fetchLearnedWords])

  useFocusEffect(
    useCallback(() => {
      fetchLearnedWords()
    }, [fetchLearnedWords])
  )

  const filteredWords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return words
    return words.filter(
      (w) =>
        w.text?.toLowerCase().includes(q) ||
        w.meaning?.toLowerCase().includes(q)
    )
  }, [words, searchTerm])

  const renderItem = ({ item }: { item: Word }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.levelPill}>
            <Text style={styles.levelText}>{(item.level || "GENEL").toUpperCase()}</Text>
          </View>
          <BookOpen size={16} color="#64748b" />
        </View>

        <Text style={styles.wordText} numberOfLines={1}>
          {item.text}
        </Text>

        <Text style={styles.meaningText} numberOfLines={2}>
          {item.meaning}
        </Text>

        {item.example ? (
          <View style={styles.exampleWrap}>
            <Text style={styles.exampleText} numberOfLines={2}>
              "{item.example}"
            </Text>
          </View>
        ) : null}
      </View>
    )
  }

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Kelime Koleksiyonum</Text>
          <View style={styles.countRow}>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{words.length}</Text>
            </View>
            <Text style={styles.countText}>kelime öğrendin</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Koleksiyonda ara..."
            placeholderTextColor="#64748b"
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {!!searchTerm && (
            <Pressable onPress={() => setSearchTerm("")} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>×</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#a78bfa" />
          <Text style={styles.muted}>Kelimeler yükleniyor…</Text>
          <View style={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={i} style={styles.skeleton} />
            ))}
          </View>
        </View>
      ) : filteredWords.length > 0 ? (
        <FlatList
          data={filteredWords}
          key={numColumns} // columns değişince düzgün re-render
          numColumns={numColumns}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrap : undefined}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <BookOpen size={28} color="#64748b" />
          </View>
          <Text style={styles.emptyTitle}>
            {searchTerm ? "Sonuç bulunamadı" : "Listen henüz boş"}
          </Text>
          <Text style={styles.emptyDesc}>
            {searchTerm
              ? `"${searchTerm}" aramasıyla eşleşen bir kelime bulamadık.`
              : "Öğrenmeye başladığında kelimelerin burada birikecek."}
          </Text>

          <Pressable onPress={fetchLearnedWords} style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}>
            <Text style={styles.retryText}>Yenile</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: Platform.OS === "android" ? 60 : 60,
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 10,
  },

  countRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  countPill: {
    backgroundColor: "rgba(167,139,250,0.15)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countPillText: { color: "#c4b5fd", fontWeight: "900", fontSize: 12 },
  countText: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },

  searchWrap: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0a0f1e",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    color: "#e2e8f0",
    fontSize: 14,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0b1220",
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: { color: "#94a3b8", fontSize: 18, fontWeight: "900", marginTop: -2 },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrap: {
    gap: 12,
  },

  card: {
    flex: 1,
    backgroundColor: "#0a0f1e",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  levelPill: {
    backgroundColor: "#0b1220",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  levelText: { color: "#94a3b8", fontSize: 10, fontWeight: "900", letterSpacing: 0.6 },

  wordText: { color: "#f8fafc", fontSize: 18, fontWeight: "900", marginBottom: 6 },
  meaningText: { color: "#cbd5e1", fontSize: 13, fontWeight: "600", lineHeight: 18 },

  exampleWrap: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  exampleText: { color: "#94a3b8", fontSize: 11, fontStyle: "italic", lineHeight: 16 },

  loadingWrap: { padding: 16, alignItems: "center", gap: 10 },
  muted: { color: "#94a3b8" },

  skeletonGrid: {
    width: "100%",
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  skeleton: {
    width: "48%",
    height: 120,
    backgroundColor: "#1e293b",
    borderRadius: 18,
    opacity: 0.6,
  },

  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0a0f1e",
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "900", marginBottom: 8 },
  emptyDesc: { color: "#94a3b8", textAlign: "center", lineHeight: 20 },

  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0b1220",
  },
  retryText: { color: "#a78bfa", fontWeight: "900" },

  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
})
