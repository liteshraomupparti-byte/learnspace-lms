import type { MCQQuestion } from '@/types/mcq';

interface ExplainParams {
  question: MCQQuestion;
  userAnswer: string | string[];
  isCorrect: boolean;
  customPrompt?: string;
}

export const aiExplanationService = {
  // Check if Gemini API key is configured
  isAiConfigured(): boolean {
    return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
  },

  // Generate interactive AI explanation for a question
  async generateConceptExplanation(params: ExplainParams): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // If student configured a Gemini API key in .env, call the Google Gemini API
    if (apiKey) {
      try {
        const promptText = `
You are an expert, encouraging coding teacher in the LearnSpace student learning portal.
The student is practicing an MCQ on the topic: "${params.question.conceptTag}".

Question:
"${params.question.question}"

${params.question.codeSnippet ? `Code snippet:\n\`\`\`${params.question.codeSnippet.language}\n${params.question.codeSnippet.code}\n\`\`\`` : ''}

Available Options:
${params.question.options.map((o) => `- [${o.id}] ${o.text}`).join('\n')}

Student Answer: ${JSON.stringify(params.userAnswer)}
Correct Answer: ${JSON.stringify(params.question.correctAnswer)}
Result: ${params.isCorrect ? 'CORRECT' : 'INCORRECT'}

${params.customPrompt ? `Student's specific doubt / question: "${params.customPrompt}"` : ''}

Task:
Provide a clear, engaging, easy-to-understand conceptual breakdown to make the concept 100% crystal clear for the student:
1. Explain WHY the correct answer is right using a simple real-world analogy.
2. If the student got it wrong or asked a question, address why their misconception happens and how to avoid it.
3. If there is code, trace through the execution step-by-step with variables.
4. Give 1 memorable Pro-Tip for exams/interviews.
Keep formatting clean using bolding and bullet points. Tone should be friendly, clear, and encouraging.
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generated = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generated) return generated;
        }
      } catch (err) {
        console.warn('Gemini API request note, using offline pedagogical engine:', err);
      }
    }

    // High-Fidelity Pedagogical Fallback Engine (Zero API Key required)
    const { question, isCorrect } = params;
    const exp = question.explanation;

    let explanation = `### 💡 Concept Mastery: ${exp.concept}\n\n`;
    explanation += `${isCorrect ? '✅ **Awesome job! You nailed this!**' : '⚠️ **Good effort! Here is the clear concept breakdown:**'}\n\n`;
    explanation += `**Core Insight:**\n${exp.summary}\n\n`;

    if (exp.stepByStep && exp.stepByStep.length > 0) {
      explanation += `**Step-by-Step Logic Breakdown:**\n`;
      exp.stepByStep.forEach((step, idx) => {
        explanation += `${idx + 1}. ${step}\n`;
      });
      explanation += `\n`;
    }

    if (exp.codeTrace && exp.codeTrace.length > 0) {
      explanation += `**Code Execution Trace:**\n`;
      exp.codeTrace.forEach((trace) => {
        explanation += `- **Step ${trace.step}**: ${trace.description} ${trace.variables ? `\`[${trace.variables}]\`` : ''}\n`;
      });
      explanation += `\n`;
    }

    if (exp.commonMistake) {
      explanation += `**⚠️ Common Pitfall to Avoid:**\n${exp.commonMistake}\n\n`;
    }

    explanation += `**🚀 Key Takeaway for Interviews & Exams:**\n${exp.keyTakeaway}`;

    return explanation;
  },
};
