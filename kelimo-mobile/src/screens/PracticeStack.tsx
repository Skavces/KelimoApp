import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import PracticeScreen from "../screens/PracticeScreen"
import PracticeGameScreen from "../screens/PracticeGameScreen"
import ScrambleScreen from "../screens/ScrambleScreen"
import FillBlankScreen from "../screens/FillBlankScreen"
import MemoryScreen from "../screens/MemoryScreen"
import DictationScreen from "../screens/DictationScreen"

const Stack = createNativeStackNavigator()

export default function PracticeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PracticeHome" component={PracticeScreen} />
      <Stack.Screen name="PracticeGame" component={PracticeGameScreen} />
      <Stack.Screen name="Scramble" component={ScrambleScreen} />
      <Stack.Screen name="FillBlank" component={FillBlankScreen} />
      <Stack.Screen name="Memory" component={MemoryScreen} />
      <Stack.Screen name="Dictation" component={DictationScreen} />
    </Stack.Navigator>
  )
}