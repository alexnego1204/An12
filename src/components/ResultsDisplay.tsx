
import React from 'react';
import { AssessmentEntry } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Props {
  assessment: AssessmentEntry;
  history: AssessmentEntry[];
}

const ResultsDisplay: React.FC<Props> = ({ assessment, history }) => {
  const { results, skinfolds } = assessment;
  const isDark = document.documentElement.classList.contains('dark');

  const personHistory = history
    .filter(h => h.name === assessment.name && h.id !== assessment.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const previousAssessment = personHistory[0];

  const getDiff = (current: number, previous: number) => {
    const diff = current - previous;
    const isPositive = diff > 0;
    const color = isPositive ? 'text-red-500' : 'text-emerald-500';
    const sign = isPositive ? '+' : '';
    return { diff: `${sign}${diff.toFixed(1)}`, color };
  };

  const bfDiff = previousAssessment ? getDiff(results.bodyFatPercentage, previousAssessment.results.bodyFatPercentage) : null;
  const weightDiff = previousAssessment ? getDiff(assessment.weight, previousAssessment.weight) : null;
  const leanMassDiff = previousAssessment ? getDiff(results.leanMass, previousAssessment.results.leanMass) : null;
  // For lean mass, positive is good
  const leanMassColor = leanMassDiff ? (parseFloat(leanMassDiff.diff) > 0 ? 'text-emerald-500' : 'text-red-500') : '';

  const pieData = [
    { name: 'Massa Magra', value: results.leanMass },
    { name: 'Massa Gorda', value: results.fatMass },
  ];

  const COLORS = ['#f97316', '#dc2626'];

  const historyData = history.slice(-5).map(h => ({
    date: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    weight: h.weight,
    bf: h.results.bodyFatPercentage
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ResultCard 
          label="Gordura (BF)" 
          value={`${results.bodyFatPercentage.toFixed(1)}%`} 
          subtext={`Método: ${results.methodUsed}`} 
          color="orange" 
          diff={bfDiff?.diff}
          diffColor={bfDiff?.color}
        />
        <ResultCard 
          label="Massa Magra" 
          value={`${results.leanMass.toFixed(1)}kg`} 
          subtext="Peso Magro" 
          color="indigo" 
          diff={leanMassDiff?.diff}
          diffColor={leanMassColor}
        />
        <ResultCard 
          label="Metabolismo (TMB)" 
          value={`${results.bmr.toFixed(0)} kcal`} 
          subtext="Basal" 
          color="red" 
        />
        <ResultCard 
          label="Peso Atual" 
          value={`${assessment.weight}kg`} 
          subtext={results.bmiCategory} 
          color="slate" 
          diff={weightDiff?.diff}
          diffColor={weightDiff?.color}
        />
      </div>

      {skinfolds && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">Detalhamento de Dobras</h3>
            <span className="bg-orange-100 dark:bg-orange-950/40 px-3 py-1 rounded-full text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase">Σ {results.sumSkinfolds?.toFixed(1)}mm</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SkinfoldBadge label="Peitoral" value={skinfolds.pectoral} />
            <SkinfoldBadge label="Axilar M." value={skinfolds.midaxillary} />
            <SkinfoldBadge label="Tríceps" value={skinfolds.triceps} />
            <SkinfoldBadge label="Subescap." value={skinfolds.subscapular} />
            <SkinfoldBadge label="Abdominal" value={skinfolds.abdominal} />
            <SkinfoldBadge label="Suprail." value={skinfolds.suprailiac} />
            <SkinfoldBadge label="Coxa" value={skinfolds.thigh} />
          </div>
        </div>
      )}

      {(assessment.photo || previousAssessment?.photo) && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight mb-4">Evolução Visual</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Anterior {previousAssessment ? `(${new Date(previousAssessment.date).toLocaleDateString()})` : ''}</p>
              <div className="aspect-[3/4] rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center relative">
                {previousAssessment?.photo ? <img src={previousAssessment.photo} className="w-full h-full object-cover" alt="Anterior" /> : <div className="text-slate-300 dark:text-slate-700 flex flex-col items-center gap-2 uppercase text-[10px] font-black">Sem Registro</div>}
              </div>
              {previousAssessment && <div className="flex justify-between px-1"><span className="text-xs font-bold text-slate-500 dark:text-slate-400">{previousAssessment.weight}kg</span><span className="text-xs font-black text-slate-900 dark:text-slate-200">BF: {previousAssessment.results.bodyFatPercentage.toFixed(1)}%</span></div>}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Atual ({new Date(assessment.date).toLocaleDateString()})</p>
              <div className="aspect-[3/4] rounded-xl bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/50 overflow-hidden flex items-center justify-center relative">
                {assessment.photo ? <img src={assessment.photo} className="w-full h-full object-cover" alt="Atual" /> : <div className="text-orange-300 dark:text-orange-900 flex flex-col items-center gap-2 uppercase text-[10px] font-black text-center px-4 transition-colors">Foto Não Anexada</div>}
              </div>
              <div className="flex justify-between px-1"><span className="text-xs font-bold text-slate-500 dark:text-slate-400">{assessment.weight}kg</span><span className="text-xs font-black text-orange-600 dark:text-orange-400">BF: {results.bodyFatPercentage.toFixed(1)}%</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {previousAssessment && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight mb-4">Resumo da Evolução</h3>
            <div className="space-y-4">
              <EvolutionRow 
                label="Peso Corporal" 
                current={assessment.weight} 
                previous={previousAssessment.weight} 
                unit="kg" 
                inverse={true}
              />
              <EvolutionRow 
                label="Gordura Corporal" 
                current={results.bodyFatPercentage} 
                previous={previousAssessment.results.bodyFatPercentage} 
                unit="%" 
                inverse={true}
              />
              <EvolutionRow 
                label="Massa Magra" 
                current={results.leanMass} 
                previous={previousAssessment.results.leanMass} 
                unit="kg" 
              />
              <EvolutionRow 
                label="Cintura" 
                current={assessment.waist} 
                previous={previousAssessment.waist} 
                unit="cm" 
                inverse={true}
              />
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight mb-4 text-center">Composição</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[10px] font-black uppercase">
             <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Massa Magra</div>
             <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-red-600"></div> Massa Gorda</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight mb-4 text-center">Peso Histórico</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="date" fontSize={10} stroke={isDark ? '#94a3b8' : '#64748b'} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} stroke={isDark ? '#94a3b8' : '#64748b'} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }} />
                <Bar dataKey="weight" fill="#f97316" radius={[4, 4, 0, 0]} name="Peso (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const EvolutionRow = ({ label, current, previous, unit, inverse = false }: { 
  label: string, 
  current: number, 
  previous: number, 
  unit: string,
  inverse?: boolean
}) => {
  const diff = current - previous;
  const isPositive = diff > 0;
  const isGood = inverse ? !isPositive : isPositive;
  const color = diff === 0 ? 'text-slate-400' : (isGood ? 'text-emerald-500' : 'text-red-500');
  const sign = isPositive ? '+' : '';

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
      <div className="space-y-0.5">
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{previous.toFixed(1)}{unit} → {current.toFixed(1)}{unit}</p>
      </div>
      <div className={`text-sm font-black ${color}`}>
        {diff === 0 ? 'Sem alteração' : `${sign}${diff.toFixed(1)}${unit}`}
      </div>
    </div>
  );
};

const SkinfoldBadge = ({ label, value }: { label: string, value: number }) => (
  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-orange-200 dark:hover:border-orange-900 transition-colors">
    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{value.toFixed(1)}<span className="text-[10px] ml-0.5">mm</span></p>
  </div>
);

const ResultCard = ({ label, value, subtext, color, diff, diffColor }: { 
  label: string, 
  value: string, 
  subtext: string, 
  color: string,
  diff?: string,
  diffColor?: string
}) => {
  const colors: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/50',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50',
    red: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };
  return (
    <div className={`p-5 rounded-2xl border ${colors[color]} shadow-sm transition-colors relative overflow-hidden`}>
      <div className="flex justify-between items-start">
        <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-70 mb-1">{label}</p>
        {diff && (
          <span className={`text-[10px] font-black ${diffColor} bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded`}>
            {diff}
          </span>
        )}
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="text-[10px] mt-1 font-bold uppercase tracking-wider opacity-80">{subtext}</p>
    </div>
  );
};

export default ResultsDisplay;
