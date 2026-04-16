import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOWS } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.55;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function SwipeCard({ asset, nextAsset, onSwipeLeft, onSwipeRight }) {
  // Always-current callback refs — fixes stale closure bug with PanResponder
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);
  useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft;
    onSwipeRightRef.current = onSwipeRight;
  }, [onSwipeLeft, onSwipeRight]);

  const position = useRef(new Animated.ValueXY()).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const nextCardScale = useRef(new Animated.Value(0.92)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.5)).current;
  const isAnimating = useRef(false);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const resetPosition = () => {
    isAnimating.current = false;
    Animated.parallel([
      Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: false }),
      Animated.spring(nextCardScale, { toValue: 0.92, useNativeDriver: false }),
      Animated.spring(nextCardOpacity, { toValue: 0.5, useNativeDriver: false }),
    ]).start();
  };

  const swipeOut = useCallback((direction) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const targetX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    triggerHaptic();

    Animated.timing(position, {
      toValue: { x: targetX, y: 0 },
      duration: 280,
      useNativeDriver: false,
    }).start(() => {
      // Reset animated values
      position.setValue({ x: 0, y: 0 });
      cardScale.setValue(1);
      nextCardScale.setValue(0.92);
      nextCardOpacity.setValue(0.5);
      isAnimating.current = false;

      // Use refs — always calls the latest version of the callback
      if (direction === 'right') {
        onSwipeRightRef.current?.();
      } else {
        onSwipeLeftRef.current?.();
      }
    });
  }, [position, cardScale, nextCardScale, nextCardOpacity]);

  const swipeOutRef = useRef(swipeOut);
  useEffect(() => {
    swipeOutRef.current = swipeOut;
  }, [swipeOut]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating.current,
      onMoveShouldSetPanResponder: (_, g) =>
        !isAnimating.current && Math.abs(g.dx) > 8,

      onPanResponderGrant: () => {
        Animated.spring(cardScale, {
          toValue: 0.97,
          useNativeDriver: false,
        }).start();
      },

      onPanResponderMove: (_, g) => {
        if (isAnimating.current) return;
        position.setValue({ x: g.dx, y: g.dy * 0.25 });

        const progress = Math.min(Math.abs(g.dx) / SWIPE_THRESHOLD, 1);
        nextCardScale.setValue(0.92 + 0.08 * progress);
        nextCardOpacity.setValue(0.5 + 0.5 * progress);
      },

      onPanResponderRelease: (_, g) => {
        if (isAnimating.current) return;
        const shouldSwipe =
          Math.abs(g.dx) > SWIPE_THRESHOLD || Math.abs(g.vx) > 0.8;

        if (shouldSwipe) {
          // Use ref to always call the latest swipeOut
          swipeOutRef.current(g.dx > 0 ? 'right' : 'left');
        } else {
          resetPosition();
        }
      },

      onPanResponderTerminate: () => {
        resetPosition();
      },
    })
  ).current;

  if (!asset) return null;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-25deg', '0deg', '25deg'],
    extrapolate: 'clamp',
  });

  const keepOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const deleteOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Next card (background) */}
      {nextAsset && (
        <Animated.View
          style={[
            styles.card,
            styles.nextCard,
            { transform: [{ scale: nextCardScale }], opacity: nextCardOpacity },
          ]}
        >
          {nextAsset.mediaType === 'video' ? (
            <Video
              source={{ uri: nextAsset.uri }}
              style={styles.cardImage}
              resizeMode={ResizeMode.COVER}
              isMuted
              shouldPlay={false}
            />
          ) : (
            <Image
              source={{ uri: nextAsset.uri }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.imageDarkOverlay} />
        </Animated.View>
      )}

      {/* Current card */}
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
              { scale: cardScale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {asset.mediaType === 'video' ? (
          <Video
            source={{ uri: asset.uri }}
            style={styles.cardImage}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
            useNativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: asset.uri }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        )}

        {/* Keep overlay (green - right swipe) */}
        <Animated.View style={[styles.actionOverlay, styles.keepOverlay, { opacity: keepOpacity }]}>
          <View style={styles.actionBadge}>
            <Text style={styles.keepBadgeText}>TUT ✓</Text>
          </View>
        </Animated.View>

        {/* Delete overlay (red - left swipe) */}
        <Animated.View style={[styles.actionOverlay, styles.deleteOverlay, { opacity: deleteOpacity }]}>
          <View style={styles.actionBadge}>
            <Text style={styles.deleteBadgeText}>SİL ✕</Text>
          </View>
        </Animated.View>

        {/* Video indicator */}
        {asset.mediaType === 'video' && (
          <View style={styles.videoIndicator}>
            <Text style={styles.videoIcon}>▶</Text>
            <Text style={styles.videoDuration}>
              {asset.duration ? `${Math.round(asset.duration)}s` : 'Video'}
            </Text>
          </View>
        )}

        {/* Info bar */}
        <View style={styles.infoBar}>
          <Text style={styles.filename} numberOfLines={1}>
            {asset.filename}
          </Text>
          <Text style={styles.date}>
            {new Date(asset.creationTime).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </Animated.View>
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
