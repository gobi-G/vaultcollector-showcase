import { useEffect } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors } from "@/constants/theme";

type ScanLineOverlayProps = {
  phaseText: string;
};

export function ScanLineOverlay({ phaseText }: ScanLineOverlayProps) {
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(height * 0.85, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [height]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.container} testID="scan-line-overlay">
      {/* Dark overlay */}
      <View style={styles.darkOverlay} />

      {/* Scan line */}
      <Animated.View style={[styles.scanLine, lineStyle]} />

      {/* Glow effect */}
      <Animated.View style={[styles.glow, lineStyle]} />

      {/* Phase text at bottom */}
      <View style={styles.textContainer}>
        <Text className="font-sans-semibold text-lg text-text-primary">
          {phaseText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  darkOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary.DEFAULT,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  glow: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 40,
    marginTop: -20,
    backgroundColor: "rgba(48,91,243,0.1)",
  },
  textContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingBottom: 80,
  },
});
