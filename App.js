import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { COLORS, SPACING, TYPOGRAPHY } from './src/constants/theme';
import { useMediaLibrary } from './src/hooks/useMediaLibrary';
import { useShakeDetector } from './src/hooks/useShakeDetector';

import Header from './src/components/Header';
import SwipeCard from './src/components/SwipeCard';
import ActionHints from './src/components/ActionHints';
import CompletionScreen from './src/components/CompletionScreen';
import PermissionScreen from './src/components/PermissionScreen';

export default function App() {
  const {
    currentAsset,
    nextAsset,
    loading,
    hasPermission,
    totalCount,
    deletedCount,
    keptCount,
    processedCount,
    allDone,
    keepPhoto,
    deletePhoto,
    undoDelete,
    resetAll,
    canUndo,
  } = useMediaLibrary();

  const handleUndo = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    await undoDelete();
  }, [undoDelete]);

  // Shake detector for undo
  useShakeDetector(handleUndo);

  // Handle swipe right = KEEP
  const handleSwipeRight = useCallback(() => {
    keepPhoto();
  }, [keepPhoto]);

  // Handle swipe left = DELETE
  const handleSwipeLeft = useCallback(() => {
    deletePhoto();
  }, [deletePhoto]);

  // Permission not granted
  if (!hasPermission) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <PermissionScreen onRequestPermission={() => {}} />
      </GestureHandlerRootView>
    );
  }

  // Loading
  if (loading) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gradientStart} />
          <Text style={styles.loadingText}>Fotoğraflar yükleniyor...</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  // All done
  if (allDone) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <CompletionScreen
            deletedCount={deletedCount}
            keptCount={keptCount}
            onReset={resetAll}
          />
        </View>
      </GestureHandlerRootView>
    );
  }

  // No photos
  if (!currentAsset && !loading) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>Galeriniz Boş</Text>
          <Text style={styles.emptySubtitle}>Temizlenecek fotoğraf bulunamadı</Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header with undo button */}
        <Header
          deletedCount={deletedCount}
          keptCount={keptCount}
          totalCount={totalCount}
          processedCount={processedCount}
          canUndo={canUndo}
          onUndo={handleUndo}
        />

        {/* Swipe Card */}
        <SwipeCard
          asset={currentAsset}
          nextAsset={nextAsset}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />

        {/* Bottom Action Hints */}
        <ActionHints />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
