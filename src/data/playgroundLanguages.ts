import type { LanguageMeta, SupportedLanguage } from '@/types/playground';

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  {
    id: 'web',
    name: 'Web (HTML/CSS/JS)',
    monacoLang: 'html',
    mode: 'web',
    extension: '.html',
    version: 'HTML5 / CSS3 / ES6',
    starterFile: 'index.html',
    defaultCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LearnSpace Web Project</title>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <h1>Welcome to LearnSpace Playground 🚀</h1>
        <p>Edit HTML, CSS, and JavaScript in the tabs above to see your changes live.</p>
        <div class="actions">
          <button id="counterBtn">Clicks: 0</button>
          <button id="colorBtn">Change Theme</button>
        </div>
        <div id="statusMessage"></div>
      </div>
    </div>
  </body>
</html>`,
  },
  {
    id: 'python',
    name: 'Python 3.10',
    judge0Id: 71, // Standard Judge0 Python 3
    monacoLang: 'python',
    mode: 'general',
    extension: '.py',
    version: '3.10.x',
    starterFile: 'main.py',
    defaultCode: `# Python 3.10 Code Playground - LearnSpace
def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to Python programming."

print(greet("Student"))

# Data manipulation example
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [x for x in numbers if x % 2 == 0]
squares = [x**2 for x in evens]

print(f"Original: {numbers}")
print(f"Even numbers: {evens}")
print(f"Squares of evens: {squares}")

# Dictionary comprehension
word_lengths = {word: len(word) for word in ["Learn", "Space", "Python", "Portal"]}
print(f"Word lengths: {word_lengths}")
`,
  },
  {
    id: 'python-ml',
    name: 'Python 3.8 (ML)',
    judge0Id: 71,
    monacoLang: 'python',
    mode: 'general',
    extension: '.py',
    version: '3.8.x (Scientific / ML)',
    starterFile: 'model.py',
    defaultCode: `# Python Machine Learning & Scientific Computing
import math

class SimpleLinearRegression:
    def __init__(self, learning_rate=0.01, epochs=100):
        self.lr = learning_rate
        self.epochs = epochs
        self.weight = 0.0
        self.bias = 0.0

    def fit(self, X, y):
        n = len(X)
        for _ in range(self.epochs):
            y_pred = [self.weight * x + self.bias for x in X]
            dw = (-2 / n) * sum(x * (y_true - y_p) for x, y_true, y_p in zip(X, y, y_pred))
            db = (-2 / n) * sum(y_true - y_p for y_true, y_p in zip(y, y_pred))
            self.weight -= self.lr * dw
            self.bias -= self.lr * db

    def predict(self, x):
        return self.weight * x + self.bias

# Synthetic data: y = 2x + 1
X_train = [1.0, 2.0, 3.0, 4.0, 5.0]
y_train = [3.0, 5.0, 7.0, 9.0, 11.0]

model = SimpleLinearRegression(learning_rate=0.05, epochs=300)
model.fit(X_train, y_train)

print(f"Trained Weight: {model.weight:.3f} (Expected ~2.0)")
print(f"Trained Bias:   {model.bias:.3f} (Expected ~1.0)")
print(f"Prediction for x=6: {model.predict(6.0):.2f} (Expected 13.0)")
`,
  },
  {
    id: 'c',
    name: 'C (gcc 8.3.0)',
    judge0Id: 50, // C (GCC 9.2.0 / 8.3.0)
    monacoLang: 'c',
    mode: 'general',
    extension: '.c',
    version: 'gcc 8.3.0 / 9.2.0',
    starterFile: 'main.c',
    defaultCode: `#include <stdio.h>

int main() {
    printf("===================================\\n");
    printf(" Welcome to C on LearnSpace!\\n");
    printf("===================================\\n\\n");

    int numbers[] = {12, 45, 78, 23, 56, 89, 90};
    int n = sizeof(numbers) / sizeof(numbers[0]);

    int sum = 0;
    int max = numbers[0];

    for (int i = 0; i < n; i++) {
        sum += numbers[i];
        if (numbers[i] > max) {
            max = numbers[i];
        }
    }

    double average = (double)sum / n;

    printf("Array Elements: %d\\n", n);
    printf("Total Sum:      %d\\n", sum);
    printf("Average:        %.2f\\n", average);
    printf("Maximum:        %d\\n", max);

    return 0;
}
`,
  },
  {
    id: 'cpp',
    name: 'C++',
    judge0Id: 54, // C++ (GCC 9.2.0)
    monacoLang: 'cpp',
    mode: 'general',
    extension: '.cpp',
    version: 'g++ 17',
    starterFile: 'main.cpp',
    defaultCode: `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::cout << "=== C++17 LearnSpace Execution ===" << std::endl;

    std::vector<int> scores = {85, 92, 78, 96, 88, 74, 95};

    int sum = std::accumulate(scores.begin(), scores.end(), 0);
    double avg = static_cast<double>(sum) / scores.size();

    std::sort(scores.begin(), scores.end(), std::greater<int>());

    std::cout << "Total Students: " << scores.size() << std::endl;
    std::cout << "Class Average:  " << avg << std::endl;
    std::cout << "Top 3 Scores:   ";
    for (size_t i = 0; i < 3 && i < scores.size(); ++i) {
        std::cout << scores[i] << " ";
    }
    std::cout << std::endl;

    return 0;
}
`,
  },
  {
    id: 'java',
    name: 'Java',
    judge0Id: 62, // Java (OpenJDK 13.0.1)
    monacoLang: 'java',
    mode: 'general',
    extension: '.java',
    version: 'OpenJDK 13/17',
    starterFile: 'Main.java',
    defaultCode: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== LearnSpace Java Runtime ===");

        List<String> tracks = new ArrayList<>();
        tracks.add("Computer Programming with Python");
        tracks.add("Web Application Development");
        tracks.add("Quantitative Aptitude");
        tracks.add("Generative AI & Prompt Engineering");

        System.out.println("Enrolled Curriculum (" + tracks.size() + " tracks):");
        for (int i = 0; i < tracks.size(); i++) {
            System.out.println("  [" + (i + 1) + "] " + tracks.get(i));
        }

        long freeMem = Runtime.getRuntime().freeMemory();
        System.out.println("\\nJVM Free Memory: " + (freeMem / 1024 / 1024) + " MB");
    }
}
`,
  },
  {
    id: 'javascript',
    name: 'JavaScript (Node.js)',
    judge0Id: 63, // JavaScript (Node.js 12.14.0)
    monacoLang: 'javascript',
    mode: 'general',
    extension: '.js',
    version: 'Node.js 18+',
    starterFile: 'index.js',
    defaultCode: `// Node.js Execution Environment
console.log("=== Node.js Execution - LearnSpace ===");

const students = [
  { name: "Litesh", topic: "Python Functions", score: 95 },
  { name: "Priya", topic: "HTML5 & CSS3", score: 98 },
  { name: "Rahul", topic: "Quantitative Aptitude", score: 91 },
  { name: "Aarav", topic: "GenAI Foundations", score: 94 }
];

const highPerformers = students.filter(s => s.score >= 94);
console.log("High Performers (>93%):");
highPerformers.forEach(s => console.log(\`  - \${s.name}: \${s.score}% on \${s.topic}\`));

const avgScore = students.reduce((acc, s) => acc + s.score, 0) / students.length;
console.log(\`\\nCohort Average Score: \${avgScore.toFixed(1)}%\`);
`,
  },
];

