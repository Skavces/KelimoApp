import React from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"

export default function PracticeGameScreen({ route, navigation }: any) {
  const mode = route?.params?.mode || "EN_TR"

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Practice Game</Text>
      <Text style={styles.sub}>Mode: {mode}</Text>

      <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
        <Text style={styles.btnText}>Geri</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center", padding: 24 },
  title: { color: "#f8fafc", fontSize: 26, fontWeight: "900", marginBottom: 10 },
  sub: { color: "#94a3b8", fontSize: 14, marginBottom: 18 },
  btn: { backgroundColor: "#0b1220", borderWidth: 1, borderColor: "#1e293b", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: "#a78bfa", fontWeight: "900" },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
})
