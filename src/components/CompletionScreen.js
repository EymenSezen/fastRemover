import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function CompletionScreen({ deletedCount, keptCount, onReset }) {
  const totalProcessed = deletedCount + keptCount;

  return (
    <View style={styles.container}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>🎉</Text>
      </View>

      <Text style={styles.title}>Tamamlandı!</Text>
      <Text style={styles.subtitle}>Galerin tertemiz oldu</Text>

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={[styles.statDot, { backgroundColor: COLORS.keep }]} />
          <Text style={styles.statText}>Tutulan</Text>
          <Text style={styles.statValue}>{keptCount}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <View style={[styles.statDot, { backgroundColor: COLORS.delete }]} />
          <Text style={styles.statText}>Silinen</Text>
          <Text style={styles.statValue}>{deletedCount}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <View style={[styles.statDot, { backgroundColor: COLORS.gradientStart }]} />
          <Text style={styles.statText}>Toplam İşlenen</Text>
          <Text style={styles.statValue}>{totalProcessed}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={onReset} activeOpacity={0.8}>
        <Text style={styles.resetButtonText}>Tekrar Başla</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.gradientStart,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  statsCard: {
    width: width - 64,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.xl,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  statText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: SPACING.xs,
  },
  resetButton: {
    backgroundColor: COLORS.gradientStart,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: COLORS.gradientStart,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  resetButtonText: {
    ...TYPOGRAPHY.subtitle,
    color: '#fff',
    fontWeight: '700',
  },
});
