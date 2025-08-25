import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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

interface CarTypeSelectionProps {
  carTypes: CarType[];
  selectedCarType: string;
  onCarTypeChange: (carType: string) => void;
}

const CarTypeSelection = ({
  carTypes,
  selectedCarType,
  onCarTypeChange
}: CarTypeSelectionProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Car" size={20} />
          Выбор автомобиля
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <RadioGroup value={selectedCarType} onValueChange={onCarTypeChange} className="space-y-4">
          {carTypes.map((car) => (
            <div 
              key={car.id} 
              className={`rounded-lg border-2 p-4 transition-all ${car.color} ${selectedCarType === car.id ? 'ring-2 ring-taxi' : ''}`}
            >
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
  );
};

export default CarTypeSelection;