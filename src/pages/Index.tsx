import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import RouteForm from '@/components/RouteForm';
import CarTypeSelection from '@/components/CarTypeSelection';
import RouteResults from '@/components/RouteResults';
import TariffsList from '@/components/TariffsList';

interface RouteInfo {
  distance: number;
  duration: number;
  cost: number;
  pickupCoords?: [number, number];
  destinationCoords?: [number, number];
}

interface CarType {
  id: string;
  name: string;
  description: string;
  pricePerKm: number;
  icon: string;
  features: string[];
  color: string;
}

const Index = () => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedCarType, setSelectedCarType] = useState('economy');

  const YANDEX_API_KEY = '7d998dde-4bf4-4d81-af59-deb970d41bad';

  const carTypes: CarType[] = [
    {
      id: 'economy',
      name: 'Эконом',
      description: 'Базовый комфорт, доступная цена',
      pricePerKm: 40,
      icon: 'Car',
      features: ['Кондиционер', 'Радио', 'Ремни безопасности'],
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'comfort',
      name: 'Комфорт',
      description: 'Повышенный комфорт поездки',
      pricePerKm: 55,
      icon: 'Car',
      features: ['Климат-контроль', 'Кожаные сидения', 'Wi-Fi'],
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'business',
      name: 'Бизнес',
      description: 'Премиум автомобили',
      pricePerKm: 80,
      icon: 'Car',
      features: ['Премиум салон', 'Персональный водитель', 'Минеральная вода'],
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 'minivan',
      name: 'Минивэн',
      description: 'Для больших компаний до 7 мест',
      pricePerKm: 70,
      icon: 'Bus',
      features: ['До 7 пассажиров', 'Большой багажник', 'Детские кресла'],
      color: 'bg-orange-50 border-orange-200'
    }
  ];

  const selectedCar = carTypes.find(car => car.id === selectedCarType) || carTypes[0];

  const calculateRoute = async () => {
    if (!pickupAddress.trim() || !destinationAddress.trim()) {
      alert('Пожалуйста, укажите адреса начала и конца маршрута');
      return;
    }

    setIsCalculating(true);

    try {
      // Получаем координаты для адресов через Яндекс Геокодер
      const [pickupResponse, destinationResponse] = await Promise.all([
        fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&format=json&geocode=${encodeURIComponent(pickupAddress)}&results=1`),
        fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&format=json&geocode=${encodeURIComponent(destinationAddress)}&results=1`)
      ]);

      const pickupData = await pickupResponse.json();
      const destinationData = await destinationResponse.json();

      const pickupFeatures = pickupData.response?.GeoObjectCollection?.featureMember;
      const destinationFeatures = destinationData.response?.GeoObjectCollection?.featureMember;

      if (!pickupFeatures?.length || !destinationFeatures?.length) {
        alert('Не удалось найти один из адресов');
        return;
      }

      const pickupPos = pickupFeatures[0].GeoObject.Point.pos.split(' ').map(Number).reverse();
      const destinationPos = destinationFeatures[0].GeoObject.Point.pos.split(' ').map(Number).reverse();

      // Рассчитываем расстояние по прямой (приблизительно)
      const R = 6371; // радиус Земли в км
      const dLat = (destinationPos[0] - pickupPos[0]) * Math.PI / 180;
      const dLon = (destinationPos[1] - pickupPos[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(pickupPos[0] * Math.PI / 180) * Math.cos(destinationPos[0] * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Добавляем коэффициент для реального маршрута (+30%)
      const realDistance = distance * 1.3;
      const estimatedTime = Math.round(realDistance * 2.5); // примерно 2.5 мин на км в городе
      const cost = Math.round(realDistance * selectedCar.pricePerKm);

      setRouteInfo({
        distance: Math.round(realDistance * 10) / 10,
        duration: estimatedTime,
        cost,
        pickupCoords: [pickupPos[0], pickupPos[1]],
        destinationCoords: [destinationPos[0], destinationPos[1]]
      });
    } catch (error) {
      console.error('Ошибка при расчете маршрута:', error);
      alert('Ошибка при расчете маршрута. Попробуйте еще раз.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Пересчитываем стоимость при смене типа автомобиля
  useEffect(() => {
    if (routeInfo && routeInfo.distance > 0) {
      const newCost = Math.round(routeInfo.distance * selectedCar.pricePerKm);
      setRouteInfo({ ...routeInfo, cost: newCost });
    }
  }, [selectedCarType, routeInfo?.distance]);

  const handleOrderSubmit = () => {
    // Очищаем форму после отправки заказа
    setPickupAddress('');
    setDestinationAddress('');
    setRouteInfo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-roboto">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon name="Car" size={32} className="text-taxi" />
            <h1 className="text-4xl font-bold text-gray-800">ТАКСИ ОНЛАЙН</h1>
          </div>
          <p className="text-gray-600 text-lg">Быстрый расчет маршрута и стоимости поездки</p>
        </div>

        <Tabs defaultValue="booking" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <Icon name="MapPin" size={16} />
              Заказ
            </TabsTrigger>
            <TabsTrigger value="tariffs" className="flex items-center gap-2">
              <Icon name="CreditCard" size={16} />
              Тарифы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Route Planning */}
              <div className="space-y-6">
                <RouteForm
                  pickupAddress={pickupAddress}
                  setPickupAddress={setPickupAddress}
                  destinationAddress={destinationAddress}
                  setDestinationAddress={setDestinationAddress}
                  onCalculateRoute={calculateRoute}
                  isCalculating={isCalculating}
                />

                <CarTypeSelection
                  carTypes={carTypes}
                  selectedCarType={selectedCarType}
                  onCarTypeChange={setSelectedCarType}
                />
              </div>

              {/* Right Column - Map and Results */}
              <RouteResults
                routeInfo={routeInfo}
                selectedCar={selectedCar}
                pickupAddress={pickupAddress}
                destinationAddress={destinationAddress}
                onSubmitOrder={handleOrderSubmit}
              />
            </div>
          </TabsContent>

          <TabsContent value="tariffs">
            <TariffsList carTypes={carTypes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;