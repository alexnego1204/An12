
import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Sun, 
  PlusCircle, 
  History, 
  FileText, 
  Dumbbell, 
  Utensils, 
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Share2,
  Download,
  Trash2,
  Plus
} from 'lucide-react';
import { AssessmentData, AssessmentEntry } from './types';
import { calculateResults } from './utils/calculations';
import { exportToPdf } from './utils/pdfExport';
import AssessmentForm from './components/AssessmentForm';
import ResultsDisplay from './components/ResultsDisplay';
import AiInsightsPanel from './components/AiInsightsPanel';
import WorkoutGenerator from './components/WorkoutGenerator';
import DietGenerator from './components/DietGenerator';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    const { hasError } = this.state as any;
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 text-center border border-red-100 dark:border-red-900/30">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Ops! Algo deu errado</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Ocorreu um erro inesperado ao carregar o aplicativo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20"
            >
              <RefreshCw className="w-5 h-5" />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path d="M75,35 C75,20 65,10 50,10 C35,10 25,20 25,35 L20,40 L20,85 C20,92 28,95 50,95 C72,95 80,92 80,85 L80,40 L75,35 Z" fill="url(#brandGradient)" />
        <path d="M35,35 C35,28 42,22 50,22 C58,22 65,28 65,35" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
        <text x="50" y="72" textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="Inter, sans-serif">A</text>
      </svg>
    </div>
    <div className="flex flex-col -space-y-1">
      <div className="flex items-baseline">
        <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">ALEX NEGO</span>
        <span className="text-[10px] sm:text-sm font-bold text-slate-900 dark:text-white ml-0.5 relative -top-1">12</span>
      </div>
      <span className="text-sm sm:text-lg font-black tracking-[0.2em] uppercase bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
        FITNESS
      </span>
    </div>
  </div>
);

