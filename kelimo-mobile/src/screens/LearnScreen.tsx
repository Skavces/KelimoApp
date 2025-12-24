import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Animated,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import * as Speech from "expo-speech"
import { Volume2, Check } from "lucide-react-native"

type WordCard = {
  id: string
  word: string
  meaning: string
  example: string
}

const { height: H } = Dimensions.get("window")

export default function LearnScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL

  const [token, setToken] = useState<string | null>(null)
  const [words, setWords] = useState<WordCard[]>([])
  const [loading, setLoading] = useState(true)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showMeaning, setShowMeaning] = useState<Record<string, boolean>>({})
  const [learnedIds, setLearnedIds] = useState<string[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)

  const listRef = useRef<FlatList<WordCard>>(null)
  const flipAnims = useRef<Record<string, Animated.Value>>({})

  useEffect(() => {
    ;(async () => {
      const t = await AsyncStorage.getItem("token")
      setToken(t)
    })()
  }, [])

  const total = words.length

  const fetchWords = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }
    if (!apiUrl) {
      setLoading(false)
      Alert.alert("Hata", "EXPO_PUBLIC_API_URL tanımlı değil.")
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${apiUrl}/words/feed`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("feed failed")
      const data = await res.json()

      const mapped: WordCard[] = (data || []).map((w: any) => ({
        id: String(w.id),
        word: w.text,
        meaning: w.meaning,
        example: w.example ?? "",
      }))

      setWords(mapped)
      setCurrentIndex(0)
      setShowMeaning({})
      setLearnedIds([])
      flipAnims.current = {}
    } catch {
      Alert.alert("Hata", "Kelime feed alınamadı.")
    } finally {
      setLoading(false)
    }
  }, [token, apiUrl])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  useFocusEffect(
    useCallback(() => {
      fetchWords()
      return () => {
        Speech.stop()
        setIsSpeaking(false)
      }
    }, [fetchWords])
  )

  const speak = (text: string) => {
    try {
      Speech.stop()
      setIsSpeaking(true)
      Speech.speak(text, {
        language: "en-US",
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      })
    } catch {
      setIsSpeaking(false)
    }
  }

  const getFlipAnim = (id: string) => {
    if (!flipAnims.current[id]) {
      flipAnims.current[id] = new Animated.Value(0)
    }
    return flipAnims.current[id]
  }

  const toggleMeaning = (id: string) => {
    const isShowing = showMeaning[id]
    const flipAnim = getFlipAnim(id)

    Animated.spring(flipAnim, {
      toValue: isShowing ? 0 : 180,
      useNativeDriver: true,
      friction: 8,
      tension: 10,
    }).start()

    setShowMeaning((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const markLearned = async (id: string) => {
    if (!learnedIds.includes(id)) setLearnedIds((p) => [...p, id])

    if (token && apiUrl) {
      try {
        await fetch(`${apiUrl}/words/${id}/swipe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "LEARNED" }),
        })
      } catch {}
    }

    if (currentIndex < total - 1) {
      const next = currentIndex + 1
      setCurrentIndex(next)
      setShowMeaning({})
      listRef.current?.scrollToIndex({ index: next, animated: true })
    }
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const first = viewableItems?.[0]
    if (first?.index != null) {
      setCurrentIndex(first.index)
      setShowMeaning({})
    }
  }).current

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 80 }),
    []
  )

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={styles.muted}>Kelimeler yükleniyor…</Text>
      </View>
    )
  }

  if (!loading && total === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.emptyIcon}>🎉</View>
        <Text style={styles.emptyTitle}>Harika İş Çıkardın!</Text>
        <Text style={styles.muted}>Tüm kelimeleri tamamladın. Şimdi tekrar zamanı!</Text>
        <Pressable style={styles.retryBtn} onPress={fetchWords}>
          <Text style={styles.retryText}>Yenile</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.page}>
      {/* Reels list */}
      <FlatList
        ref={listRef}
        data={words}
        keyExtractor={(item) => item.id}
        pagingEnabled
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => {
          const flipAnim = getFlipAnim(item.id)
          const isFlipped = showMeaning[item.id]

          const frontRotate = flipAnim.interpolate({
            inputRange: [0, 180],
            outputRange: ["0deg", "180deg"],
          })

          const backRotate = flipAnim.interpolate({
            inputRange: [0, 180],
            outputRange: ["180deg", "360deg"],
          })

          const frontOpacity = flipAnim.interpolate({
            inputRange: [0, 90, 180],
            outputRange: [1, 0, 0],
          })

          const backOpacity = flipAnim.interpolate({
            inputRange: [0, 90, 180],
            outputRange: [0, 0, 1],
          })

          return (
            <View style={styles.screen}>
              <View style={styles.cardWrap}>
                <View style={styles.cardContainer}>
                  {/* Front Side */}
                  <Animated.View
                    pointerEvents={isFlipped ? "none" : "auto"}
                    style={[
                      styles.card,
                      styles.cardFront,
                      { 
                        transform: [{ rotateY: frontRotate }],
                        opacity: frontOpacity,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() => speak(item.word)}
                      style={({ pressed }) => [
                        styles.speakBtn,
                        isSpeaking && styles.speakingRing,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Volume2 size={18} color="#e9d5ff" />
                      <Text style={styles.speakText}>Telaffuz</Text>
                    </Pressable>

                    <View style={styles.wordWrap}>
                      <Text style={styles.word}>{item.word}</Text>
                    </View>

                    <View style={styles.body}>
                      <View style={styles.hintBox}>
                        <Text style={styles.hintEmoji}>🤔</Text>
                        <Text style={styles.hintText}>
                          Anlamını ve örnek cümleyi öğrenmek için aşağıdaki{" "}
                          <Text style={styles.hintAccent}>Çevir</Text> butonuna dokun
                        </Text>
                      </View>
                    </View>
                  </Animated.View>

                  {/* Back Side */}
                  <Animated.View
                    pointerEvents={isFlipped ? "auto" : "none"}
                    style={[
                      styles.card,
                      styles.cardBack,
                      { 
                        transform: [{ rotateY: backRotate }],
                        opacity: backOpacity,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() => speak(item.word)}
                      style={({ pressed }) => [
                        styles.speakBtn,
                        isSpeaking && styles.speakingRing,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Volume2 size={18} color="#e9d5ff" />
                      <Text style={styles.speakText}>Telaffuz</Text>
                    </Pressable>

                    <View style={styles.wordWrap}>
                      <Text style={styles.word}>{item.word}</Text>
                    </View>

                    <View style={styles.body}>
                      <View style={styles.infoStack}>
                        <View style={styles.infoBox}>
                          <Text style={styles.infoLabel}>🇹🇷 Türkçe Anlamı</Text>
                          <Text style={styles.infoValue}>{item.meaning}</Text>
                        </View>

                        {item.example ? (
                          <View style={styles.exampleBox}>
                            <Text style={styles.infoLabel2}>💬 Örnek Cümle</Text>
                            <Text style={styles.example}>"{item.example}"</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </Animated.View>

                  {/* Actions - Outside both cards */}
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => toggleMeaning(item.id)}
                      style={({ pressed }) => [
                        styles.btnFlip, 
                        pressed && styles.pressed
                      ]}
                    >
                      <Text style={styles.btnFlipText}>
                        {showMeaning[item.id] ? "Çevir" : "Çevir"}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => markLearned(item.id)}
                      style={({ pressed }) => [
                        styles.btnPrimary, 
                        pressed && styles.pressed
                      ]}
                    >
                      <Check size={20} color="#fff" strokeWidth={3} />
                      <Text style={styles.btnPrimaryText}>Öğrendim</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.footerHint}>
                    {currentIndex < total - 1 ? "↑ Yukarı kaydırarak devam et" : "🎊 Tebrikler! Tüm kelimeler bitti"}
                  </Text>
                </View>

                {/* Glow effects */}
                <View style={styles.glowPurple} />
                <View style={styles.glowBlue} />
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: "#0a0f1e",
  },

  screen: {
    height: H,
    paddingTop: 90,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  cardWrap: { 
    width: "100%", 
    alignSelf: "center", 
    maxWidth: 440,
  },
  cardContainer: {
    minHeight: 540,
    position: "relative",
  },
  card: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#0f1629",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.15)",
    borderRadius: 28,
    padding: 24,
    minHeight: 440,
    backfaceVisibility: "hidden",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },

  speakBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(139,92,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
    marginBottom: 24,
  },
  speakText: { 
    color: "#e9d5ff", 
    fontSize: 13, 
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  speakingRing: {
    borderColor: "#a78bfa",
    backgroundColor: "rgba(139,92,246,0.25)",
    shadowColor: "#a78bfa",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },

  wordWrap: { 
    alignItems: "center", 
    marginBottom: 32,
    gap: 12,
  },
  word: { 
    color: "#f8fafc", 
    fontSize: 56, 
    fontWeight: "900", 
    textAlign: "center",
    letterSpacing: -1,
    textShadowColor: "rgba(139,92,246,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.12)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
  },
  badgeText: {
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  body: { 
    flex: 1, 
    justifyContent: "center",
  },
  hintBox: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(139,92,246,0.25)",
    backgroundColor: "rgba(139,92,246,0.04)",
    alignItems: "center",
    gap: 12,
  },
  hintEmoji: {
    fontSize: 32,
  },
  hintText: { 
    color: "#cbd5e1", 
    textAlign: "center", 
    lineHeight: 22,
    fontSize: 14,
  },
  hintAccent: { 
    color: "#c4b5fd", 
    fontWeight: "900",
  },

  infoStack: { gap: 16 },
  infoBox: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.2)",
    backgroundColor: "rgba(139,92,246,0.06)",
  },
  exampleBox: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(192,132,252,0.2)",
    backgroundColor: "rgba(192,132,252,0.04)",
  },
  infoLabel: { 
    color: "#c4b5fd", 
    fontSize: 11, 
    fontWeight: "800", 
    marginBottom: 10, 
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  infoLabel2: { 
    color: "#e9d5ff", 
    fontSize: 11, 
    fontWeight: "800", 
    marginBottom: 10, 
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  infoValue: { 
    color: "#f8fafc", 
    fontSize: 20, 
    fontWeight: "700",
    lineHeight: 28,
  },
  example: { 
    color: "#e2e8f0", 
    fontStyle: "italic", 
    lineHeight: 24,
    fontSize: 15,
  },

  actions: { 
    flexDirection: "row", 
    gap: 12, 
    marginTop: 458,
    position: "relative",
    zIndex: 3,
  },
  btnFlip: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "rgba(30,41,59,0.8)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnFlipText: { 
    color: "#e2e8f0", 
    fontWeight: "800",
    fontSize: 15,
  },

  btnPrimary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnPrimaryText: { 
    color: "#fff", 
    fontWeight: "900",
    fontSize: 15,
  },

  footerHint: { 
    textAlign: "center", 
    marginTop: 16, 
    color: "#64748b", 
    fontSize: 13, 
    position: "relative", 
    zIndex: 3,
    fontWeight: "600",
  },

  glowPurple: {
    position: "absolute",
    left: -40,
    right: -40,
    top: -40,
    bottom: -40,
    borderRadius: 60,
    backgroundColor: "rgba(139,92,246,0.06)",
    zIndex: -1,
  },
  glowBlue: {
    position: "absolute",
    left: -60,
    right: -60,
    top: -60,
    bottom: -60,
    borderRadius: 80,
    backgroundColor: "rgba(59,130,246,0.03)",
    zIndex: -2,
  },

  center: {
    flex: 1,
    backgroundColor: "#0a0f1e",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: { 
    color: "#f8fafc", 
    fontSize: 24, 
    fontWeight: "900", 
    marginBottom: 4,
    textAlign: "center",
  },
  muted: { 
    color: "#94a3b8", 
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "rgba(139,92,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
  },
  retryText: { 
    color: "#c4b5fd", 
    fontWeight: "800",
    fontSize: 15,
  },

  pressed: { 
    transform: [{ scale: 0.97 }], 
    opacity: 0.8,
  },
})