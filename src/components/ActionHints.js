import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ActionHints() {
  return (
    <View style={styles.container}>
      <View style={styles.hint}>
        <View style={[styles.arrow, styles.arrowLeft]}>
          <Text style={styles.arrowText}>←</Text>
        </View>
        <Text style={[styles.hintText, { color: COLORS.delete }]}>Sil</Text>
      </View>

      <View style={styles.shakeHint}>
        <Text style={styles.shakeIcon}>📱</Text>
        <Text style={styles.shakeText}>Salla = Geri Al</Text>
      </View>

      <View style={styles.hint}>
        <Text style={[styles.hintText, { color: COLORS.keep }]}>Tut</Text>
        <View style={[styles.arrow, styles.arrowRight]}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowLeft: {
    backgroundColor: COLORS.deleteGlow,
    borderWidth: 1,
    borderColor: COLORS.delete,
  },
  arrowRight: {
    backgroundColor: COLORS.keepGlow,
    borderWidth: 1,
    borderColor: COLORS.keep,
  },
  arrowText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  hintText: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    fontSize: 14,
  },
  shakeHint: {
    alignItems: 'center',
    gap: 2,
  },
  shakeIcon: {
    fontSize: 18,
  },
  shakeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    fontSize: 9,
  },
});
