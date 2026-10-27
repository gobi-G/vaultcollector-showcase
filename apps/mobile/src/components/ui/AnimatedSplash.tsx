import { useCallback, useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const appIcon = require("../../../assets/icon.png") as number;
import * as SplashScreen from "expo-splash-screen";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

type AnimatedSplashProps = {
  isReady: boolean;
  children: React.ReactNode;
};

export function AnimatedSplash({ isReady, children }: AnimatedSplashProps) {
  const [showSplash, setShowSplash] = useState(true);

  const iconScale = useSharedValue(0.3);
  const iconOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: 400 });
    iconScale.value = withSpring(1, { damping: 12, stiffness: 100 });

    titleOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(
      500,
      withSpring(0, { damping: 15, stiffness: 90 }),
    );
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
  }, [iconOpacity, iconScale, subtitleOpacity, titleOpacity, titleTranslateY]);

  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  if (showSplash) {
    return (
      <View style={styles.container} onLayout={onLayoutRootView}>
        <Animated.View style={iconAnimatedStyle}>
          <Image source={appIcon} style={styles.icon} resizeMode="contain" />
        </Animated.View>
        <Animated.View style={[styles.titleWrap, titleAnimatedStyle]}>
          <Text style={styles.title}>VaultCollector</Text>
        </Animated.View>
        <Animated.View style={[styles.subtitleWrap, subtitleAnimatedStyle]}>
          <Text style={styles.subtitle}>Smart Inventory Tracker</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.flex}>
      {children}
    </Animated.View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ICON_SIZE = Math.min(SCREEN_WIDTH * 0.3, 140);

// Using StyleSheet here intentionally — Animated.View + NativeWind className
// causes "Cannot update component while rendering" errors with CssInterop
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
    paddingHorizontal: 24,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  titleWrap: {
    marginTop: 20,
  },
  title: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 30,
    color: colors.text.primary,
  },
  subtitleWrap: {
    marginTop: 8,
  },
  subtitle: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 15,
    color: colors.text.muted,
  },
  flex: {
    flex: 1,
  },
});
