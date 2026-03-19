
import React, { useState, useEffect } from 'react';
import { AssessmentEntry } from '../types';
import { generateDiet } from '../services/geminiService';
import { exportToPdf } from '../utils/pdfExport';

interface Props {
  assessment: AssessmentEntry;
}

const DietGenerator: React.FC<Props> = ({ assessment }) => {
  const [diet, setDiet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState<string>('Perda de gordura');
  const [restrictions, setRestrictions] = useState<string>('');
  const [showGoalSelector, setShowGoalSelector] = useState(true);

  useEffect(() => {
    setDiet(null);
    setShowGoalSelector(true);
    setError(null);
  }, [assessment.id]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setShowGoalSelector(false);
    try {
      const data = await generateDiet(assessment, goal, restrictions);
      setDiet(data);
    } catch (err) {
      setError("Não foi possível gerar a dieta no momento.");
      setShowGoalSelector(true);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!diet) return;
    setIsExporting(true);
    const filename = `Dieta_AN12_${assessment.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`;
    await exportToPdf('diet-plan-content', filename);
    setIsExporting(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="space-y-3 text-center">
          <p className="text-slate-400 text-sm animate-bounce">A IA está calculando seus macros e montando seu cardápio...</p>
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Plano Alimentar IA</h2>
        </div>
        {!showGoalSelector && diet && (
           <button 
            onClick={() => setShowGoalSelector(true)}
            className="text-xs font-bold text-emerald-600 uppercase tracking-widest hover:underline"
          >
            Ajustar Plano
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      {showGoalSelector ? (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Qual seu objetivo principal?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'Perda de gordura', label: 'Perda de Gordura' },
                { id: 'Ganho de massa muscular', label: 'Ganho de Massa' },
                { id: 'Manutenção', label: 'Manutenção' }
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                    goal === g.id 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-emerald-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Restrições ou Preferências (Opcional)</h3>
            <textarea
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="Ex: Sem glúten, vegetariano, não gosto de ovos, intolerante à lactose..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all min-h-[100px]"
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] shadow-xl"
          >
            Gerar Dieta Personalizada
          </button>
        </div>
      ) : diet ? (
        <div className="space-y-8">
          <div id="diet-plan-content" className="space-y-8 p-1">
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">{diet.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{diet.description}</p>
                </div>
                <div className="hidden pdf-only flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Alex Nego 12 Fitness</span>
                  <span className="text-[8px] text-slate-400">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Calorias</p>
                <p className="text-lg font-black text-emerald-600">{diet.macros.calories}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proteínas</p>
                <p className="text-lg font-black text-blue-600">{diet.macros.protein}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carbos</p>
                <p className="text-lg font-black text-orange-600">{diet.macros.carbs}</p>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gorduras</p>
                <p className="text-lg font-black text-red-600">{diet.macros.fats}</p>
              </div>
            </div>

            <div className="space-y-6">
              {diet.meals.map((meal: any, i: number) => (
                <div key={i} className="space-y-3 break-inside-avoid">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{meal.name}</h4>
                    {meal.time && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{meal.time}</span>}
                  </div>
                  <ul className="space-y-2">
                    {meal.items.map((item: string, j: number) => (
                      <li key={j} className="flex gap-3 text-sm items-start">
                        <span className="text-emerald-500 font-black">•</span>
                        <span className="text-slate-600 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 break-inside-avoid">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Dicas e Suplementação</h4>
              <ul className="space-y-3">
                {diet.tips.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm items-start">
                    <span className="text-emerald-500 font-black">•</span>
                    <span className="text-slate-600 dark:text-slate-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isExporting ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              )}
              {isExporting ? 'Exportando...' : 'Exportar Dieta (PDF)'}
            </button>
            
            <button
              onClick={() => setShowGoalSelector(true)}
              className="flex-1 py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Novo Plano Alimentar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DietGenerator;
