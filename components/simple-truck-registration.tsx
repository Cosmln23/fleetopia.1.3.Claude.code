'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, User, Phone, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TruckRegistrationProps {
  onComplete: (data: TruckData) => void;
  onSkip?: () => void;
}

interface TruckData {
  driverName: string;
  phone: string;
  truckType: string;
  licensePlate: string;
  maxWeight: string;
  preferredRoutes: string;
}

export function SimpleTruckRegistration({ onComplete, onSkip }: TruckRegistrationProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TruckData>({
    driverName: '',
    phone: '',
    truckType: '',
    licensePlate: '',
    maxWeight: '',
    preferredRoutes: ''
  });

  const handleInputChange = (field: keyof TruckData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.driverName && formData.phone;
      case 2:
        return formData.truckType && formData.licensePlate && formData.maxWeight;
      case 3:
        return true; // Step 3 is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Truck className="w-12 h-12 text-blue-600 mr-4" />
            <div>
              <CardTitle className="text-2xl">Înregistrează-ți camionul</CardTitle>
              <CardDescription>
                Completează profilul pentru oferte personalizate
              </CardDescription>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }`}>
                  {step > stepNum ? <CheckCircle className="w-4 h-4" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <ArrowRight className={`w-4 h-4 mx-2 ${step > stepNum ? 'text-blue-600' : 'text-gray-400'}`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <User className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold">Hai să ne cunoaștem!</h3>
                <p className="text-gray-600">Cum te cheamă și cum te contactăm?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="driverName">Numele tău complet</Label>
                  <Input
                    id="driverName"
                    placeholder="ex: Ion Popescu"
                    value={formData.driverName}
                    onChange={(e) => handleInputChange('driverName', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Numărul de telefon</Label>
                  <Input
                    id="phone"
                    placeholder="ex: +40 722 123 456"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Pe acest număr te vor contacta expeditorii
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Truck Info */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <Truck className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold">Spune-ne despre camionul tău</h3>
                <p className="text-gray-600">Aceste informații ne ajută să găsim oferte potrivite</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="truckType">Tipul camionului</Label>
                  <Select value={formData.truckType} onValueChange={(value) => handleInputChange('truckType', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Alege tipul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="curtain_sider">Prelată (Curtain Sider)</SelectItem>
                      <SelectItem value="refrigerated">Frigorific</SelectItem>
                      <SelectItem value="box_truck">Camion cu caroserie închisă</SelectItem>
                      <SelectItem value="flatbed">Platformă deschisă</SelectItem>
                      <SelectItem value="tanker">Cisternă</SelectItem>
                      <SelectItem value="car_carrier">Transport auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxWeight">Capacitatea maximă</Label>
                  <Select value={formData.maxWeight} onValueChange={(value) => handleInputChange('maxWeight', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Greutate max" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3500">până la 3.5 tone</SelectItem>
                      <SelectItem value="7500">până la 7.5 tone</SelectItem>
                      <SelectItem value="12000">până la 12 tone</SelectItem>
                      <SelectItem value="18000">până la 18 tone</SelectItem>
                      <SelectItem value="24000">până la 24 tone</SelectItem>
                      <SelectItem value="40000">până la 40 tone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="licensePlate">Numărul de înmatriculare</Label>
                <Input
                  id="licensePlate"
                  placeholder="ex: B 123 ABC"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <MapPin className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold">Preferințele tale de transport</h3>
                <p className="text-gray-600">Unde îți place să mergi cu camionul? (opțional)</p>
              </div>

              <div>
                <Label htmlFor="preferredRoutes">Rutele preferate</Label>
                <Input
                  id="preferredRoutes"
                  placeholder="ex: România - Germania, România - Italia"
                  value={formData.preferredRoutes}
                  onChange={(e) => handleInputChange('preferredRoutes', e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Te vom notifica prioritar pentru aceste rute
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Ce urmează?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Vei primi oferte personalizate pe telefon</li>
                  <li>✓ Contact direct cu expeditorii</li>
                  <li>✓ Calculator automat de profit pentru fiecare ofertă</li>
                  <li>✓ Notificări pentru rutele tale preferate</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Înapoi
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {onSkip && step === 1 && (
                <Button variant="ghost" onClick={onSkip}>
                  Sari peste înregistrare
                </Button>
              )}
              
              <Button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className={step === 3 ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {step === 3 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizează înregistrarea
                  </>
                ) : (
                  <>
                    Continuă
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress text */}
          <div className="text-center text-sm text-gray-500">
            Pasul {step} din 3 • {step === 1 ? 'Informații personale' : step === 2 ? 'Detalii camion' : 'Preferințe'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
