'use client';

import { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validation?: () => boolean;
}

interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  data: any;
  updateData: (key: string, value: any) => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

interface WizardProps {
  steps: WizardStep[];
  onComplete: (data: any) => void;
  className?: string;
}

export function Wizard({ steps, onComplete, className = '' }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  const updateData = (key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const contextValue: WizardContextType = {
    currentStep,
    totalSteps: steps.length,
    nextStep,
    prevStep,
    goToStep,
    data,
    updateData
  };

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={`wizard-container ${className}`}>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 transition-colors ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">
              {currentStepData.title}
            </h2>
            <p className="text-gray-400 mt-1">{currentStepData.description}</p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="step-content mb-8"
          >
            <StepComponent data={data} updateData={updateData} />
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={nextStep}
            className="flex items-center"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            {currentStep < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>
      </div>
    </WizardContext.Provider>
  );
}

export function WizardStep({ children }: { children: React.ReactNode }) {
  return <div className="wizard-step">{children}</div>;
} 