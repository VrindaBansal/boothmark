import { useState } from 'react';
import { X, Sparkles, Calendar, Camera, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export default function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      title: 'Welcome to Career Fair Buddy',
      description: `Hi${userName ? ` ${userName}` : ''}! Let's get you started with your career fair journey.`,
    },
    {
      icon: <Calendar className="h-12 w-12 text-primary" />,
      title: 'Create Your First Career Fair',
      description: 'Add details like date, location, and notes to stay organized.',
    },
    {
      icon: <Camera className="h-12 w-12 text-primary" />,
      title: 'Scan Company Materials',
      description: 'Use your camera or upload PDFs to quickly capture company details with OCR.',
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-primary" />,
      title: 'Track Your Progress',
      description: 'Manage follow-ups, track applications, and never miss an opportunity.',
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-lg shadow-glow border-0 animate-scale-in">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex justify-center mb-4">
            {currentStepData.icon}
          </div>
          <CardTitle className="text-3xl font-bold">
            {currentStepData.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8 pb-8">
          <p className="text-center text-muted-foreground text-lg leading-relaxed px-4">
            {currentStepData.description}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {!isLastStep && (
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1 rounded-full"
              >
                Skip
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 rounded-full"
            >
              {isLastStep ? "Let's Get Started!" : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
