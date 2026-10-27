import { useCallback, useRef } from "react";
import { Dimensions, FlatList, Text, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { colors, fontFamily, fontSize, spacing } from "@/constants/theme";
import type { ArtworkImage } from "@vault-collector/shared";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COMPACT_WIDTH = 200;
const COMPACT_HEIGHT = 280;
const COMPACT_GAP = spacing.md;

const FULL_PADDING = spacing["2xl"];
const FULL_WIDTH = SCREEN_WIDTH - FULL_PADDING * 2;
const FULL_HEIGHT = FULL_WIDTH * 1.4;

type ArtworkCarouselProps = {
  images: ArtworkImage[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  size?: "compact" | "fullscreen";
};

export function ArtworkCarousel({ images, selectedIndex, onSelectIndex, size = "compact" }: ArtworkCarouselProps) {
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);
  const hasScrolledToInitial = useRef(false);

  const isFullscreen = size === "fullscreen";
  const cardWidth = isFullscreen ? FULL_WIDTH : COMPACT_WIDTH;
  const cardHeight = isFullscreen ? FULL_HEIGHT : COMPACT_HEIGHT;
  const snapInterval = isFullscreen ? SCREEN_WIDTH : COMPACT_WIDTH + COMPACT_GAP;
  const sidePadding = isFullscreen ? FULL_PADDING : (SCREEN_WIDTH - COMPACT_WIDTH) / 2 - spacing["2xl"];

  const handleScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / snapInterval);
      const clamped = Math.max(0, Math.min(index, images.length - 1));
      if (clamped !== selectedIndex) {
        onSelectIndex(clamped);
      }
    },
    [images.length, selectedIndex, onSelectIndex, snapInterval],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ArtworkImage; index: number }) => (
      <View
        testID={`variant-artwork-item-${index}`}
        style={{
          width: isFullscreen ? SCREEN_WIDTH : cardWidth,
          height: cardHeight,
          paddingHorizontal: isFullscreen ? FULL_PADDING : 0,
          marginRight: isFullscreen ? 0 : COMPACT_GAP,
        }}
      >
        <View style={{
          flex: 1,
          borderRadius: 16,
          borderWidth: selectedIndex === index ? 2 : 1,
          borderColor: selectedIndex === index ? colors.primary.DEFAULT : colors.surface.border,
          overflow: "hidden",
        }}>
          <Image
            source={{ uri: isFullscreen ? item.imageUrl : item.imageUrlSmall }}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            placeholder={{ blurhash: "L03u%Vt700WB~qj[j[j[00WB~qof" }}
            transition={200}
          />
        </View>
      </View>
    ),
    [selectedIndex, isFullscreen, cardWidth, cardHeight],
  );

  const handleLayout = useCallback(() => {
    if (!hasScrolledToInitial.current && selectedIndex > 0) {
      hasScrolledToInitial.current = true;
      flatListRef.current?.scrollToIndex({ index: selectedIndex, animated: false });
    }
  }, [selectedIndex]);

  return (
    <View testID="variant-artwork-carousel">
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={isFullscreen}
        snapToInterval={isFullscreen ? undefined : COMPACT_WIDTH + COMPACT_GAP}
        decelerationRate="fast"
        contentContainerStyle={isFullscreen ? undefined : { paddingHorizontal: Math.max(sidePadding, 0) }}
        onMomentumScrollEnd={handleScrollEnd}
        onLayout={handleLayout}
        getItemLayout={(_, index) => ({
          length: snapInterval,
          offset: snapInterval * index,
          index,
        })}
      />
      {images.length > 1 && (
        <Text
          testID="variant-artwork-counter"
          style={{
            fontFamily: fontFamily.semibold, fontSize: fontSize.sm,
            color: colors.text.muted, textAlign: "center", marginTop: spacing.md,
          }}
        >
          {t("variant.artwork", { current: selectedIndex + 1, total: images.length })}
        </Text>
      )}
    </View>
  );
}
