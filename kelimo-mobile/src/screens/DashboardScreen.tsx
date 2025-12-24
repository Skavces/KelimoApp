import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import { BookOpen, Target, Flame, TrendingUp } from "lucide-react-native"

type DecodedToken = {
  sub?: string
  email?: string
  name?: string
  iat?: number
  exp?: number
}

function safePercentDecode(str: string) {
  try {
    return decodeURIComponent(str)
  } catch {
    return str
  }
}

function base64Decode(str: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  let output = ""

  str = str.replace(/[\r\n\s]/g, "")
  str = str.replace(/=+$/, "")

  for (let i = 0; i < str.length; ) {
    const enc1 = chars.indexOf(str.charAt(i++))
    const enc2 = chars.indexOf(str.charAt(i++))
    const enc3 = chars.indexOf(str.charAt(i++))
    const enc4 = chars.indexOf(str.charAt(i++))

    const chr1 = (enc1 << 2) | (enc2 >> 4)
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    const chr3 = ((enc3 & 3) << 6) | enc4

    output += String.fromCharCode(chr1)
    if (enc3 !== 64 && enc3 !== -1) output += String.fromCharCode(chr2)
    if (enc4 !== 64 && enc4 !== -1) output += String.fromCharCode(chr3)
  }

  const percentEncoded = output
    .split("")
    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
    .join("")

  return safePercentDecode(percentEncoded)
}

function decodeJwt(token: string | null): DecodedToken | null {
  if (!token) return null
  try {
    const payloadPart = token.split(".")[1]
    if (!payloadPart) return null

    const base64url = payloadPart.replace(/-/g, "+").replace(/_/g, "/")
    const pad = "=".repeat((4 - (base64url.length % 4)) % 4)
    const json = base64Decode(base64url + pad)

    return JSON.parse(json)
  } catch {
    return null
  }
}

type Stats = {
  learnedCount: number
  accuracy: number
  streak: number
  totalScore: number
}

export default function DashboardScreen({ navigation }: any) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL

  const [token, setToken] = useState<string | null>(null)
  const decoded = useMemo(() => decodeJwt(token), [token])
  const displayName = decoded?.name || decoded?.email || "Öğrenci"

  const [stats, setStats] = useState<Stats>({
    learnedCount: 0,
    accuracy: 0,
    streak: 0,
    totalScore: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const t = await AsyncStorage.getItem("token")
      setToken(t)
    })()
  }, [])

  const fetchStats = useCallback(async () => {
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

      const res = await fetch(`${apiUrl}/words/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error("progress fetch failed")

      const data = await res.json()

      setStats({
        learnedCount: data.totalLearned || 0,
        accuracy: typeof data.accuracy === "number" ? data.accuracy : Number(data.accuracy) || 0,
        streak: data.streak || 0,
        totalScore: data.totalScore || 0,
      })
    } catch {
      Alert.alert("Hata", "İstatistikler alınamadı.")
    } finally {
      setLoading(false)
    }
  }, [token, apiUrl])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useFocusEffect(
    useCallback(() => {
      fetchStats()
    }, [fetchStats])
  )

  const go = (routeName: string) => {
    navigation?.navigate?.(routeName)
  }

  const accuracyText = loading ? "-" : `%${Math.round(stats.accuracy)}`

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroGradient} />
        <View style={styles.heroContent}>
          <Text style={styles.heroGreeting}>Hoş geldin 👋</Text>
          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroSubtitle}>Bugün öğrenmek için harika bir gün!</Text>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <BookOpen size={18} color="#a78bfa" />
            <Text style={styles.quickStatValue}>{loading ? "-" : stats.learnedCount}</Text>
            <Text style={styles.quickStatLabel}>Kelime</Text>
          </View>
          
          <View style={styles.quickStatDivider} />
          
          <View style={styles.quickStatItem}>
            <Target size={18} color="#34d399" />
            <Text style={styles.quickStatValue}>{accuracyText}</Text>
            <Text style={styles.quickStatLabel}>Başarı</Text>
          </View>
          
          <View style={styles.quickStatDivider} />
          
          <View style={styles.quickStatItem}>
            <Flame size={18} color={stats.streak > 0 ? "#fb923c" : "#64748b"} />
            <Text style={styles.quickStatValue}>{loading ? "-" : stats.streak}</Text>
            <Text style={styles.quickStatLabel}>Gün</Text>
          </View>
        </View>
      </View>

      {/* Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressIconWrap}>
            <TrendingUp size={20} color="#60a5fa" />
          </View>
          <Text style={styles.progressTitle}>İlerleme Durumu</Text>
        </View>
        
        <View style={styles.progressStats}>
          <View style={styles.progressStatItem}>
            <Text style={styles.progressStatValue}>{loading ? "-" : stats.learnedCount}</Text>
            <Text style={styles.progressStatLabel}>Toplam Kelime</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${Math.min((stats.learnedCount / 100) * 100, 100)}%`, backgroundColor: "#a78bfa" }]} />
            </View>
          </View>

          <View style={styles.progressStatItem}>
            <Text style={styles.progressStatValue}>{accuracyText}</Text>
            <Text style={styles.progressStatLabel}>Ortalama Başarı</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${stats.accuracy}%`, backgroundColor: "#34d399" }]} />
            </View>
          </View>

          <View style={styles.progressStatItem}>
            <Text style={styles.progressStatValue}>{loading ? "-" : stats.totalScore}</Text>
            <Text style={styles.progressStatLabel}>Toplam Puan</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${Math.min((stats.totalScore / 1000) * 100, 100)}%`, backgroundColor: "#fb923c" }]} />
            </View>
          </View>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#a78bfa" />
          <Text style={styles.loadingText}>Veriler alınıyor…</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0f172a" },
  container: { 
    padding: 16,
    paddingTop: 60,
    paddingBottom: 32,
    justifyContent: "center",
    flexGrow: 1,
  },

  // Hero Card
  heroCard: {
    backgroundColor: "#0a0f1e",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: "hidden",
  },
  heroGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: "rgba(167,139,250,0.08)",
    borderRadius: 24,
  },
  heroContent: {
    marginBottom: 24,
  },
  heroGreeting: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 4,
  },
  heroName: {
    fontSize: 32,
    fontWeight: "900",
    color: "#f8fafc",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#cbd5e1",
    fontWeight: "500",
  },

  // Quick Stats
  quickStats: {
    flexDirection: "row",
    backgroundColor: "#0b1220",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-around",
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: -0.5,
  },
  quickStatLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#1e293b",
  },

  // Action Cards Grid
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  actionPrimary: {
    backgroundColor: "rgba(167,139,250,0.12)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
  },
  actionSecondary: {
    backgroundColor: "rgba(34,211,238,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.3)",
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0a0f1e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#f8fafc",
    marginBottom: 4,
  },
  actionCardDesc: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
  actionArrow: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0a0f1e",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { 
    transform: [{ scale: 0.97 }], 
    opacity: 0.85 
  },

  // Progress Card
  progressCard: {
    backgroundColor: "#0a0f1e",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  progressIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(96,165,250,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#f8fafc",
  },
  progressStats: {
    gap: 20,
  },
  progressStatItem: {
    gap: 8,
  },
  progressStatValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: -0.5,
  },
  progressStatLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#1e293b",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "center",
    gap: 10,
  },
  loadingText: { 
    color: "#94a3b8", 
    fontSize: 14,
  },
})