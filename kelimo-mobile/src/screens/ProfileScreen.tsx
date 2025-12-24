import { View, Text, Pressable } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function ProfileScreen({ setIsLoggedIn }: any) {
  const logout = async () => {
    await AsyncStorage.removeItem("token")
    setIsLoggedIn?.(false)
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Text style={{ color: "#fff" }}>Profile</Text>
      <Pressable onPress={logout} style={{ padding: 12, borderWidth: 1, borderColor: "#ef4444", borderRadius: 10 }}>
        <Text style={{ color: "#ef4444", fontWeight: "700" }}>Çıkış</Text>
      </Pressable>
    </View>
  )
}
