import MapView, { Marker } from 'react-native-maps';
import { StyleProp, ViewStyle } from 'react-native';

type Props = {
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
};

export default function TreeMap({ latitude, longitude, title, description, style }: Props) {
  return (
    <MapView
      style={style}
      initialRegion={{ latitude, longitude, latitudeDelta: 0.002, longitudeDelta: 0.002 }}
    >
      <Marker coordinate={{ latitude, longitude }} title={title} description={description} />
    </MapView>
  );
}
