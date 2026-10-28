import React from 'react';
import {
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  CheckSquare,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import type { MCQAttempt } from '@/types/mcq';

interface PracticeOverviewProps {
  moduleTitle: string;
  courseTitle: string;
  questionCount: number;
  attempts: MCQAttempt[];
  onStartPractice: () => void;
  onReviewAttempt?: (attempt: MCQAttempt) => void;
}

export const PracticeOverview: React.FC<PracticeOverviewProps> = ({
  moduleTitle,
  courseTitle,
  questionCount,
  attempts,
  onStartPractice,
  onReviewAttempt,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafbfd] p-4 sm:p-8">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-sm text-[#2563eb] font-semibold">
          <span>{moduleTitle.replace(/Topic \d+:\s*/i, '')}</span>
          <ChevronRight size={16} className="text-slate-400" />
          <span className="text-slate-700 font-bold">MCQ Practice</span>
        </div>

        {/* Instructions Card (Exact design matching reference screenshot 1) */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-base sm:text-lg font-bold text-[#1e293b] mb-4">
            Instructions:
          </h2>

          <ol className="space-y-3.5 text-sm text-[#475569] leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="font-bold text-[#1e293b] shrink-0">1.</span>
              <span>
                <strong className="text-[#1e293b]">Number of Questions:</strong> {questionCount}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-bold text-[#1e293b] shrink-0">2.</span>
              <span>
                <strong className="text-[#1e293b]">Types of Questions:</strong> MCQs, Code Output Prediction & Step Sequencing
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-bold text-[#1e293b] shrink-0">3.</span>
              <span>
                <strong className="text-[#1e293b]">Marking Scheme:</strong> All questions have equal weightage. Every correct response gets +1 mark. There is no negative marking.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-bold text-[#1e293b] shrink-0">4.</span>
              <span>
                You must answer all the MCQs correctly with conceptual clarity in order to mark your practice as completed.
              </span>
            </li>
          </ol>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => alert('Feedback modal: Feel free to share your thoughts!')}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#2563eb] hover:underline"
          >
            <span className="text-base font-bold">!</span>
            <span>Give Feedback</span>
          </button>

          {/* Prominent Orange Action Button (matching screenshot 1) */}
          <button
            onClick={onStartPractice}
            className="px-6 py-3 bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 text-white font-bold text-sm sm:text-base rounded-xl transition shadow-md shadow-orange-500/20 flex items-center gap-2"
          >
            <span>{attempts.length > 0 ? 'RETAKE PRACTICE' : 'START PRACTICE'}</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Practice Attempts Section (matching screenshot 1) */}
        <div className="pt-8">
          <h3 className="text-center text-sm font-bold uppercase tracking-wider text-[#1e40af] mb-4">
            Practice Attempts
          </h3>

          {attempts.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500 max-w-md mx-auto">
              <CheckSquare size={36} className="text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No attempts yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Click "START PRACTICE" above to test your concepts and reinforce what you learned!
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-3">
              {attempts.map((att, idx) => (
                <div
                  key={att.id || idx}
                  className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-xs transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1e293b]">
                      ATTEMPT {attempts.length - idx}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      <span>{Math.floor(att.durationSeconds / 60)}MINS {att.durationSeconds % 60}SECS</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-around py-4 text-xs sm:text-sm font-semibold">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span>{att.correctAnswers} Correct Answers</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-500">
                      <XCircle size={16} />
                      <span>{att.wrongAnswers} Wrong Answers</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-100 text-slate-500">
                    <span>{new Date(att.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="font-bold text-blue-600">{att.scorePercentage}% Score</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
