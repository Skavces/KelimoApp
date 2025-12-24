import React, { useEffect, useState } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as Linking from "expo-linking"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as WebBrowser from "expo-web-browser"

import LoginScreen from "../screens/LoginScreen"
import AppTabs from "./AppTabs"

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    ;(async () => {
      const token = await AsyncStorage.getItem("token")
      setIsLoggedIn(!!token)
    })()
  }, [])

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const data = Linking.parse(event.url)
      const accessToken = data.queryParams?.token

      if (typeof accessToken === "string") {
        await AsyncStorage.setItem("token", accessToken)
        setIsLoggedIn(true)
        WebBrowser.dismissBrowser()
      }
    }

    const subscription = Linking.addEventListener("url", handleDeepLink)
    return () => subscription.remove()
  }, [])

  if (isLoggedIn === null) return null

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="AppTabs">
            {(props) => <AppTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
