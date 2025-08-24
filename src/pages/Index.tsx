import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import TaxiMap from '@/components/TaxiMap';

interface RouteInfo {
  distance: number;
  duration: number;
  cost: number;
  pickupCoords?: [number, number];
  destinationCoords?: [number, number];
  routeCoords?: [number, number][];
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
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);
  const [selectedCarType, setSelectedCarType] = useState('economy');

  const API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImZkM2Y1ZmZjNjUzZjQ3MzI4N2M4NWI0YTE3OTQwY2EzIiwiaCI6Im11cm11cjY0In0=';

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

  const fetchSuggestions = async (query: string, setter: (suggestions: string[]) => void) => {
    if (query.length < 2) {
      setter([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(query)}&boundary.country=RU&size=5`
      );
      const data = await response.json();
      
      const suggestions = data.features?.map((feature: any) => feature.properties.label) || [];
      setter(suggestions);
    } catch (error) {
      console.error('Ошибка при получении подсказок:', error);
      setter([]);
    }
  };

  const calculateRoute = async () => {
    if (!pickupAddress.trim() || !destinationAddress.trim()) {
      alert('Пожалуйста, укажите адреса начала и конца маршрута');
      return;
    }

    setIsCalculating(true);

    try {
      // Получаем координаты для адресов
      const [pickupResponse, destinationResponse] = await Promise.all([
        fetch(`https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(pickupAddress)}&boundary.country=RU&size=1`),
        fetch(`https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(destinationAddress)}&boundary.country=RU&size=1`)
      ]);

      const pickupData = await pickupResponse.json();
      const destinationData = await destinationResponse.json();

      if (pickupData.features?.length === 0 || destinationData.features?.length === 0) {
        alert('Не удалось найти один из адресов');
        return;
      }

      const pickupCoords = pickupData.features[0].geometry.coordinates;
      const destinationCoords = destinationData.features[0].geometry.coordinates;

      // Рассчитываем маршрут
      const routeResponse = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coordinates: [pickupCoords, destinationCoords]
          })
        }
      );

      const routeData = await routeResponse.json();
      
      if (routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        const distanceKm = route.summary.distance / 1000;
        const durationMin = route.summary.duration / 60;
        const cost = Math.round(distanceKm * selectedCar.pricePerKm);

        // Получаем координаты маршрута для отображения на карте
        const routeCoords: [number, number][] = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);

        setRouteInfo({
          distance: Math.round(distanceKm * 10) / 10,
          duration: Math.round(durationMin),
          cost,
          pickupCoords: [pickupCoords[1], pickupCoords[0]],
          destinationCoords: [destinationCoords[1], destinationCoords[0]],
          routeCoords
        });
      }
    } catch (error) {
      console.error('Ошибка при расчете маршрута:', error);
      alert('Ошибка при расчете маршрута. Попробуйте еще раз.');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSuggestions(pickupAddress, setPickupSuggestions);
    }, 300);
    return () => clearTimeout(timeout);
  }, [pickupAddress]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSuggestions(destinationAddress, setDestinationSuggestions);
    }, 300);
    return () => clearTimeout(timeout);
  }, [destinationAddress]);

  // Пересчитываем стоимость при смене типа автомобиля
  useEffect(() => {
    if (routeInfo && routeInfo.distance > 0) {
      const newCost = Math.round(routeInfo.distance * selectedCar.pricePerKm);
      setRouteInfo({ ...routeInfo, cost: newCost });
    }
  }, [selectedCarType, routeInfo?.distance]);

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
                {/* Route Planning Card */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-taxi to-yellow-400 text-black">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Route" size={24} />
                      Планирование маршрута
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес подачи
                      </label>
                      <div className="relative">
                        <Icon name="MapPin" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                        <Input
                          placeholder="Введите адрес подачи"
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          className="pl-10 h-12 border-2 focus:border-taxi"
                        />
                      </div>
                      {pickupSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                          {pickupSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                              onClick={() => {
                                setPickupAddress(suggestion);
                                setPickupSuggestions([]);
                              }}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес назначения
                      </label>
                      <div className="relative">
                        <Icon name="MapPin" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                        <Input
                          placeholder="Введите адрес назначения"
                          value={destinationAddress}
                          onChange={(e) => setDestinationAddress(e.target.value)}
                          className="pl-10 h-12 border-2 focus:border-taxi"
                        />
                      </div>
                      {destinationSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                          {destinationSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                              onClick={() => {
                                setDestinationAddress(suggestion);
                                setDestinationSuggestions([]);
                              }}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={calculateRoute}
                      disabled={isCalculating}
                      className="w-full h-12 bg-taxi hover:bg-yellow-500 text-black font-semibold text-lg"
                    >
                      {isCalculating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          Расчет маршрута...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Icon name="Calculator" size={20} />
                          Рассчитать маршрут
                        </div>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Car Type Selection */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Car" size={20} />
                      Выбор автомобиля
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <RadioGroup value={selectedCarType} onValueChange={setSelectedCarType} className="space-y-4">
                      {carTypes.map((car) => (
                        <div key={car.id} className={`rounded-lg border-2 p-4 transition-all ${car.color} ${selectedCarType === car.id ? 'ring-2 ring-taxi' : ''}`}>
                          <div className="flex items-start space-x-3">
                            <RadioGroupItem value={car.id} id={car.id} className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor={car.id} className="flex items-center gap-2 font-semibold text-lg cursor-pointer">
                                <Icon name={car.icon as any} size={20} />
                                {car.name}
                                <span className="text-sm font-normal ml-auto">{car.pricePerKm} ₽/км</span>
                              </Label>
                              <p className="text-gray-600 text-sm mt-1">{car.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {car.features.map((feature, index) => (
                                  <span key={index} className="text-xs bg-white px-2 py-1 rounded-full border">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Map and Results */}
              <div className="space-y-6">
                {/* Interactive Map */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Map" size={20} />
                      Карта маршрута
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <TaxiMap
                      pickupCoords={routeInfo?.pickupCoords}
                      destinationCoords={routeInfo?.destinationCoords}
                      routeCoords={routeInfo?.routeCoords}
                      pickupAddress={pickupAddress}
                      destinationAddress={destinationAddress}
                    />
                  </CardContent>
                </Card>

                {/* Route Results */}
                {routeInfo && (
                  <Card className="shadow-lg border-2 border-taxi">
                    <CardHeader className="bg-gradient-to-r from-taxi to-yellow-400 text-black">
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="CheckCircle" size={24} />
                        Результат расчета
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Icon name="Ruler" size={32} className="mx-auto mb-2 text-blue-600" />
                          <div className="text-2xl font-bold text-blue-600">{routeInfo.distance} км</div>
                          <div className="text-sm text-gray-600">Расстояние</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <Icon name="Clock" size={32} className="mx-auto mb-2 text-green-600" />
                          <div className="text-2xl font-bold text-green-600">{routeInfo.duration} мин</div>
                          <div className="text-sm text-gray-600">Время в пути</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <Icon name="Banknote" size={32} className="mx-auto mb-2 text-yellow-600" />
                          <div className="text-3xl font-bold text-yellow-600">{routeInfo.cost} ₽</div>
                          <div className="text-sm text-gray-600">Стоимость поездки</div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-600">
                          Выбранный тариф: <span className="font-semibold">{selectedCar.name}</span> • <span className="font-semibold">{selectedCar.pricePerKm} ₽/км</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tariffs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {carTypes.map((car) => (
                <Card key={car.id} className={`shadow-lg border-2 ${car.color}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Icon name={car.icon as any} size={24} className="text-gray-700" />
                      <div>
                        <h3 className="font-bold text-xl">{car.name}</h3>
                        <p className="text-gray-600 font-normal text-sm">{car.description}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-2xl font-bold text-taxi">{car.pricePerKm} ₽/км</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Icon name="CheckCircle" size={16} className="text-green-600" />
                        Особенности:
                      </h4>
                      <ul className="space-y-2">
                        {car.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-2 h-2 bg-taxi rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-lg mt-6">
              <CardHeader className="bg-gradient-to-r from-taxi to-yellow-400 text-black">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" size={24} />
                  Дополнительная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Условия оплаты:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Наличными водителю</li>
                      <li>• Банковской картой через терминал</li>
                      <li>• Безналичный расчет для юридических лиц</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Дополнительные услуги:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Детское кресло (+100 ₽)</li>
                      <li>• Помощь с багажом (бесплатно)</li>
                      <li>• Остановки в пути (+50 ₽ за остановку)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;