import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import YandexMap from '@/components/YandexMap';

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

interface RouteResultsProps {
  routeInfo: RouteInfo | null;
  selectedCar: CarType;
  pickupAddress: string;
  destinationAddress: string;
  onSubmitOrder: () => void;
}

const RouteResults = ({
  routeInfo,
  selectedCar,
  pickupAddress,
  destinationAddress,
  onSubmitOrder
}: RouteResultsProps) => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    if (!routeInfo) {
      alert('Сначала рассчитайте маршрут');
      return;
    }

    if (!customerPhone.trim()) {
      alert('Пожалуйста, введите номер телефона');
      return;
    }

    // Валидация телефона (простая)
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      alert('Пожалуйста, введите корректный номер телефона');
      return;
    }

    setIsSubmitting(true);

    try {
      // Формируем данные для отправки
      const orderData = {
        pickup: pickupAddress,
        destination: destinationAddress,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        cost: routeInfo.cost,
        carType: selectedCar.name,
        pricePerKm: selectedCar.pricePerKm,
        phone: customerPhone.trim(),
        timestamp: new Date().toLocaleString('ru-RU')
      };

      // Формируем сообщение для отправки
      const message = `🚖 НОВЫЙ ЗАКАЗ ТАКСИ

📅 ${orderData.timestamp}

📍 МАРШРУТ:
• Откуда: ${orderData.pickup}
• Куда: ${orderData.destination}

🛣️ ДЕТАЛИ:
• Расстояние: ${orderData.distance} км
• Время: ${orderData.duration} мин
• Автомобиль: ${orderData.carType}
• Тариф: ${orderData.pricePerKm} ₽/км

💰 СТОИМОСТЬ: ${orderData.cost} ₽

📞 ТЕЛЕФОН: ${orderData.phone}`;

      // Для демонстрации используем WhatsApp Web API
      const whatsappNumber = '79991234567'; // Номер исполнителя
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // Открываем WhatsApp с готовым сообщением
      window.open(whatsappUrl, '_blank');
      
      // Показываем успешное сообщение
      alert('Заказ отправлен исполнителю через WhatsApp! Ожидайте подтверждения.');
      
      // Очищаем форму
      setCustomerPhone('');
      onSubmitOrder();
      
    } catch (error) {
      console.error('Ошибка при отправке заказа:', error);
      alert('Ошибка при отправке заказа. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          <YandexMap
            pickupCoords={routeInfo?.pickupCoords}
            destinationCoords={routeInfo?.destinationCoords}
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
            
            {/* Order Form */}
            <div className="mt-6 space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона заказчика
                </label>
                <div className="relative">
                  <Icon name="Phone" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                  <Input
                    placeholder="+7 (999) 123-45-67"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="pl-10 h-12 border-2 focus:border-taxi"
                    type="tel"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || !customerPhone.trim()}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Отправка заказа...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Icon name="Car" size={20} />
                    Заказать автомобиль • {routeInfo.cost} ₽
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RouteResults;