import React, { useCallback } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOWS } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.55;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function SwipeCard({ asset, nextAsset, onSwipeLeft, onSwipeRight }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleSwipeComplete = useCallback(
    (direction) => {
      triggerHaptic();
      if (direction === 'left') {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    },
    [onSwipeLeft, onSwipeRight, triggerHaptic]
  );

  const resetCard = useCallback(() => {
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    cardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const pan = Gesture.Pan()
    .onBegin(() => {
      cardScale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3; // Restrict vertical movement
    })
    .onEnd((event) => {
      const velocityThreshold = 500;
      const shouldSwipe =
        Math.abs(translateX.value) > SWIPE_THRESHOLD ||
        Math.abs(event.velocityX) > velocityThreshold;

      if (shouldSwipe) {
        const direction = translateX.value > 0 ? 'right' : 'left';
        const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

        translateX.value = withTiming(targetX, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)(direction);
          // Reset for next card
          translateX.value = 0;
          translateY.value = 0;
          cardScale.value = 1;
        });
      } else {
        runOnJS(resetCard)();
      }
    });

  // Card animation
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-25, 0, 25],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: cardScale.value },
      ],
    };
  });

  // Keep overlay (right swipe)
  const keepOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Delete overlay (left swipe)
  const deleteOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // Next card scale animation
  const nextCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.92, 1],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  if (!asset) return null;

  return (
    <View style={styles.container}>
      {/* Next card (background) */}
      {nextAsset && (
        <Animated.View style={[styles.card, styles.nextCard, nextCardStyle]}>
          <Image
            source={{ uri: nextAsset.uri }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.imageDarkOverlay} />
        </Animated.View>
      )}

      {/* Current card (foreground) */}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <Image
            source={{ uri: asset.uri }}
            style={styles.cardImage}
            resizeMode="cover"
          />

          {/* Keep overlay (green) */}
          <Animated.View style={[styles.actionOverlay, styles.keepOverlay, keepOverlayStyle]}>
            <View style={styles.actionBadge}>
              <Text style={styles.keepBadgeText}>TUT ✓</Text>
            </View>
          </Animated.View>

          {/* Delete overlay (red) */}
          <Animated.View style={[styles.actionOverlay, styles.deleteOverlay, deleteOverlayStyle]}>
            <View style={styles.actionBadge}>
              <Text style={styles.deleteBadgeText}>SİL ✕</Text>
            </View>
          </Animated.View>

          {/* Media type indicator */}
          {asset.mediaType === 'video' && (
            <View style={styles.videoIndicator}>
              <Text style={styles.videoIcon}>▶</Text>
              <Text style={styles.videoDuration}>
                {asset.duration ? `${Math.round(asset.duration)}s` : 'Video'}
              </Text>
            </View>
          )}

          {/* File info at bottom */}
          <View style={styles.infoBar}>
            <Text style={styles.filename} numberOfLines={1}>
              {asset.filename}
            </Text>
            <Text style={styles.date}>
              {new Date(asset.creationTime).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'absolute',
    backgroundColor: COLORS.surface,
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  nextCard: {
    zIndex: -1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  actionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepOverlay: {
    backgroundColor: COLORS.keepGlow,
    borderWidth: 3,
    borderColor: COLORS.keep,
    borderRadius: 24,
  },
  deleteOverlay: {
    backgroundColor: COLORS.deleteGlow,
    borderWidth: 3,
    borderColor: COLORS.delete,
    borderRadius: 24,
  },
  actionBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keepBadgeText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.keep,
    letterSpacing: 2,
  },
  deleteBadgeText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.delete,
    letterSpacing: 2,
  },
  videoIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  videoIcon: {
    color: '#fff',
    fontSize: 12,
  },
  videoDuration: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filename: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
