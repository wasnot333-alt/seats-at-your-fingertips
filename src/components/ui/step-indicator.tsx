import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300',
                currentStep > step.number
                  ? 'bg-primary text-primary-foreground'
                  : currentStep === step.number
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                'text-sm font-medium hidden sm:block',
                currentStep >= step.number
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-12 h-0.5 mx-3',
                currentStep > step.number ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
