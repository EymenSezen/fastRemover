import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function Header({ deletedCount, keptCount, totalCount, canUndo, onUndo, processedCount }) {
  const progress = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Fast</Text>
          <Text style={styles.titleAccent}>Remover</Text>
        </View>
        <TouchableOpacity
          style={[styles.undoButton, !canUndo && styles.undoButtonDisabled]}
          onPress={onUndo}
          disabled={!canUndo}
          activeOpacity={0.7}
        >
          <Text style={styles.undoIcon}>↩️</Text>
          <Text style={[styles.undoText, !canUndo && styles.undoTextDisabled]}>
            Geri Al
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {processedCount} / {totalCount}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{keptCount}</Text>
          <Text style={[styles.statLabel, { color: COLORS.keep }]}>Tutulan</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{deletedCount}</Text>
          <Text style={[styles.statLabel, { color: COLORS.delete }]}>Silinen</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
  },
  titleAccent: {
    ...TYPOGRAPHY.title,
    color: COLORS.gradientStart,
    marginLeft: SPACING.xs,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.undo,
    gap: 6,
  },
  undoButtonDisabled: {
    borderColor: COLORS.cardBorder,
    opacity: 0.4,
  },
  undoIcon: {
    fontSize: 16,
  },
  undoText: {
    ...TYPOGRAPHY.body,
    color: COLORS.undo,
    fontWeight: '600',
    fontSize: 13,
  },
  undoTextDisabled: {
    color: COLORS.textTertiary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gradientStart,
    borderRadius: 2,
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 11,
    minWidth: 60,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.cardBorder,
  },
});
