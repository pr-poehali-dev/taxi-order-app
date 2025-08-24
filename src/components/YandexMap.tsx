import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    ymaps: any;
  }
}

interface YandexMapProps {
  pickupCoords?: [number, number];
  destinationCoords?: [number, number];
  pickupAddress?: string;
  destinationAddress?: string;
}

const YandexMap = ({ 
  pickupCoords, 
  destinationCoords, 
  pickupAddress, 
  destinationAddress 
}: YandexMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      if (!window.ymaps) {
        setTimeout(initMap, 100);
        return;
      }

      window.ymaps.ready(() => {
        // Центр карты - Москва по умолчанию
        const defaultCenter = [55.7558, 37.6173];
        let center = defaultCenter;
        let zoom = 10;

        // Если есть координаты, центрируем на них
        if (pickupCoords && destinationCoords) {
          center = [
            (pickupCoords[0] + destinationCoords[0]) / 2,
            (pickupCoords[1] + destinationCoords[1]) / 2
          ];
          zoom = 12;
        } else if (pickupCoords) {
          center = pickupCoords;
          zoom = 14;
        } else if (destinationCoords) {
          center = destinationCoords;
          zoom = 14;
        }

        // Создаем карту
        mapInstance.current = new window.ymaps.Map(mapRef.current, {
          center: center,
          zoom: zoom,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
        });

        // Добавляем маркеры
        if (pickupCoords) {
          const pickupPlacemark = new window.ymaps.Placemark(
            pickupCoords,
            {
              balloonContent: `
                <div style="padding: 8px;">
                  <strong style="color: #10B981;">Точка подачи</strong><br>
                  <span style="color: #6B7280;">${pickupAddress || 'Адрес подачи'}</span>
                </div>
              `
            },
            {
              preset: 'islands#greenDotIcon'
            }
          );
          mapInstance.current.geoObjects.add(pickupPlacemark);
        }

        if (destinationCoords) {
          const destinationPlacemark = new window.ymaps.Placemark(
            destinationCoords,
            {
              balloonContent: `
                <div style="padding: 8px;">
                  <strong style="color: #EF4444;">Точка назначения</strong><br>
                  <span style="color: #6B7280;">${destinationAddress || 'Адрес назначения'}</span>
                </div>
              `
            },
            {
              preset: 'islands#redDotIcon'
            }
          );
          mapInstance.current.geoObjects.add(destinationPlacemark);
        }

        // Строим маршрут, если есть обе точки
        if (pickupCoords && destinationCoords) {
          const multiRoute = new window.ymaps.multiRouter.MultiRoute(
            {
              referencePoints: [pickupCoords, destinationCoords],
              params: {
                routingMode: 'auto'
              }
            },
            {
              boundsAutoApply: true,
              routeActiveStrokeWidth: 6,
              routeActiveStrokeColor: '#FFD700',
              wayPointVisible: false,
              viaPointVisible: false
            }
          );
          
          mapInstance.current.geoObjects.add(multiRoute);
        }
      });
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [pickupCoords, destinationCoords, pickupAddress, destinationAddress]);

  return (
    <div 
      ref={mapRef} 
      className="h-80 w-full rounded-lg overflow-hidden shadow-lg border border-gray-200"
      style={{ minHeight: '320px' }}
    />
  );
};

export default YandexMap;