export const DEFAULT_WEB_FILES = {
  html: SUPPORTED_LANGUAGES[0].defaultCode,
  css: `/* LearnSpace Web Playground Styling */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: #f1f5f9;
  color: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
}

.container {
  width: 100%;
  max-width: 520px;
}

.card {
  background: #ffffff;
  padding: 36px 32px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  text-align: center;
}

h1 {
  font-size: 22px;
  font-weight: 700;
  color: #1e3a8a;
  margin-top: 0;
  margin-bottom: 12px;
}

p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  background: #2563eb;
  color: #ffffff;
  border: 0;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

#colorBtn {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}

#colorBtn:hover {
  background: #e2e8f0;
}

#statusMessage {
  margin-top: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #059669;
  min-height: 20px;
}`,
  js: `// Interactive JavaScript logic
let clickCount = 0;
let isDarkTheme = false;

const counterBtn = document.getElementById('counterBtn');
const colorBtn = document.getElementById('colorBtn');
const statusMsg = document.getElementById('statusMessage');

counterBtn.addEventListener('click', () => {
  clickCount++;
  counterBtn.textContent = \`Clicks: \${clickCount}\`;
  statusMsg.textContent = \`Interactive click registered (\${clickCount})! ✨\`;
  console.log('Button clicked! Current count:', clickCount);
});

colorBtn.addEventListener('click', () => {
  isDarkTheme = !isDarkTheme;
  document.body.style.background = isDarkTheme ? '#0f172a' : '#f1f5f9';
  const card = document.querySelector('.card');
  if (card) {
    card.style.background = isDarkTheme ? '#1e293b' : '#ffffff';
    card.style.color = isDarkTheme ? '#f8fafc' : '#0f172a';
  }
  console.log('Theme toggled:', isDarkTheme ? 'Dark' : 'Light');
});

console.log('LearnSpace Web Project initialized successfully!');`,
};

