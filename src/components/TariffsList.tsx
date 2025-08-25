import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CarType {
  id: string;
  name: string;
  description: string;
  pricePerKm: number;
  icon: string;
  features: string[];
  color: string;
}

interface TariffsListProps {
  carTypes: CarType[];
}

const TariffsList = ({ carTypes }: TariffsListProps) => {
  return (
    <div className="space-y-6">
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

      <Card className="shadow-lg">
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
    </div>
  );
};

export default TariffsList;