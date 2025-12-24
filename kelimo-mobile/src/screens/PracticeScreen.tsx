import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  FlatList,
  Alert,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import {
  Languages,
  Type,
  AlertCircle,
  Play,
  Puzzle,
  Quote,
  Brain,
  Mic,
} from "lucide-react-native"

type GameCard = {
  key: string
  title: string
  desc: string
  color: string
  iconBg: string
  Icon: any
  onPress: () => void
}

export default function PracticeScreen({ navigation }: any) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL
  const MIN_WORD_COUNT = 5

  const [token, setToken] = useState<string | null>(null)
  const [learnedCount, setLearnedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const t = await AsyncStorage.getItem("token")
      setToken(t)
    })()
  }, [])

  const fetchStats = useCallback(async () => {
    // token daha gelmediyse burada bekleyelim (loading’i false’a çekme)
    if (!token) return

    if (!apiUrl) {
      setLoading(false)
      Alert.alert("Hata", "EXPO_PUBLIC_API_URL tanımlı değil.")
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${apiUrl}/words/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("stats failed")
      const data = await res.json()
      setLearnedCount(data.learnedCount || 0)
    } catch {
      setLearnedCount(0)
    } finally {
      setLoading(false)
    }
  }, [token, apiUrl])

  useEffect(() => {
    if (token) fetchStats()
  }, [token, fetchStats])

  useFocusEffect(
    useCallback(() => {
      if (token) fetchStats()
    }, [token, fetchStats])
  )

  const locked = learnedCount < MIN_WORD_COUNT

  const handleStartGame = (routeName: string, params?: any) => {
    if (locked) return
    navigation?.navigate?.(routeName, params)
  }

  const cards: GameCard[] = useMemo(
    () => [
      {
        key: "EN_TR",
        title: "Kelime Eşleştirme",
        desc: "İngilizce kelimeyi veriyoruz, doğru Türkçe anlamını bul.",
        color: "#a78bfa",
        iconBg: "rgba(167,139,250,0.18)",
        Icon: Languages,
        onPress: () => handleStartGame("PracticeGame", { mode: "EN_TR" }),
      },
      {
        key: "TR_EN",
        title: "Ters Köşe",
        desc: "Türkçe anlamı veriyoruz, doğru İngilizce karşılığını bul.",
        color: "#e879f9",
        iconBg: "rgba(232,121,249,0.18)",
        Icon: Type,
        onPress: () => handleStartGame("PracticeGame", { mode: "TR_EN" }),
      },
      {
        key: "SCRAMBLE",
        title: "Kelime Kurmaca",
        desc: "Karışık harfleri sıraya diz, kelimeyi ortaya çıkar.",
        color: "#22d3ee",
        iconBg: "rgba(34,211,238,0.18)",
        Icon: Puzzle,
        onPress: () => handleStartGame("Scramble"),
      },
      {
        key: "FILL",
        title: "Cümle Tamamlama",
        desc: "Boşluğa hangi kelime gelir? Bağlamı yakala.",
        color: "#fb923c",
        iconBg: "rgba(251,146,60,0.18)",
        Icon: Quote,
        onPress: () => handleStartGame("FillBlank"),
      },
      {
        key: "MEMORY",
        title: "Hafıza Kartları",
        desc: "Kartları çevir, eşleri bul. Kelime-anlam eşleştir.",
        color: "#fb7185",
        iconBg: "rgba(251,113,133,0.18)",
        Icon: Brain,
        onPress: () => handleStartGame("Memory"),
      },
      {
        key: "DICTATION",
        title: "Dinle ve Yaz",
        desc: "Duyduğun kelimeyi doğru harflerle yaz.",
        color: "#60a5fa",
        iconBg: "rgba(96,165,250,0.18)",
        Icon: Mic,
        onPress: () => handleStartGame("Dictation"),
      },
    ],
    [locked]
  )

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#a78bfa" />
        <Text style={styles.muted}>Hazırlanıyor…</Text>
      </View>
    )
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.h1}>Alıştırma Merkezi 🎮</Text>
        <Text style={styles.subtitle}>Hafızanı test et ve öğrendiklerini pekiştir.</Text>
      </View>

      {locked && (
        <View style={styles.warning}>
          <AlertCircle size={20} color="#f59e0b" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Yetersiz Kelime Sayısı</Text>
            <Text style={styles.warningText}>
              Oyunları oynayabilmek için en az {MIN_WORD_COUNT} kelime öğrenmelisin. Şu an {learnedCount} kelime biliyorsun.
            </Text>

            <Pressable
              onPress={() => navigation?.navigate?.("Learn")}
              style={({ pressed }) => [styles.warningBtn, pressed && styles.pressed]}
            >
              <Text style={styles.warningBtnText}>Hemen Kelime Öğren →</Text>
            </Pressable>
          </View>
        </View>
      )}

      <FlatList
        data={cards}
        keyExtractor={(i) => i.key}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const Icon = item.Icon
          return (
            <Pressable
              onPress={item.onPress}
              disabled={locked}
              style={({ pressed }) => [
                styles.card,
                locked && styles.cardLocked,
                pressed && !locked && styles.pressed,
              ]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconBox, { backgroundColor: item.iconBg, borderColor: item.color + "33" }]}>
                  <Icon size={26} color={item.color} />
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>

              <View style={styles.cardFooter}>
                <Play size={16} color={locked ? "#64748b" : item.color} />
                <Text style={[styles.cardFooterText, { color: locked ? "#64748b" : item.color }]}>
                  Oyuna Başla
                </Text>
              </View>
            </Pressable>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0f172a", paddingTop: 48},

  header: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 },
  h1: { color: "#f8fafc", fontSize: 28, fontWeight: "900", marginBottom: 6 },
  subtitle: { color: "#94a3b8", fontSize: 14, lineHeight: 20 },

  warning: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
    flexDirection: "row",
    gap: 12,
  },
  warningTitle: { color: "#fbbf24", fontWeight: "900", marginBottom: 4 },
  warningText: { color: "#f59e0b", lineHeight: 18, fontSize: 12, opacity: 0.95 },
  warningBtn: { marginTop: 10 },
  warningBtnText: { color: "#fde68a", fontWeight: "900", textDecorationLine: "underline" },

  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },

  card: {
    backgroundColor: "#0a0f1e",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  cardLocked: { opacity: 0.55 },

  cardTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  cardTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "900", marginBottom: 8 },
  cardDesc: { color: "#94a3b8", fontSize: 13, lineHeight: 18, marginBottom: 16 },

  cardFooter: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardFooterText: { fontWeight: "900" },

  center: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center", gap: 10 },
  muted: { color: "#94a3b8" },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
})
