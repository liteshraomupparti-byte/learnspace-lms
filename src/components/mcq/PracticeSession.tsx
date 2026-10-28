import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Info,
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Check,
  Send,
  Brain,
  BookOpen,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from 'lucide-react';
import type { MCQQuestion, MCQAttempt, QuestionOption } from '@/types/mcq';
import { aiExplanationService } from '@/services/aiExplanationService';

interface PracticeSessionProps {
  questions: MCQQuestion[];
  topicTitle: string;
  courseId: string;
  moduleId: string;
  uid: string;
  onEndPractice: () => void;
  onCompletePractice: (attempt: MCQAttempt) => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  questions,
  topicTitle,
  courseId,
  moduleId,
  uid,
  onEndPractice,
  onCompletePractice,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [orderedOptionsMap, setOrderedOptionsMap] = useState<Record<string, QuestionOption[]>>({});
  const [startTime] = useState<number>(Date.now());
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // AI Concept Clarifier state
  const [aiExplanationMap, setAiExplanationMap] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [customDoubt, setCustomDoubt] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<Record<string, Array<{ role: 'user' | 'ai'; text: string }>>>({});

  const currentQ = questions[currentIndex];
  const isCurrentSubmitted = Boolean(submittedQuestions[currentQ.id]);

  // Initialize ordering questions with their options
  useEffect(() => {
    const map: Record<string, QuestionOption[]> = {};
    questions.forEach((q) => {
      if (q.type === 'order_code') {
        map[q.id] = [...q.options];
      }
    });
    setOrderedOptionsMap(map);
  }, [questions]);

  // Handle single choice selection
  const handleSelectOption = (optionId: string) => {
    if (isCurrentSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  // Handle moving items in Drag & Drop / Reordering questions
  const handleMoveOrderItem = (fromIndex: number, toIndex: number) => {
    if (isCurrentSubmitted) return;
    const currentList = orderedOptionsMap[currentQ.id] || [...currentQ.options];
    if (toIndex < 0 || toIndex >= currentList.length) return;

    const updated = [...currentList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    setOrderedOptionsMap((prev) => ({
      ...prev,
      [currentQ.id]: updated,
    }));

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: updated.map((item) => item.id),
    }));
  };

