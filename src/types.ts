
export type Sex = 'masculino' | 'feminino';

export interface Skinfolds {
  pectoral: number;
  midaxillary: number;
  triceps: number;
  subscapular: number;
  abdominal: number;
  suprailiac: number;
  thigh: number;
}

export interface AssessmentData {
  id: string;
  date: string;
  name: string;
  age: number;
  sex: Sex;
  weight: number; // kg
  height: number; // cm
  waist: number; // cm
  hip: number; // cm
  neck: number; // cm
  photo?: string; // Base64 image
  skinfolds?: Skinfolds;
}

export interface AssessmentResults {
  bmi: number;
  bmiCategory: string;
  bodyFatPercentage: number;
  leanMass: number;
  fatMass: number;
  bmr: number; // Basal Metabolic Rate
  waistToHipRatio: number;
  methodUsed: 'Marinha' | 'Pollock 7';
  sumSkinfolds?: number;
}

export interface AssessmentEntry extends AssessmentData {
  results: AssessmentResults;
}
