
import { AssessmentData, AssessmentResults, Sex } from '../types';

export function calculateResults(data: AssessmentData): AssessmentResults {
  const { weight, height, age, sex, waist, neck, hip, skinfolds } = data;
  const heightM = height / 100;
  
  // BMI
  const bmi = weight / (heightM * heightM);
  let bmiCategory = '';
  if (bmi < 18.5) bmiCategory = 'Abaixo do peso';
  else if (bmi < 25) bmiCategory = 'Peso normal';
  else if (bmi < 30) bmiCategory = 'Sobrepeso';
  else if (bmi < 35) bmiCategory = 'Obesidade Grau I';
  else if (bmi < 40) bmiCategory = 'Obesidade Grau II';
  else bmiCategory = 'Obesidade Grau III';

  // BMR (Mifflin-St Jeor)
  const bmr = sex === 'masculino' 
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;

  // Body Fat Percentage
  let bodyFatPercentage = 0;
  let methodUsed: 'Marinha' | 'Pollock 7' = 'Marinha';
  let sumSkinfolds = 0;

  if (skinfolds) {
    methodUsed = 'Pollock 7';
    sumSkinfolds = Object.values(skinfolds).reduce((acc, val) => acc + (val || 0), 0);
    
    let bodyDensity = 0;
    if (sex === 'masculino') {
      bodyDensity = 1.112 - (0.00043499 * sumSkinfolds) + (0.00000055 * sumSkinfolds * sumSkinfolds) - (0.00028826 * age);
    } else {
      bodyDensity = 1.097 - (0.00046971 * sumSkinfolds) + (0.00000056 * sumSkinfolds * sumSkinfolds) - (0.00012828 * age);
    }
    
    bodyFatPercentage = (4.95 / bodyDensity - 4.50) * 100;
  } else {
    // Navy Method
    if (sex === 'masculino') {
      bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waist + (hip || waist) - neck) + 0.22100 * Math.log10(height)) - 450;
    }
  }

  // Ensure body fat is not negative or unrealistically high
  bodyFatPercentage = Math.max(2, Math.min(60, bodyFatPercentage));

  const fatMass = weight * (bodyFatPercentage / 100);
  const leanMass = weight - fatMass;
  const waistToHipRatio = hip ? waist / hip : 0;

  return {
    bmi,
    bmiCategory,
    bodyFatPercentage,
    leanMass,
    fatMass,
    bmr,
    waistToHipRatio,
    methodUsed,
    sumSkinfolds: methodUsed === 'Pollock 7' ? sumSkinfolds : undefined
  };
}
