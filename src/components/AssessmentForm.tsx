
import React, { useState, useRef } from 'react';
import { AssessmentData, Sex, Skinfolds, AssessmentEntry } from '../types';

interface Props {
  onCalculate: (data: AssessmentData) => void;
  history: AssessmentEntry[];
  prefillName?: string | null;
  onClearPrefill?: () => void;
}

const AssessmentForm: React.FC<Props> = ({ onCalculate, history, prefillName, onClearPrefill }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [showSkinfolds, setShowSkinfolds] = useState(false);
  
  // Get unique names from history
  const uniqueNames = Array.from(new Set(history.map(h => h.name)));

  const [formData, setFormData] = useState<Omit<AssessmentData, 'id' | 'date' | 'photo' | 'skinfolds'>>({
    name: '',
    age: 25,
    sex: 'masculino',
    weight: 70,
    height: 175,
    waist: 80,
    hip: 95,
    neck: 38,
  });

  React.useEffect(() => {
    if (prefillName) {
      handleSelectPerson(prefillName);
    }
  }, [prefillName]);

  const handleSelectPerson = (name: string) => {
    const personHistory = history.filter(h => h.name === name);
    if (personHistory.length > 0) {
      const last = personHistory[personHistory.length - 1];
      setFormData(prev => ({
        ...prev,
        name: last.name,
        age: last.age,
        sex: last.sex,
        height: last.height,
        // Optional: pre-fill other fields like waist/hip if they don't change much
        waist: last.waist,
        hip: last.hip,
        neck: last.neck,
      }));
    }
  };

  const [skinfolds, setSkinfolds] = useState<Skinfolds>({
    pectoral: 0,
    midaxillary: 0,
    triceps: 0,
    subscapular: 0,
    abdominal: 0,
    suprailiac: 0,
    thigh: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'sex' ? value : Number(value)
    }));
  };

  const handleSkinfoldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSkinfolds(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    onCalculate({
      ...formData,
      photo,
      skinfolds: showSkinfolds ? skinfolds : undefined,
      id,
      date: new Date().toISOString(),
    });
    setPhoto(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6 transition-colors duration-300">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-3 uppercase tracking-tight">Nova Avaliação</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Nome Completo</label>
          <input 
            required 
            name="name" 
            list="names-list"
            value={formData.name} 
            onChange={(e) => {
              handleChange(e);
              if (uniqueNames.includes(e.target.value)) {
                handleSelectPerson(e.target.value);
              }
            }} 
            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition" 
            placeholder="Ex: João Silva" 
          />
          <datalist id="names-list">
            {uniqueNames.map(name => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Idade</label>
          <input type="number" inputMode="numeric" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Sexo</label>
          <select name="sex" value={formData.sex} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition">
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Peso (kg)</label>
          <input type="number" step="0.1" inputMode="decimal" name="weight" value={formData.weight} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Altura (cm)</label>
          <input type="number" inputMode="numeric" name="height" value={formData.height} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition" />
        </div>
      </div>

      <div className="pt-2 border-t dark:border-slate-800">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" 
            checked={showSkinfolds}
            onChange={(e) => setShowSkinfolds(e.target.checked)}
          />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-orange-600 transition uppercase tracking-tight">Incluir Dobras (Pollock 7)</span>
        </label>
      </div>

      {showSkinfolds && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <SkinfoldInput label="Peitoral" name="pectoral" value={skinfolds.pectoral} onChange={handleSkinfoldChange} />
          <SkinfoldInput label="Axilar M." name="midaxillary" value={skinfolds.midaxillary} onChange={handleSkinfoldChange} />
          <SkinfoldInput label="Tríceps" name="triceps" value={skinfolds.triceps} onChange={handleSkinfoldChange} />
          <SkinfoldInput label="Subescap." name="subscapular" value={skinfolds.subscapular} onChange={handleSkinfoldChange} />
          <SkinfoldInput label="Abdominal" name="abdominal" value={skinfolds.abdominal} onChange={handleSkinfoldChange} />
          <SkinfoldInput label="Suprail." name="suprailiac" value={skinfolds.suprailiac} onChange={handleSkinfoldChange} />
          <SkinfoldInput label="Coxa" name="thigh" value={skinfolds.thigh} onChange={handleSkinfoldChange} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Cintura</label>
          <input type="number" step="0.1" inputMode="decimal" name="waist" value={formData.waist} onChange={handleChange} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-orange-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Quadril</label>
          <input type="number" step="0.1" inputMode="decimal" name="hip" value={formData.hip} onChange={handleChange} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-orange-500" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Pescoço</label>
          <input type="number" step="0.1" inputMode="decimal" name="neck" value={formData.neck} onChange={handleChange} className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-orange-500" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">Foto para Evolução</label>
        <div onClick={() => fileInputRef.current?.click()} className="relative group cursor-pointer border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-orange-400 rounded-xl overflow-hidden transition-all bg-slate-50 dark:bg-slate-800/50 h-32 flex flex-col items-center justify-center">
          {photo ? <img src={photo} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center p-2"><p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Selecionar Foto</p></div>}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>

      <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 uppercase tracking-widest">
        Salvar e Gerar Relatório
      </button>
    </form>
  );
};

const SkinfoldInput = ({ label, name, value, onChange }: { label: string, name: string, value: number, onChange: any }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">{label} (mm)</label>
    <input type="number" step="0.1" inputMode="decimal" name={name} value={value} onChange={onChange} className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 text-sm transition-colors" />
  </div>
);

export default AssessmentForm;
