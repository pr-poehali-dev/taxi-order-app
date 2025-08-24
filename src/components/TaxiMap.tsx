import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix для иконок маркеров Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface TaxiMapProps {
  pickupCoords?: [number, number];
  destinationCoords?: [number, number];
  routeCoords?: [number, number][];
  pickupAddress?: string;
  destinationAddress?: string;
}

const TaxiMap = ({ 
  pickupCoords, 
  destinationCoords, 
  routeCoords, 
  pickupAddress, 
  destinationAddress 
}: TaxiMapProps) => {
  const mapRef = useRef<L.Map | null>(null);

  // Центр карты - Москва по умолчанию
  const defaultCenter: [number, number] = [55.7558, 37.6173];

  // Определяем центр и зум на основе точек маршрута
  const getMapCenter = (): [number, number] => {
    if (pickupCoords && destinationCoords) {
      const lat = (pickupCoords[0] + destinationCoords[0]) / 2;
      const lng = (pickupCoords[1] + destinationCoords[1]) / 2;
      return [lat, lng];
    }
    if (pickupCoords) return pickupCoords;
    if (destinationCoords) return destinationCoords;
    return defaultCenter;
  };

  const getMapZoom = (): number => {
    if (pickupCoords && destinationCoords) {
      const distance = Math.sqrt(
        Math.pow(pickupCoords[0] - destinationCoords[0], 2) + 
        Math.pow(pickupCoords[1] - destinationCoords[1], 2)
      );
      if (distance > 0.1) return 10;
      if (distance > 0.05) return 12;
      return 14;
    }
    return 13;
  };

  // Пользовательские иконки
  const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    if (mapRef.current && pickupCoords && destinationCoords) {
      const bounds = L.latLngBounds([pickupCoords, destinationCoords]);
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [pickupCoords, destinationCoords, routeCoords]);

  return (
    <div className="h-80 w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={getMapCenter()}
        zoom={getMapZoom()}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Маркер точки подачи */}
        {pickupCoords && (
          <Marker position={pickupCoords} icon={pickupIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-green-700">Точка подачи</div>
                <div className="text-gray-600">{pickupAddress || 'Адрес подачи'}</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Маркер точки назначения */}
        {destinationCoords && (
          <Marker position={destinationCoords} icon={destinationIcon}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-red-700">Точка назначения</div>
                <div className="text-gray-600">{destinationAddress || 'Адрес назначения'}</div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Линия маршрута */}
        {routeCoords && routeCoords.length > 1 && (
          <Polyline 
            positions={routeCoords} 
            color="#FFD700" 
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default TaxiMap;