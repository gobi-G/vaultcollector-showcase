import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import {
  ChevronRight,
  FileText,
  FolderOpen,
  Home,
  LayoutGrid,
  Lock,
  Monitor,
  Package,
  TrendingDown,
  TrendingUp,
  Watch,
} from "lucide-react-native";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";

export const ICON_COMPONENTS: Record<string, LucideIcon> = {
  box: Package,
  binder: FolderOpen,
  shelf: LayoutGrid,
  safe: Lock,
  display: Monitor,
  "watch-box": Watch,
  room: Home,
  page: FileText,
};

export const ICON_LABELS: Record<string, string> = {
  box: "vault.icons.box",
  binder: "vault.icons.binder",
  shelf: "vault.icons.shelf",
  safe: "vault.icons.safe",
  display: "vault.icons.display",
  "watch-box": "vault.icons.watchBox",
  room: "vault.icons.room",
  page: "vault.icons.page",
};

type VaultLocationCardProps = {
  testID: string;
  name: string;
  icon: string;
  itemCount: number;
  totalValue: number;
  isPositive?: boolean;
  onPress: () => void;
};

export function VaultLocationCard({
  testID,
  name,
  icon,
  itemCount,
  totalValue,
  isPositive = true,
  onPress,
}: VaultLocationCardProps) {
  const IconComponent = ICON_COMPONENTS[icon] ?? Package;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        width: 160,
        padding: spacing.lg,
        marginRight: spacing.md,
        borderRadius: 20,
        backgroundColor: colors.surface.default,
        borderWidth: 1,
        borderColor: colors.surface.border,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          backgroundColor: colors.primary.muted,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing.md,
        }}
      >
        <IconComponent size={24} color={colors.primary.light} />
      </View>

      {/* Name */}
      <Text
        style={{
          fontFamily: fontFamily.bold,
          fontSize: fontSize.base,
          color: colors.text.primary,
          marginBottom: spacing.xs,
        }}
        numberOfLines={1}
      >
        {name}
      </Text>

      {/* Item Count */}
      <Text
        style={{
          fontFamily: fontFamily.regular,
          fontSize: fontSize.xs,
          color: colors.text.muted,
          marginBottom: spacing.md,
        }}
      >
        {itemCount} Items
      </Text>

      {/* Value + Trend */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text
          style={{
            fontFamily: fontFamily.bold,
            fontSize: fontSize.base,
            color: colors.text.primary,
          }}
        >
          ${totalValue.toLocaleString()}
        </Text>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: isPositive ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isPositive ? (
            <TrendingUp size={14} color={colors.success.DEFAULT} />
          ) : (
            <TrendingDown size={14} color={colors.danger.DEFAULT} />
          )}
        </View>
      </View>

      {/* Chevron */}
      <View style={{ position: "absolute", top: spacing.lg, right: spacing.md }}>
        <ChevronRight size={16} color={colors.text.muted} />
      </View>
    </Pressable>
  );
}
