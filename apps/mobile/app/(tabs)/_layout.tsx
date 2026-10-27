import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Home, LayoutGrid, ScanBarcode, User } from "lucide-react-native";
import { colors } from "@/constants/theme";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background.primary },
        tabBarStyle: {
          backgroundColor: colors.background.secondary,
          borderTopWidth: 1,
          borderTopColor: colors.surface.border,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 85,
          paddingBottom: 30,
          paddingTop: 10,
          position: "absolute",
          overflow: "hidden",
        },
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontFamily: "PlusJakartaSans_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarAccessibilityLabel: "tab-home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: t("tabs.scan"),
          tabBarAccessibilityLabel: "tab-scan",
          tabBarIcon: ({ color, size }) => <ScanBarcode size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: t("tabs.collection"),
          tabBarAccessibilityLabel: "tab-collection",
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarAccessibilityLabel: "tab-profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
