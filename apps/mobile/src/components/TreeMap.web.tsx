import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

// react-native-maps has no web target — embed Google's free iframe map instead.
// No API key needed for this basic embed (maps.google.com/maps?...&output=embed).
type Props = {
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
};

export default function TreeMap({ latitude, longitude, title, style }: Props) {
  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;
  return (
    <View style={[styles.wrapper, style]}>
      {/* @ts-ignore - plain DOM element, this file only ever runs on web */}
      <iframe
        src={embedUrl}
        title={title}
        loading="lazy"
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 12, overflow: 'hidden' },
});
