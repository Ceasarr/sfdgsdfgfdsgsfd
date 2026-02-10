'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
    number: number;
    title: string;
}

interface StepperProps {
    currentStep: number;
    steps: Step[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                                    currentStep > step.number
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : currentStep === step.number
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'bg-gray-100 border-gray-300 text-gray-500'
                                )}
                            >
                                {currentStep > step.number ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <span className="text-sm font-semibold">{step.number}</span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    'mt-2 text-xs font-medium transition-colors duration-300',
                                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                                )}
                            >
                                {step.title}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'flex-1 h-0.5 mx-2 transition-colors duration-300',
                                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
