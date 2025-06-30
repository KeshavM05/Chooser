import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import PhoneMockup from '../common/PhoneMockup';
import { COLORS, FONT_SIZES, SPACING } from '../../styles/theme';

const StepWelcome = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Welcome</Text>
    <Text style={styles.subtitle}>
      This app selects a random finger among the fingers placed on the screen.
    </Text>
    <PhoneMockup>
      <View style={styles.overlayContainer} pointerEvents="none">
        <Text style={styles.overlayTitle}>CHOOSER</Text>
        <Text style={styles.overlaySubtitle}>A random finger selector.</Text>
      </View>
    </PhoneMockup>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.topMargin,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.topMargin,
  },
  subtitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.subtitle,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 12,
    marginBottom: 24,
  },
  overlayContainer: {
    position: 'absolute',
    top: 90,
    left: 0,
    width: 220,
    alignItems: 'center',
    zIndex: 3,
  },
  overlayTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.overlayTitle,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  overlaySubtitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.overlaySubtitle,
    textAlign: 'center',
    opacity: 0.85,
  },
});

export default StepWelcome; 