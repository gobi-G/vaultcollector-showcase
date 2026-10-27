import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { colors } from "@/constants/theme";

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
};

export function Skeleton({ width = "100%", height = 20, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <View style={{
        width: width as number,
        height,
        borderRadius,
        backgroundColor: colors.surface.default,
      }} />
    </Animated.View>
  );
}

export function SkeletonCard() {
  return (
    <View style={{
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.surface.border,
    }}>
      <Skeleton height={16} width="60%" />
      <Skeleton height={12} width="40%" style={{ marginTop: 8 }} />
      <Skeleton height={12} width="30%" style={{ marginTop: 8 }} />
    </View>
  );
}

export function SkeletonRow() {
  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.surface.border,
    }}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1 }}>
        <Skeleton height={14} width="70%" />
        <Skeleton height={10} width="40%" style={{ marginTop: 6 }} />
      </View>
      <Skeleton width={50} height={14} />
    </View>
  );
}