  // Submit Answer for the current question
  const handleSubmitAnswer = () => {
    if (currentQ.type === 'order_code' && !selectedAnswers[currentQ.id]) {
      // Use current order
      const currentList = orderedOptionsMap[currentQ.id] || currentQ.options;
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQ.id]: currentList.map((i) => i.id),
      }));
    }

    setSubmittedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: true,
    }));
  };

  // Check if student answer is correct
  const isAnswerCorrect = (q: MCQQuestion) => {
    const userAns = selectedAnswers[q.id];
    if (!userAns) return false;

    if (Array.isArray(q.correctAnswer)) {
      if (!Array.isArray(userAns)) return false;
      return (
        userAns.length === q.correctAnswer.length &&
        userAns.every((val, idx) => val === q.correctAnswer[idx])
      );
    }
    return userAns === q.correctAnswer;
  };

  // Fetch or trigger interactive AI Explanation
  const handleAskAiExplanation = async (customQuestion?: string) => {
    setAiLoading(true);
    const isCorrect = isAnswerCorrect(currentQ);
    const userAns = selectedAnswers[currentQ.id];

    try {
      const explanation = await aiExplanationService.generateConceptExplanation({
        question: currentQ,
        userAnswer: userAns,
        isCorrect,
        customPrompt: customQuestion,
      });

      setAiExplanationMap((prev) => ({
        ...prev,
        [currentQ.id]: explanation,
      }));

      if (customQuestion) {
        setAiChatHistory((prev) => ({
          ...prev,
          [currentQ.id]: [
            ...(prev[currentQ.id] || []),
            { role: 'user', text: customQuestion },
            { role: 'ai', text: explanation },
          ],
        }));
        setCustomDoubt('');
      }
    } catch (err) {
      console.error('Failed to get AI explanation:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Complete Practice and calculate metrics
  const handleFinishPractice = () => {
    const durationSeconds = Math.max(Math.round((Date.now() - startTime) / 1000), 10);
    let correctCount = 0;

    questions.forEach((q) => {
      if (isAnswerCorrect(q)) correctCount++;
    });

    const wrongCount = questions.length - correctCount;
    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    const attempt: MCQAttempt = {
      id: `mcq_${Date.now()}`,
      topicId: moduleId,
      topicTitle,
      courseId,
      moduleId,
      uid,
      date: new Date().toISOString(),
      durationSeconds,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      scorePercentage,
      userAnswers: selectedAnswers,
      passed: scorePercentage >= 70,
    };

    setIsFinished(true);
    onCompletePractice(attempt);
  };

  const attemptedCount = Object.keys(submittedQuestions).length;
  const progressPercent = Math.round((attemptedCount / questions.length) * 100);

  // If Practice is completed, show summary card
  if (isFinished) {
    let correctCount = 0;
    questions.forEach((q) => {
      if (isAnswerCorrect(q)) correctCount++;
    });
    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafbfd] p-6 sm:p-10">
        <div className="max-w-3xl w-full mx-auto bg-white border border-[#e2e8f0] rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <Sparkles size={32} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-800">Practice Completed! 🎉</h2>
            <p className="text-sm text-slate-500 mt-1">{topicTitle}</p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-md mx-auto">
            <div>
              <span className="text-xs font-semibold text-slate-400">Score</span>
              <p className="text-xl font-black text-blue-600">{scorePercentage}%</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Correct</span>
              <p className="text-xl font-black text-emerald-600">{correctCount}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Wrong</span>
              <p className="text-xl font-black text-rose-500">{questions.length - correctCount}</p>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setIsFinished(false);
                setCurrentIndex(0);
                setSubmittedQuestions({});
                setSelectedAnswers({});
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 text-sm flex items-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Retake Practice</span>
            </button>
            <button
              onClick={onEndPractice}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20"
            >
              Back to Topic
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafbfd]">
      {/* Top Header Row (Matching reference screenshot 2) */}
      <header className="h-14 bg-white border-b border-[#e2e8f0] px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-10">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEndConfirm(true)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition flex items-center gap-2 font-bold text-xs sm:text-sm"
          >
            <ArrowLeft size={18} />
            <span className="uppercase tracking-wider font-extrabold text-slate-800">
              MCQ PRACTICE
            </span>
          </button>
        </div>

        {/* Center: Questions Attempted Counter */}
        <div className="text-xs sm:text-sm font-bold text-slate-700">
          QUESTIONS ATTEMPTED: {attemptedCount}/{questions.length}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInstructionsModal(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#2563eb] hover:underline"
          >
            <Info size={14} />
            <span>PRACTICE INSTRUCTIONS</span>
          </button>

          <button
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50"
          >
            <X size={15} />
            <span>END PRACTICE</span>
          </button>
        </div>

        {/* Blue Progress Bar along bottom of header */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className="h-full bg-[#2563eb] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Question Body Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          {/* Question Text & Code Snippet Box */}
          <div className="space-y-4">
            <h1 className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
              {currentQ.question}
            </h1>

            {/* Code Snippet Box with Dark Theme & Language Badge (Matching screenshot 2) */}
            {currentQ.codeSnippet && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Code:
                </span>
                <div className="relative rounded-xl overflow-hidden bg-[#0e1626] border border-[#1e293b] p-4 text-xs sm:text-sm font-mono shadow-md">
                  <div className="absolute top-2.5 right-3 px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider">
                    {currentQ.codeSnippet.language}
                  </div>
                  <pre className="text-slate-100 leading-relaxed overflow-x-auto pt-2">
                    <code>{currentQ.codeSnippet.code}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Options Display */}
          <div className="pt-2">
            {/* Case A: Drag & Drop / Reordering Question (Matching Screenshot 2) */}
            {currentQ.type === 'order_code' ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-500">Drag and Drop to Order:</span>
                <div className="space-y-2.5">
                  {(orderedOptionsMap[currentQ.id] || currentQ.options).map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition ${
                        isCurrentSubmitted
                          ? 'bg-slate-50 border-slate-200 opacity-90'
                          : 'bg-white border-[#d2dce9] hover:border-blue-400 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                        <GripVertical size={16} className="text-slate-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-slate-800 break-words">
                          {opt.text}
                        </span>
                      </div>

                      {/* Up/Down ordering controls */}
                      {!isCurrentSubmitted && (
                        <div className="flex items-center gap-1 pl-2 shrink-0">
                          <button
                            onClick={() => handleMoveOrderItem(idx, idx - 1)}
                            disabled={idx === 0}
                            title="Move Up"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-20"
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            onClick={() => handleMoveOrderItem(idx, idx + 1)}
                            disabled={idx === (orderedOptionsMap[currentQ.id] || currentQ.options).length - 1}
                            title="Move Down"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-20"
                          >
                            <ArrowDown size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Case B: Single Choice / Multiple Choice Options */
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.id;
                  const isCorrect = currentQ.correctAnswer === opt.id;

                  let borderClass = 'border-[#d2dce9] hover:border-blue-400 bg-white';
                  if (isSelected) {
                    borderClass = 'border-blue-600 bg-blue-50/50 shadow-xs';
                  }
                  if (isCurrentSubmitted) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-500 bg-emerald-50/60 text-emerald-900';
                    } else if (isSelected) {
                      borderClass = 'border-rose-400 bg-rose-50/60 text-rose-900';
                    } else {
                      borderClass = 'border-slate-200 opacity-60 bg-white';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={isCurrentSubmitted}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition flex items-center justify-between gap-3 ${borderClass}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-slate-800">
                          {opt.text}
                        </span>
                      </div>

                      {isCurrentSubmitted && isCorrect && (
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      )}
                      {isCurrentSubmitted && isSelected && !isCorrect && (
                        <XCircle size={18} className="text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Row: SUBMIT Button (Matching screenshot 2) */}
          {!isCurrentSubmitted ? (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSubmitAnswer}
                disabled={
                  currentQ.type !== 'order_code' && !selectedAnswers[currentQ.id]
                }
                className="px-8 py-2.5 bg-[#2563eb] hover:bg-[#1d4fd8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95"
              >
                SUBMIT
              </button>
            </div>
          ) : (
            /* Concept Clarity & Explanation Drawer */
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Correctness Banner */}
              <div
                className={`p-4 rounded-2xl flex items-center justify-between ${
                  isAnswerCorrect(currentQ)
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isAnswerCorrect(currentQ) ? (
                    <CheckCircle2 size={22} className="text-emerald-600" />
                  ) : (
                    <XCircle size={22} className="text-rose-600" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold">
                      {isAnswerCorrect(currentQ)
                        ? 'Correct! Concept Understood! 🎯'
                        : 'Incorrect. Let’s Master This Concept 💡'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Review the step-by-step logic and execution trace below.
                    </p>
                  </div>
                </div>

                {/* AI Concept Clarifier Trigger */}
                <button
                  onClick={() => handleAskAiExplanation()}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition shrink-0"
                >
                  <Sparkles size={14} />
                  <span>{aiLoading ? 'Explaining...' : 'Explain with AI'}</span>
                </button>
              </div>

              {/* In-depth Conceptual Breakdown Card */}
              <div className="bg-white border border-[#d2dce9] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Brain className="text-blue-600" size={18} />
                  <h4 className="text-sm font-bold text-slate-800">
                    Concept Explanation: {currentQ.explanation.concept}
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {currentQ.explanation.summary}
                </p>

                {/* Step by step logic */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Logical Execution Steps:</span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {currentQ.explanation.stepByStep.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Code Trace */}
                {currentQ.explanation.codeTrace && currentQ.explanation.codeTrace.length > 0 && (
                  <div className="space-y-1.5 bg-slate-900 text-slate-200 p-3.5 rounded-xl text-xs font-mono">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                      Execution State Trace:
                    </span>
                    {currentQ.explanation.codeTrace.map((tr, idx) => (
                      <div key={idx} className="flex items-center justify-between py-0.5">
                        <span className="text-slate-300">{tr.description}</span>
                        {tr.variables && (
                          <span className="text-emerald-400 font-bold ml-2">[{tr.variables}]</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Takeaway */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 font-medium">
                  <strong>💡 Pro-Tip:</strong> {currentQ.explanation.keyTakeaway}
                </div>

                {/* Interactive AI Clarifier Output if loaded */}
                {aiExplanationMap[currentQ.id] && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                      <Sparkles size={14} />
                      <span>AI Concept Tutor Walkthrough:</span>
                    </div>
                    <div className="text-xs text-indigo-950 leading-relaxed whitespace-pre-wrap">
                      {aiExplanationMap[currentQ.id]}
                    </div>
                  </div>
                )}

                {/* Ask AI Doubt Input Box */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Have a doubt? Ask AI: e.g. Why is this not option B?"
                    value={customDoubt}
                    onChange={(e) => setCustomDoubt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && customDoubt.trim() && handleAskAiExplanation(customDoubt.trim())}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => customDoubt.trim() && handleAskAiExplanation(customDoubt.trim())}
                    disabled={aiLoading || !customDoubt.trim()}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Send size={12} />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>

              {/* Next Navigation Row */}
              <div className="flex justify-between items-center pt-3">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-30 flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-6 py-2.5 bg-[#2563eb] hover:bg-[#1d4fd8] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <span>NEXT QUESTION</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleFinishPractice}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <span>COMPLETE PRACTICE</span>
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Practice Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Practice Instructions</h3>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <li>• Total Questions: {questions.length}</li>
              <li>• Equal weightage: +1 for every correct answer, no negative marking.</li>
              <li>• For code ordering questions, use the up/down controls to place steps in chronological execution order.</li>
              <li>• Detailed concept explanations and AI walkthroughs unlock after each submission.</li>
            </ul>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Practice Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <X size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">End Practice Session?</h3>
              <p className="text-xs text-slate-500 mt-1">
                You have completed {attemptedCount} of {questions.length} questions. Ending now will record your current progress.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Resume Practice
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  onEndPractice();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                End & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
