export type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'order_code'
  | 'predict_output';

export interface CodeSnippet {
  language: 'python' | 'javascript' | 'html' | 'css' | 'c' | 'cpp' | 'java';
  code: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  code?: string;
}

export interface QuestionExplanation {
  concept: string;
  summary: string;
  stepByStep: string[];
  keyTakeaway: string;
  codeTrace?: Array<{
    step: number;
    description: string;
    variables?: string;
  }>;
  commonMistake?: string;
}

export interface MCQQuestion {
  id: string;
  topicId: string;
  title?: string;
  question: string;
  type: QuestionType;
  codeSnippet?: CodeSnippet;
  options: QuestionOption[];
  correctAnswer: string | string[]; // string option ID, or array of option IDs for ordering/multi-choice
  explanation: QuestionExplanation;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  conceptTag: string;
}

export interface MCQAttempt {
  id: string;
  topicId: string;
  topicTitle: string;
  courseId: string;
  moduleId: string;
  uid: string;
  date: string;
  durationSeconds: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercentage: number;
  userAnswers: Record<string, string | string[]>;
  passed: boolean;
}

export interface TopicPracticeMeta {
  topicId: string;
  topicTitle: string;
  courseId: string;
  moduleId: string;
  questionCount: number;
  estimatedMinutes: number;
  instructions: string[];
}
