/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Target, 
  Shield, 
  Zap, 
  History, 
  Sparkles, 
  Loader2, 
  Send,
  Dices,
  ChevronRight,
  Medal,
  AlertCircle,
  Shuffle,
  X,
  CheckCircle2,
  RotateCcw,
  Calendar,
  Star,
  PlusCircle,
  ListTodo,
  Trash2,
  ShieldCheck,
  Users
} from 'lucide-react';
import Markdown from 'react-markdown';
import { generateRoadmapStream, generateRandomChallenge, resetChat } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState('Médio');
  const [randomChallenge, setRandomChallenge] = useState<string | null>(null);
  const [randomLoading, setRandomLoading] = useState(false);
  const [history, setHistory] = useState<{name: string, date: string}[]>([]);
  const [seasonInput, setSeasonInput] = useState('');
  const [pendingChallenges, setPendingChallenges] = useState<string[]>([]);

  const handleArchiveHistory = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddToPending = () => {
    // Try to extract project name from roadmap
    let defaultName = "";
    if (roadmap) {
      const match = roadmap.match(/# 1\. NOME DO PROJETO\n(.*?)\n/);
      if (match && match[1]) defaultName = match[1].trim();
    }
    
    const name = prompt("Qual o nome do desafio para adicionar à lista?", defaultName);
    if (name && !pendingChallenges.includes(name)) {
      setPendingChallenges(prev => [...prev, name]);
    }
  };

  const handleRemovePending = (index: number) => {
    setPendingChallenges(prev => prev.filter((_, i) => i !== index));
  };

  const handleCompleteFromPending = (name: string, index: number) => {
    handleGenerate(`Completar ${name}`);
    handleRemovePending(index);
  };

  const handleGenerate = async (customPrompt?: string) => {
    const promptToUse = customPrompt || input || "Crie um roteiro de carreira aleatório, criativo e desafiador.";
    
    // Check if it's a completion command
    const isCompletion = promptToUse.toLowerCase().startsWith('completar');
    const isSeasonSummary = promptToUse.toLowerCase().startsWith('resumo da temporada');
    
    if (isCompletion) {
      const challengeName = promptToUse.replace(/completar/i, '').trim();
      if (challengeName) {
        setHistory(prev => [{ name: challengeName, date: new Date().toLocaleDateString() }, ...prev]);
      }
    } else if (isSeasonSummary) {
      setHistory(prev => [{ name: "Temporada Finalizada", date: new Date().toLocaleDateString() }, ...prev]);
    }

    setLoading(true);
    setError(null);
    if (!isCompletion && !customPrompt) setRoadmap(""); 
    
    try {
      await generateRoadmapStream(promptToUse, difficulty, (text) => {
        setRoadmap(text);
      });
      if (!customPrompt) setInput("");
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao conectar com o especialista. Verifique sua conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    resetChat();
    setRoadmap(null);
    setHistory([]);
    setPendingChallenges([]);
    setInput("");
    setSeasonInput("");
    setError(null);
  };

  const handleSeasonSubmit = () => {
    if (!seasonInput.trim()) return;
    handleGenerate(`Resumo da Temporada: ${seasonInput}`);
    setSeasonInput("");
  };

  const handleQuickComplete = () => {
    const name = prompt("Qual o nome do desafio completado?");
    if (name) {
      handleGenerate(`Completar ${name}`);
    }
  };

  const getAchievementIcon = (name: string, className: string = "w-4 h-4") => {
    const lower = name.toLowerCase();
    if (lower.includes('temporada') || lower.includes('época')) return <History className={`${className} text-emerald-500`} />;
    if (lower.includes('medalha')) return <Medal className={`${className} text-amber-500`} />;
    if (lower.includes('objetivo') || lower.includes('meta')) return <Target className={`${className} text-blue-500`} />;
    if (lower.includes('desafio')) return <Zap className={`${className} text-purple-500`} />;
    return <Trophy className={`${className} text-emerald-500`} />;
  };

  const handleRandomChallenge = async () => {
    setRandomLoading(true);
    try {
      const result = await generateRandomChallenge();
      setRandomChallenge(result || "Nenhum desafio gerado.");
    } catch (err) {
      console.error(err);
      setError("Erro ao gerar desafio aleatório.");
    } finally {
      setRandomLoading(false);
    }
  };

  const quickActions = [
    { 
      id: 'fast', 
      label: 'Carreira Rápida', 
      icon: <Zap className="w-4 h-4" />, 
      prompt: "Crie um roteiro de carreira rápida (Sprint) para ganhar um título importante em no máximo 3 temporadas." 
    },
    { 
      id: 'rebuild', 
      label: 'Reconstrução Difícil', 
      icon: <History className="w-4 h-4" />, 
      prompt: "Crie um roteiro de reconstrução de um 'Gigante Adormecido' que está na última divisão nacional." 
    },
    { 
      id: 'legend', 
      label: 'Jornada de Lenda', 
      icon: <Trophy className="w-4 h-4" />, 
      prompt: "Crie uma jornada de lenda: começar desempregado ou no menor time do jogo e chegar ao topo do mundo." 
    },
    { 
      id: 'season', 
      label: 'Resumo da Época', 
      icon: <History className="w-4 h-4" />, 
      prompt: "Resumo da Temporada: [Digite aqui como foi sua temporada: títulos, gols, destaques...]" 
    },
    { 
      id: 'complete', 
      label: 'Completar Desafio', 
      icon: <CheckCircle2 className="w-4 h-4" />, 
      prompt: "Completar [Nome do Desafio]" 
    },
    { 
      id: 'gigante', 
      label: 'Gigante Adormecido', 
      icon: <Medal className="w-4 h-4" />, 
      prompt: "Crie um roteiro focado na medalha 'Gigante Adormecido': assumir um time na zona de rebaixamento e conseguir o acesso na mesma temporada." 
    },
    { 
      id: 'fortaleza', 
      label: 'Fortaleza de Ferro', 
      icon: <ShieldCheck className="w-4 h-4" />, 
      prompt: "Crie um roteiro focado na medalha 'A Fortaleza de Ferro': terminar a liga invicto (0 derrotas) e sem receber nenhum cartão vermelho na temporada." 
    },
    { 
      id: 'base', 
      label: 'Campeão da Base', 
      icon: <Users className="w-4 h-4" />, 
      prompt: "Crie um roteiro focado na medalha 'Campeão da Base': vencer um título importante (Liga ou Champions League) usando um elenco onde mais de 70% dos jogadores foram formados no próprio clube." 
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Trophy className="text-zinc-950 w-5 h-5" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight">
              DV <span className="text-emerald-500 italic">Gerador de Carreiras</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1.5 uppercase tracking-widest"
              title="Resetar Carreira"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Resetar</span>
            </button>
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">
              <span>v1.1.0</span>
              <span className="w-1 h-1 bg-zinc-700 rounded-full" />
              <span>Career Specialist AI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="mb-12 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
              Sua próxima <span className="text-emerald-500 italic">glória</span> começa aqui.
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl">
              Defina seu desafio, escolha seu clube e deixe nossa IA criar o roteiro perfeito para sua carreira no World Soccer Champs.
            </p>
          </motion.div>
        </section>

        {/* Input Area */}
        <section className="mb-12">
          <div className="roadmap-card border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.1)]">
            <div className="flex flex-col gap-6">
              {/* Difficulty Filter */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Nível de Dificuldade
                </span>
                <div className="flex gap-2">
                  {['Fácil', 'Médio', 'Difícil'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={cn(
                        "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all border",
                        difficulty === level 
                          ? level === 'Fácil' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : level === 'Médio' ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "bg-red-500/20 border-red-500 text-red-400"
                          : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={handleRandomChallenge}
                  disabled={randomLoading || loading}
                  title="Gerar Desafios Aleatórios"
                  className="bg-zinc-800 hover:bg-zinc-700 text-emerald-500 p-3 rounded-xl transition-all border border-zinc-700 active:scale-95 disabled:opacity-50"
                >
                  {randomLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shuffle className="w-6 h-6" />}
                </button>
                <button
                  onClick={() => handleGenerate()}
                  disabled={loading || randomLoading}
                  className="flex-1 max-w-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-zinc-950 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-lg"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  <span>Gerar Roteiro</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-1 mr-2">
                  <Dices className="w-3 h-3" /> Sugestões:
                </span>
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      if (action.id === 'season') {
                        const relato = prompt("Conte como foi sua temporada (títulos, gols, moral do time, reação da torcida...):");
                        if (relato) handleGenerate(`Resumo da Temporada: ${relato}`);
                      } else if (action.id === 'complete') {
                        const nome = prompt("Qual o nome do desafio que você concluiu?");
                        if (nome) handleGenerate(`Completar ${nome}`);
                      } else {
                        handleGenerate(action.prompt);
                      }
                    }}
                    disabled={loading}
                    className="text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors border border-zinc-700/50"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Area */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {loading && !roadmap && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
                </div>
                <p className="text-zinc-500 font-mono text-sm animate-pulse">Escalando o time de especialistas...</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              {roadmap && (
                <motion.div
                  key={roadmap}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="roadmap-card border-zinc-800 relative overflow-hidden group"
                >
                  {/* Decorative background elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -ml-32 -mb-32 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <Sparkles className="text-emerald-500 w-5 h-5" />
                        </div>
                        <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Roteiro Ativo</span>
                      </div>
                      <button 
                        onClick={() => window.print()}
                        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Imprimir / Salvar PDF
                      </button>
                    </div>

                    <div className="markdown-body">
                      <Markdown>{roadmap}</Markdown>
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap justify-center gap-4">
                      <button
                        onClick={handleQuickComplete}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 group"
                      >
                        <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Completar Desafio
                      </button>
                      <button
                        onClick={handleAddToPending}
                        className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold transition-all flex items-center gap-2 border border-zinc-700 group"
                      >
                        <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Adicionar à caixa de desafios a completar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!roadmap && !loading && (
              <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
                <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="text-zinc-700 w-8 h-8" />
                </div>
                <h3 className="text-zinc-500 font-display font-medium text-lg">Nenhum roteiro ativo</h3>
                <p className="text-zinc-600 text-sm max-w-xs mx-auto mt-2">
                  Use o campo acima ou as sugestões rápidas para começar sua jornada.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar: History & Season Summary */}
          <div className="space-y-6">
            {/* Pending Challenges Section */}
            <div className="roadmap-card border-zinc-800/50 bg-blue-500/[0.02]">
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                <ListTodo className="text-blue-500 w-4 h-4" />
                <h3 className="font-display font-bold text-base">Desafios a Completar</h3>
              </div>
              
              <div className="space-y-3">
                {pendingChallenges.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-600 text-xs italic">Nenhum desafio na lista.</p>
                  </div>
                ) : (
                  pendingChallenges.map((challenge, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between group hover:border-blue-500/30 transition-all"
                    >
                      <span className="text-zinc-300 text-sm font-medium truncate flex-1 mr-2">{challenge}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCompleteFromPending(challenge, idx)}
                          className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-all"
                          title="Marcar como Concluído"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemovePending(idx)}
                          className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                          title="Remover da Lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
                
                <button
                  onClick={handleAddToPending}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-blue-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-3 h-3" />
                  Novo Desafio na Lista
                </button>
              </div>
            </div>

            {/* Season Summary Input */}
            <div className="roadmap-card border-zinc-800/50 bg-emerald-500/[0.02]">
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                <History className="text-emerald-500 w-4 h-4" />
                <h3 className="font-display font-bold text-base">Relato da Época</h3>
              </div>
              <div className="space-y-3">
                <textarea
                  value={seasonInput}
                  onChange={(e) => setSeasonInput(e.target.value)}
                  placeholder="Como foi sua temporada? Títulos, gols, dramas..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-zinc-200 placeholder:text-zinc-700 resize-none min-h-[100px]"
                />
                <button
                  onClick={handleSeasonSubmit}
                  disabled={loading || !seasonInput.trim()}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Enviar Resumo
                </button>
              </div>
            </div>

            {/* History List */}
            <div className="roadmap-card border-zinc-800/50">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500 w-4 h-4" />
                  <h3 className="font-display font-bold text-base">Histórico</h3>
                </div>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={handleQuickComplete}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-400 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-bold group"
                >
                  <Zap className="w-3 h-3 group-hover:animate-pulse" />
                  Completar Novo Desafio
                </button>
              </div>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-zinc-600 text-xs italic">Nenhuma conquista registrada ainda.</p>
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-2.5 bg-zinc-950/50 border border-zinc-800/50 rounded-xl flex items-center gap-3 group hover:border-emerald-500/30 transition-all"
                    >
                      <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors shrink-0">
                        {getAchievementIcon(item.name, "w-3.5 h-3.5")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-zinc-200 font-bold text-xs leading-tight group-hover:text-emerald-400 transition-colors truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {item.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <button
                          onClick={() => handleGenerate(`Completar ${item.name}`)}
                          className="p-1 hover:bg-emerald-500/10 text-emerald-500 rounded-md transition-all"
                          title="Completar Novamente / Atualizar"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleArchiveHistory(idx)}
                          className="p-1 hover:bg-red-500/10 hover:text-red-400 text-zinc-600 rounded-md transition-all"
                          title="Arquivar Conquista"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Random Challenge Modal */}
      <AnimatePresence>
        {randomChallenge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-emerald-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-emerald-500/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Shuffle className="text-emerald-500 w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg">Desafios Imprevisíveis</h3>
                </div>
                <button 
                  onClick={() => setRandomChallenge(null)}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto markdown-body">
                <Markdown>{randomChallenge}</Markdown>
              </div>
              <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setRandomChallenge(null)}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-bold transition-all"
                >
                  Entendido!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-zinc-900 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-display font-bold">SoccerRoadmap</span>
          </div>
          <div className="flex gap-8 text-xs font-mono text-zinc-600 uppercase tracking-widest">
            <a href="#" className="hover:text-emerald-500 transition-colors">Sobre</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Comunidade</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">API</a>
          </div>
          <p className="text-xs text-zinc-700">© 2026 SoccerRoadmap AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
