import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface RouteFormProps {
  pickupAddress: string;
  setPickupAddress: (address: string) => void;
  destinationAddress: string;
  setDestinationAddress: (address: string) => void;
  onCalculateRoute: () => void;
  isCalculating: boolean;
}

const RouteForm = ({
  pickupAddress,
  setPickupAddress,
  destinationAddress,
  setDestinationAddress,
  onCalculateRoute,
  isCalculating
}: RouteFormProps) => {
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([]);

  const YANDEX_API_KEY = '7d998dde-4bf4-4d81-af59-deb970d41bad';

  const fetchSuggestions = async (query: string, setter: (suggestions: string[]) => void) => {
    if (query.length < 2) {
      setter([]);
      return;
    }

    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&format=json&geocode=${encodeURIComponent(query)}&results=5`
      );
      const data = await response.json();
      
      const suggestions = data.response?.GeoObjectCollection?.featureMember?.map(
        (item: any) => item.GeoObject.metaDataProperty.GeocoderMetaData.text
      ) || [];
      setter(suggestions);
    } catch (error) {
      console.error('Ошибка при получении подсказок:', error);
      setter([]);
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
          onClick={onCalculateRoute}
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
  );
};

export default RouteForm;