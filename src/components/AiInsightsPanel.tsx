
import React, { useState, useEffect } from 'react';
import { AssessmentEntry } from '../types';
import { getAiInsights } from '../services/geminiService';

interface Props {
  assessment: AssessmentEntry;
  history: AssessmentEntry[];
}

const AiInsightsPanel: React.FC<Props> = ({ assessment, history }) => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previousAssessment = history
    .filter(h => h.name === assessment.name && h.id !== assessment.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAiInsights(assessment, previousAssessment);
        setInsights(data);
      } catch (err: any) {
        const message = err.message?.includes("API Key") 
          ? "Configuração Necessária: A chave da API Gemini não foi encontrada. Por favor, adicione GEMINI_API_KEY nos Segredos (ícone de engrenagem)."
          : "Não foi possível carregar os insights da IA no momento.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [assessment, previousAssessment]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl text-white shadow-xl animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-white/10 rounded-full"></div>
          <div className="h-6 w-48 bg-white/10 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-white/10 rounded"></div>
          <div className="h-4 w-3/4 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl text-red-700 border border-red-100 text-sm font-bold text-center">
        {error}
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden border border-slate-700">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
           <path d="M75,35 C75,20 65,10 50,10 C35,10 25,20 25,35 L20,40 L20,85 C20,92 28,95 50,95 C72,95 80,92 80,85 L80,40 L75,35 Z" />
        </svg>
      </div>

      <div className="flex items-center gap-3 mb-8 relative">
        <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-black uppercase tracking-tighter">AN12 <span className="text-orange-500">Intelligent Insights</span></h2>
      </div>

      <div className="space-y-8 relative">
        <section className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-slate-300 italic text-base leading-relaxed font-medium">"{insights.summary}"</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-orange-400">Plano de Ação</h3>
            <ul className="space-y-3">
              {insights.suggestions.map((s: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm leading-snug items-start">
                  <span className="w-5 h-5 flex-shrink-0 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center font-black text-[10px]">✓</span> 
                  <span className="text-slate-200">{s}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-red-400">Pontos de Atenção</h3>
            <ul className="space-y-3">
              {insights.risks.map((r: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm leading-snug items-start">
                  <span className="w-5 h-5 flex-shrink-0 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center font-black text-[10px]">!</span> 
                  <span className="text-slate-200">{r}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="pt-6 border-t border-white/5 text-center">
          <p className="text-xl font-black italic tracking-tighter bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent uppercase">
            "{insights.motivation}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiInsightsPanel;
