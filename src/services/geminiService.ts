
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentEntry } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI features will not work.");
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiInstance;
};

export const getAiInsights = async (assessment: AssessmentEntry, previousAssessment?: AssessmentEntry) => {
  const ai = getAi();
  const evolutionText = previousAssessment ? `
    EVOLUÇÃO (Comparação com a avaliação de ${new Date(previousAssessment.date).toLocaleDateString()}):
    - Peso anterior: ${previousAssessment.weight}kg (Atual: ${assessment.weight}kg)
    - BF anterior: ${previousAssessment.results.bodyFatPercentage.toFixed(1)}% (Atual: ${assessment.results.bodyFatPercentage.toFixed(1)}%)
    - Massa Magra anterior: ${previousAssessment.results.leanMass.toFixed(1)}kg (Atual: ${assessment.results.leanMass.toFixed(1)}kg)
  ` : '';

  const prompt = `
    Analise esta avaliação física e forneça recomendações personalizadas:
    - Nome: ${assessment.name}
    - Idade: ${assessment.age} anos
    - Sexo: ${assessment.sex}
    - Peso: ${assessment.weight}kg, Altura: ${assessment.height}cm
    - IMC: ${assessment.results.bmi.toFixed(1)} (${assessment.results.bmiCategory})
    - Percentual de Gordura Estimado: ${assessment.results.bodyFatPercentage.toFixed(1)}%
    - Massa Magra: ${assessment.results.leanMass.toFixed(1)}kg
    - Taxa Metabólica Basal (TMB): ${assessment.results.bmr.toFixed(0)} kcal
    ${evolutionText}
    
    Por favor, retorne um objeto JSON com:
    1. "summary": Uma análise curta do estado atual e da evolução (se houver).
    2. "risks": Possíveis riscos à saúde baseados nos dados.
    3. "suggestions": 3 dicas práticas de treino e nutrição considerando os objetivos de melhora.
    4. "motivation": Uma frase motivacional curta.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            motivation: { type: Type.STRING }
          },
          required: ["summary", "risks", "suggestions", "motivation"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    throw error;
  }
};

export const generateWorkout = async (assessment: AssessmentEntry, level: string, daysPerWeek: number, style: string) => {
  const ai = getAi();
  const prompt = `
    Com base nesta avaliação física, crie um plano de treino personalizado detalhado por dias da semana:
    - Nome: ${assessment.name}
    - Idade: ${assessment.age} anos
    - Sexo: ${assessment.sex}
    - Peso: ${assessment.weight}kg, Altura: ${assessment.height}cm
    - IMC: ${assessment.results.bmi.toFixed(1)}
    - Percentual de Gordura: ${assessment.results.bodyFatPercentage.toFixed(1)}%
    - Nível de Treinamento: ${level}
    - Frequência: ${daysPerWeek} dias por semana
    - Estilo de Treino: ${style} (ex: PPL, Full Body, Upper/Lower, ABC, etc.)
    
    Por favor, retorne um objeto JSON com:
    1. "title": Um título para o treino.
    2. "description": Uma breve explicação do foco do treino e como os dias são divididos.
    3. "schedule": Um array de objetos, cada um representando um dia de treino:
       - "dayName": Nome do dia (ex: "Dia 1 - Empurrar", "Dia 2 - Puxar", "Segunda-feira", etc.)
       - "focus": Foco muscular do dia.
       - "exercises": Um array de objetos com "name", "sets", "reps" e "notes".
    4. "recommendations": Dicas gerais para o sucesso do plano.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayName: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING },
                        notes: { type: Type.STRING }
                      },
                      required: ["name", "sets", "reps"]
                    }
                  }
                },
                required: ["dayName", "focus", "exercises"]
              }
            },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "schedule", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao gerar treino:", error);
    throw error;
  }
};

export const generateDiet = async (assessment: AssessmentEntry, goal: string, restrictions: string) => {
  const ai = getAi();
  const prompt = `
    Com base nesta avaliação física, crie um plano alimentar (dieta) personalizado:
    - Nome: ${assessment.name}
    - Idade: ${assessment.age} anos
    - Sexo: ${assessment.sex}
    - Peso: ${assessment.weight}kg, Altura: ${assessment.height}cm
    - IMC: ${assessment.results.bmi.toFixed(1)}
    - Percentual de Gordura: ${assessment.results.bodyFatPercentage.toFixed(1)}%
    - Taxa Metabólica Basal (TMB): ${assessment.results.bmr.toFixed(0)} kcal
    - Objetivo: ${goal} (ex: Perda de gordura, Ganho de massa muscular, Manutenção)
    - Restrições/Preferências: ${restrictions || 'Nenhuma'}
    
    Por favor, retorne um objeto JSON com:
    1. "title": Um título para a dieta.
    2. "description": Uma breve explicação da estratégia nutricional (ex: déficit calórico, superávit, macros).
    3. "macros": Um objeto com "protein", "carbs", "fats" e "calories" (estimados).
    4. "meals": Um array de objetos representando as refeições do dia:
       - "name": Nome da refeição (ex: "Café da Manhã", "Almoço", etc.)
       - "time": Sugestão de horário (opcional).
       - "items": Um array de strings com os alimentos e quantidades sugeridas.
    5. "tips": Dicas gerais de hidratação e suplementação (se necessário).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            macros: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.STRING },
                carbs: { type: Type.STRING },
                fats: { type: Type.STRING },
                calories: { type: Type.STRING }
              },
              required: ["protein", "carbs", "fats", "calories"]
            },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  time: { type: Type.STRING },
                  items: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "items"]
              }
            },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "macros", "meals", "tips"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao gerar dieta:", error);
    throw error;
  }
};
