import { ReactNode, useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../lib/theme';

// Web-only hover tooltip. On native it's a pure passthrough (zero overhead).
// Simple text hints use the browser's native `title` attribute — no JS, no overlay.
// Pass `rich` for a themed overlay (e.g. multi-line or styled content).
export default function Tooltip({
  label,
  children,
  rich = false,
}: {
  label: string;
  children: ReactNode;
  rich?: boolean;
}) {
  if (Platform.OS !== 'web') return <>{children}</>;
  if (!rich) {
    // ponytail: native title attr — browser positions/dismisses it for free.
    return (
      <View {...({ title: label } as any)} style={styles.inline}>
        {children}
      </View>
    );
  }
  return <RichTooltip label={label}>{children}</RichTooltip>;
}

function RichTooltip({ label, children }: { label: string; children: ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <View
      style={styles.inline}
      {...({
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      } as any)}
    >
      {children}
      {hovered && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>{label}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inline: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  overlay: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: spacing.xs,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    maxWidth: 220,
    zIndex: 1000,
  },
  overlayText: {
    color: colors.white,
    fontSize: typography.caption,
  },
});
