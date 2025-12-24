import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Home, BookOpen, Target, User, List } from "lucide-react-native"
import DashboardScreen from "../screens/DashboardScreen"
import LearnScreen from "../screens/LearnScreen"
import PracticeScreen from "../screens/PracticeScreen"
import ProfileScreen from "../screens/ProfileScreen"
import MyWordsScreen from "../screens/MyWordsScreen"
import PracticeStack from "../screens/PracticeStack"

const Tab = createBottomTabNavigator()

export default function AppTabs({ setIsLoggedIn }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#0b1220",
          borderTopColor: "#1e293b",
          borderTopWidth: 1,
          height: 62,
          paddingTop: 10,
          paddingBottom: 10,
        },
        tabBarIcon: ({ focused }) => {
          const color = focused ? "#f8fafc" : "#64748b"
          const size = 26

          switch (route.name) {
            case "Home":
              return <Home size={size} color={color} />
            case "Learn":
              return <BookOpen size={size} color={color} />
            case "Practice":
              return <Target size={size} color={color} />
            case "MyWords":
              return <List size={size} color={color} />
            case "Profile":
              return <User size={size} color={color} />
            default:
              return null
          }
        },
      })}
    >

      <Tab.Screen name="Home">
        {(props) => <DashboardScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>

      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Practice" component={PracticeStack} />
      <Tab.Screen name="MyWords" component={MyWordsScreen} />

      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  )
}
