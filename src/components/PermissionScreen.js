import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export default function PermissionScreen({ onRequestPermission }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🖼️</Text>
      </View>
      <Text style={styles.title}>Galeri Erişimi</Text>
      <Text style={styles.description}>
        FastRemover'ın fotoğraflarınızı görüntüleyebilmesi ve yönetebilmesi için galeri erişim izni vermeniz gerekiyor.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onRequestPermission} activeOpacity={0.8}>
        <Text style={styles.buttonText}>İzin Ver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.gradientStart,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  button: {
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
  buttonText: {
    ...TYPOGRAPHY.subtitle,
    color: '#fff',
    fontWeight: '700',
  },
});
