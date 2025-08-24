import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface RouteInfo {
  distance: number;
  duration: number;
  cost: number;
}

const Index = () => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);

  const API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImZkM2Y1ZmZjNjUzZjQ3MzI4N2M4NWI0YTE3OTQwY2EzIiwiaCI6Im11cm11cjY0In0=';

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
        const cost = Math.round(distanceKm * 50);

        setRouteInfo({
          distance: Math.round(distanceKm * 10) / 10,
          duration: Math.round(durationMin),
          cost
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-roboto">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      Расчет по тарифу: <span className="font-semibold">50 ₽/км</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map Placeholder */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <Icon name="Map" size={48} className="mx-auto mb-2" />
                    <p>Карта маршрута появится здесь после расчета</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tariffs">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-taxi to-yellow-400 text-black">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CreditCard" size={24} />
                  Тарифы и цены
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <Icon name="Car" size={24} className="text-taxi" />
                      <div>
                        <h3 className="font-semibold text-lg">Стандартный тариф</h3>
                        <p className="text-gray-600">Обычные поездки по городу</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-taxi">50 ₽/км</div>
                      <div className="text-sm text-gray-500">+ подача бесплатно</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <Icon name="CheckCircle" size={20} className="text-green-600 mb-2" />
                      <h4 className="font-semibold text-green-800">Преимущества</h4>
                      <ul className="text-sm text-green-700 mt-2 space-y-1">
                        <li>• Прозрачное ценообразование</li>
                        <li>• Быстрый расчет стоимости</li>
                        <li>• Профессиональные водители</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Icon name="Info" size={20} className="text-blue-600 mb-2" />
                      <h4 className="font-semibold text-blue-800">Дополнительно</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Точный расчет по GPS</li>
                        <li>• Оплата наличными или картой</li>
                        <li>• Отслеживание поездки</li>
                      </ul>
                    </div>
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