const App: React.FC = () => {
  useEffect(() => {
    console.log("App component mounted successfully.");
  }, []);

  const [history, setHistory] = useState<AssessmentEntry[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentEntry | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch (e) {
      console.warn("Could not access localStorage:", e);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('fitcheck_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  const [prefillName, setPrefillName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'report' | 'workout' | 'diet'>('report');

  const updateCurrentAssessment = (updatedEntry: AssessmentEntry) => {
    setCurrentAssessment(updatedEntry);
    const newHistory = history.map(h => h.id === updatedEntry.id ? updatedEntry : h);
    setHistory(newHistory);
    localStorage.setItem('fitcheck_history', JSON.stringify(newHistory));
  };

  const handleCalculate = (data: AssessmentData) => {
    const results = calculateResults(data);
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const entry: AssessmentEntry = { ...data, results, id };
    
    setCurrentAssessment(entry);
    const newHistory = [...history, entry];
    setHistory(newHistory);
    localStorage.setItem('fitcheck_history', JSON.stringify(newHistory));
    setPrefillName(null); // Clear prefill after calculation
    setActiveTab('report'); // Reset to report tab on new calculation
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('fitcheck_history');
    setCurrentAssessment(null);
    setShowClearConfirm(false);
  };

  const deleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem('fitcheck_history', JSON.stringify(newHistory));
    if (currentAssessment?.id === id) {
      setCurrentAssessment(null);
    }
  };

  const handleExportPdf = async () => {
    if (!currentAssessment) {
      alert("Selecione ou gere uma avaliação primeiro.");
      return;
    }
    setIsExporting(true);
    const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const filename = `${currentAssessment.name.replace(/\s+/g, '_')}_${dateStr}`;
    await exportToPdf('report-content', filename);
    setIsExporting(false);
  };

  const handleShare = async () => {
    if (!currentAssessment) return;
    
    const text = `Avaliação Física Alex Nego 12\n\nCliente: ${currentAssessment.name}\nData: ${new Date(currentAssessment.date).toLocaleDateString()}\n\nResultados:\n- BF: ${currentAssessment.results.bodyFatPercentage.toFixed(1)}%\n- Massa Magra: ${currentAssessment.results.leanMass.toFixed(1)}kg\n- IMC: ${currentAssessment.results.bmi.toFixed(1)} (${currentAssessment.results.bmiCategory})\n\nGerado por Alex Nego 12 Fitness.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Avaliação Física AN12',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('Resumo copiado para a área de transferência!');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col pb-12 transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300 px-4 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-orange-400 transition-all active:scale-95"
                aria-label="Alternar Tema"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="hidden md:block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                Physical Assessment Pro
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 mt-4 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
          <div className="lg:col-span-1 space-y-6 order-1 lg:order-1">
            <AssessmentForm 
              onCalculate={handleCalculate} 
              history={history} 
              prefillName={prefillName} 
              onClearPrefill={() => setPrefillName(null)}
            />
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-widest">Painel de Ações</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    setCurrentAssessment(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-100 dark:hover:border-slate-700 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <Plus className="w-4 h-4" />
                  </div>
                  Nova Avaliação
                </button>
                
                <button 
                  onClick={handleExportPdf}
                  disabled={!currentAssessment || isExporting}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 rounded-xl transition shadow-lg shadow-red-100 dark:shadow-none active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    {isExporting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </div>
                  {isExporting ? 'Gerando Relatório...' : 'Exportar para PDF'}
                </button>

                <button 
                  onClick={handleShare}
                  disabled={!currentAssessment}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition border border-transparent hover:border-slate-100 dark:hover:border-slate-700 flex items-center gap-3 disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <Share2 className="w-4 h-4" />
                  </div>
                  Compartilhar Resumo
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setShowClearConfirm(!showClearConfirm)}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    Limpar Banco de Dados
                  </button>
                  
                  <AnimatePresence>
                    {showClearConfirm && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-red-100 dark:border-red-900/30 z-10"
                      >
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3">Confirmar exclusão de TODOS os dados?</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={clearHistory}
                            className="flex-1 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition"
                          >
                            Sim, Apagar
                          </button>
                          <button 
                            onClick={() => setShowClearConfirm(false)}
                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4 tracking-widest">Histórico Recente</h3>
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum registro encontrado.</p>
              ) : (
                <div className="space-y-3">
                  {history.slice(-3).reverse().map((h) => (
                    <div 
                      key={h.id} 
                      onClick={() => {
                        setCurrentAssessment(h);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group relative p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-orange-50 dark:hover:bg-orange-950/20 border border-transparent hover:border-orange-100 dark:hover:border-orange-900/50 cursor-pointer transition"
                    >
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 pr-6">{h.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-slate-400 uppercase">{new Date(h.date).toLocaleDateString()}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrefillName(h.name);
                              setCurrentAssessment(null); // Clear current view to show form
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-wider"
                          >
                            Reavaliar
                          </button>
                          <p className="text-xs font-bold text-orange-600 dark:text-orange-400">{h.weight}kg</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => deleteEntry(h.id, e)}
                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8 order-2 lg:order-2">
            {currentAssessment ? (
              <div id="report-content" className="space-y-6 sm:space-y-8 relative">
                {/* Watermark */}
                <div className="pdf-watermark" />

                {/* Professional PDF Header */}
                <div className="hidden pdf-only flex-col items-center text-center border-b-2 border-slate-900 dark:border-white pb-6 mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-slate-900 dark:bg-white rounded-lg">
                      <svg className="w-8 h-8 text-white dark:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Alex Nego 12 <span className="text-orange-600">Fitness</span></h1>
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">Consultoria Esportiva & Performance</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Relatório de Performance</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Cliente: <span className="font-bold text-slate-700 dark:text-slate-200">{currentAssessment.name}</span> • {new Date(currentAssessment.date).toLocaleDateString()}</p>
                  </div>
                  <div className="self-start sm:self-center px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors">Relatório Oficial</div>
                </div>

                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar no-print relative z-10">
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`flex-1 py-3 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                      activeTab === 'report' 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Relatório
                  </button>
                  <button
                    onClick={() => setActiveTab('workout')}
                    className={`flex-1 py-3 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                      activeTab === 'workout' 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <Dumbbell className="w-3.5 h-3.5" />
                    Treino
                  </button>
                  <button
                    onClick={() => setActiveTab('diet')}
                    className={`flex-1 py-3 px-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                      activeTab === 'diet' 
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    Dieta
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10"
                  >
                    {activeTab === 'report' && (
                      <div className="space-y-8">
                        <ResultsDisplay assessment={currentAssessment} history={history} />
                        <AiInsightsPanel assessment={currentAssessment} history={history} />
                      </div>
                    )}

                    {activeTab === 'workout' && (
                      <WorkoutGenerator 
                        assessment={currentAssessment} 
                        onUpdate={(workout) => updateCurrentAssessment({ ...currentAssessment, workout })}
                      />
                    )}

                    {activeTab === 'diet' && (
                      <DietGenerator 
                        assessment={currentAssessment} 
                        onUpdate={(diet) => updateCurrentAssessment({ ...currentAssessment, diet })}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Professional PDF Footer */}
                <div className="hidden pdf-only flex-col items-center text-center pt-8 border-t border-slate-100 dark:border-slate-800 mt-12">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Alex Nego 12 Fitness</p>
                  <p className="text-[8px] text-slate-400">Este relatório é confidencial e destinado exclusivamente ao cliente mencionado.</p>
                </div>
              </div>
            ) : (
              <div className="h-[300px] sm:h-[500px] flex flex-col items-center justify-center text-center p-6 sm:p-12 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-orange-200 dark:text-orange-700" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Inicie sua Avaliação</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-xs mt-2 text-sm leading-relaxed">Insira os dados antropométricos abaixo para gerar o diagnóstico Alex Nego 12.</p>
                
                <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800 inline-flex items-center gap-3">
                   <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">
                      <Plus className="w-4 h-4" />
                   </div>
                   <p className="text-[10px] font-black uppercase text-orange-700 dark:text-orange-400 tracking-wider">Dica: Instale como App pelo navegador!</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
