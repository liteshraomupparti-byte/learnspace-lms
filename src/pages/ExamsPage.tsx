import React from 'react';
import { Award, BookCheck, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExamsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1450px] mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#101827]">
        Exams & Assessment Practice
      </h1>

      <div className="bg-white border border-[#d2dce9] rounded-[21px] p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#20b36b] flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-[#101827] mb-2">
            Assessment Practice Area
          </h2>
          <p className="text-sm text-[#65748b] leading-relaxed mb-6">
            Practice drills, quizzes, and assessment benchmarks will be loaded here. You can strengthen your programming foundations by completing the practice exercises and walkthroughs inside each course module.
          </p>

          <div className="p-4 rounded-xl bg-[#f8faff] border border-[#d2dce9] space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <BookCheck className="w-5 h-5 text-[#2463eb] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-semibold text-[#101827]">
                  Python Coding Practice & Walkthroughs
                </strong>
                <p className="text-xs text-[#65748b]">
                  Included directly inside each module in your Computer Programming curriculum.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/curriculum')}
            className="px-5 py-2.5 bg-[#2463eb] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4fd8] transition-colors"
          >
            Browse Practice Modules in Curriculum
          </button>
        </div>
      </div>
    </div>
  );
};
