
import React, { useState, useEffect } from 'react';
import { AssessmentEntry } from '../types';
import { generateWorkout } from '../services/geminiService';
import { exportToPdf } from '../utils/pdfExport';

interface Props {
  assessment: AssessmentEntry;
}

const WorkoutGenerator: React.FC<Props> = ({ assessment }) => {
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<string>('Iniciante');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(3);
  const [style, setStyle] = useState<string>('Full Body');
  const [showGoalSelector, setShowGoalSelector] = useState(true);

  useEffect(() => {
    setWorkout(null);
    setShowGoalSelector(true);
    setError(null);
  }, [assessment.id]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setShowGoalSelector(false);
    try {
      const data = await generateWorkout(assessment, level, daysPerWeek, style);
      setWorkout(data);
    } catch (err) {
      setError("Não foi possível gerar o treino no momento.");
      setShowGoalSelector(true);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!workout) return;
    setIsExporting(true);
    const filename = `Treino_AN12_${assessment.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`;
    await exportToPdf('workout-plan-content', filename);
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
          <p className="text-slate-400 text-sm animate-bounce">A IA está montando sua rotina de treinos personalizada...</p>
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
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Plano de Treino IA</h2>
        </div>
        {!showGoalSelector && workout && (
           <button 
            onClick={() => setShowGoalSelector(true)}
            className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline"
          >
            Ajustar Treino
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
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Qual seu nível atual?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Iniciante', 'Intermediário', 'Avançado'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                    level === l 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-none' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Quantos dias por semana?</h3>
            <div className="flex gap-3">
              {[2, 3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  onClick={() => setDaysPerWeek(d)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                    daysPerWeek === d 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-none' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">3. Estilo de Treino Preferido</h3>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="Full Body">Full Body (Corpo Todo)</option>
              <option value="Upper/Lower">Upper/Lower (Superior/Inferior)</option>
              <option value="PPL">Push/Pull/Legs (Empurrar/Puxar/Pernas)</option>
              <option value="ABC">ABC (Divisão Clássica)</option>
              <option value="HIIT">HIIT / Funcional</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-[0.98] shadow-xl"
          >
            Gerar Treino Personalizado
          </button>
        </div>
      ) : workout ? (
        <div className="space-y-8">
          <div id="workout-plan-content" className="space-y-8 p-1">
            <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-blue-700 dark:text-blue-400 uppercase tracking-tight">{workout.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{workout.description}</p>
                </div>
                <div className="hidden pdf-only flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Alex Nego 12 Fitness</span>
                  <span className="text-[8px] text-slate-400">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {workout.schedule.map((day: any, i: number) => (
                <div key={i} className="space-y-4 break-inside-avoid">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{day.dayName}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase">•</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{day.focus}</span>
                  </div>
                  
                  <div className="grid gap-3">
                    {day.exercises.map((ex: any, j: number) => (
                      <div key={j} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{ex.name}</p>
                          {ex.notes && <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">{ex.notes}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-blue-600 uppercase">{ex.sets} x {ex.reps}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 break-inside-avoid">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recomendações de Sucesso</h4>
              <ul className="space-y-3">
                {workout.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm items-start">
                    <span className="text-blue-500 font-black">•</span>
                    <span className="text-slate-600 dark:text-slate-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isExporting ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              )}
              {isExporting ? 'Exportando...' : 'Exportar Treino (PDF)'}
            </button>
            
            <button
              onClick={() => setShowGoalSelector(true)}
              className="flex-1 py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Nova Rotina de Treino
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WorkoutGenerator;
