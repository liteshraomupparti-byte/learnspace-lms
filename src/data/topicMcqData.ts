import type { MCQQuestion } from '@/types/mcq';

export const TOPIC_MCQ_DATABASE: Record<string, MCQQuestion[]> = {
  // Topic: Loops & Iterations (Computer Programming with Python)
  'mod-py-07': [
    {
      id: 'py-loop-01',
      topicId: 'mod-py-07',
      title: 'Code Statement Ordering',
      question:
        'Anna is learning coding by going through different codes. Rearrange the given steps in the correct logical execution order according to the given code snippet to help her understand how the program computes the square of an input number.',
      type: 'order_code',
      codeSnippet: {
        language: 'python',
        code: `1 num = int(input())\n2 square = num * num\n3 print(square)`,
      },
      options: [
        { id: 'opt-3', text: 'Print the square of the number.' },
        { id: 'opt-2', text: 'Multiply the number by itself and store it in a variable.' },
        { id: 'opt-1', text: 'Take a number as input from the user.' },
      ],
      correctAnswer: ['opt-1', 'opt-2', 'opt-3'],
      explanation: {
        concept: 'Sequential Program Execution & Computation Flow',
        summary:
          'Python executes statements sequentially from top to bottom. First, data must be read from input before it can be computed, and it must be computed before it can be printed.',
        stepByStep: [
          'Step 1: Line 1 calls `input()` to prompt user input and `int()` to convert string to an integer, assigning it to `num`.',
          'Step 2: Line 2 performs the arithmetic operation `num * num` and binds the product to the variable `square`.',
          'Step 3: Line 3 calls `print(square)` to output the calculated result to standard output.',
        ],
        keyTakeaway:
          'In programming, dependencies dictate order: Input -> Processing/Calculation -> Output.',
        codeTrace: [
          { step: 1, description: 'User enters "5" -> num becomes 5', variables: 'num = 5' },
          { step: 2, description: 'square = 5 * 5 = 25', variables: 'square = 25' },
          { step: 3, description: 'Console prints 25', variables: 'stdout: 25' },
        ],
        commonMistake:
          'Attempting to calculate or print a variable before it has been read or initialized causes a NameError.',
      },
      difficulty: 'Easy',
      conceptTag: 'Execution Flow',
    },
    {
      id: 'py-loop-02',
      topicId: 'mod-py-07',
      title: 'While Loop Termination Condition',
      question:
        'Consider the while loop snippet below. How many times will the message "Coding is Fun!" be printed?',
      type: 'predict_output',
      codeSnippet: {
        language: 'python',
        code: `count = 1\nwhile count <= 5:\n    print("Coding is Fun!")\n    count += 2`,
      },
      options: [
        { id: 'a', text: '5 times' },
        { id: 'b', text: '3 times' },
        { id: 'c', text: '2 times' },
        { id: 'd', text: 'Infinite loop' },
      ],
      correctAnswer: 'b',
      explanation: {
        concept: 'While Loop Step Increment and Boundary Condition',
        summary:
          'The loop variable `count` starts at 1 and increases by 2 in each iteration. It runs for count = 1, 3, 5, resulting in exactly 3 print executions.',
        stepByStep: [
          'Iteration 1: count = 1 (1 <= 5 is True) -> prints message, count becomes 3',
          'Iteration 2: count = 3 (3 <= 5 is True) -> prints message, count becomes 5',
          'Iteration 3: count = 5 (5 <= 5 is True) -> prints message, count becomes 7',
          'Termination: count = 7 (7 <= 5 is False) -> loop exits immediately.',
        ],
        keyTakeaway:
          'Always trace the loop control variable after each step to count iterations accurately.',
        codeTrace: [
          { step: 1, description: 'count=1 -> condition 1<=5 holds -> print 1', variables: 'count = 3' },
          { step: 2, description: 'count=3 -> condition 3<=5 holds -> print 2', variables: 'count = 5' },
          { step: 3, description: 'count=5 -> condition 5<=5 holds -> print 3', variables: 'count = 7' },
        ],
        commonMistake:
          'Assuming count increment is 1 instead of noticing `count += 2`.',
      },
      difficulty: 'Easy',
      conceptTag: 'While Loop',
    },
    {
      id: 'py-loop-03',
      topicId: 'mod-py-07',
      title: 'For Loop with range() Step Parameter',
      question:
        'What is the exact console output produced by the following Python program?',
      type: 'single_choice',
      codeSnippet: {
        language: 'python',
        code: `for i in range(2, 10, 3):\n    print(i, end=" ")`,
      },
      options: [
        { id: 'a', text: '2 5 8' },
        { id: 'b', text: '2 4 6 8' },
        { id: 'c', text: '2 5 8 11' },
        { id: 'd', text: '3 6 9' },
      ],
      correctAnswer: 'a',
      explanation: {
        concept: 'range(start, stop, step) Mechanics',
        summary:
          '`range(start, stop, step)` generates integers starting at `start` (inclusive), incrementing by `step`, and ending strictly before `stop` (exclusive).',
        stepByStep: [
          'start = 2: first item is 2',
          'step = 3: next item is 2 + 3 = 5 (< 10, valid)',
          'step = 3: next item is 5 + 3 = 8 (< 10, valid)',
          'step = 3: next item would be 8 + 3 = 11, which is >= 10, so it stops.',
        ],
        keyTakeaway:
          'The stop value in Python `range()` is always exclusive and never included in the sequence.',
        codeTrace: [
          { step: 1, description: 'i = 2, prints 2 ', variables: 'i = 2' },
          { step: 2, description: 'i = 5, prints 5 ', variables: 'i = 5' },
          { step: 3, description: 'i = 8, prints 8 ', variables: 'i = 8' },
        ],
      },
      difficulty: 'Medium',
      conceptTag: 'For Loop & range',
    },
    {
      id: 'py-loop-04',
      topicId: 'mod-py-07',
      title: 'Break Statement in Loop Execution',
      question:
        'What will be the final value printed when this loop finishes executing?',
      type: 'predict_output',
      codeSnippet: {
        language: 'python',
        code: `total = 0\nfor x in [3, 7, 2, 8, 4]:\n    if x == 2:\n        break\n    total += x\nprint(total)`,
      },
      options: [
        { id: 'a', text: '10' },
        { id: 'b', text: '12' },
        { id: 'c', text: '24' },
        { id: 'd', text: '3' },
      ],
      correctAnswer: 'a',
      explanation: {
        concept: 'Immediate Loop Termination with `break`',
        summary:
          '`break` immediately terminates the innermost enclosing loop, jumping to the statement right after the loop block.',
        stepByStep: [
          'x = 3: x == 2 is False -> total = 0 + 3 = 3',
          'x = 7: x == 2 is False -> total = 3 + 7 = 10',
          'x = 2: x == 2 is True -> `break` triggers! Loop exits immediately without adding 2 or processing 8, 4.',
          'print(total) displays 10.',
        ],
        keyTakeaway:
          'When `break` executes, the current iteration halts instantly and subsequent loop items are discarded.',
        codeTrace: [
          { step: 1, description: 'x = 3 -> total = 3', variables: 'total = 3' },
          { step: 2, description: 'x = 7 -> total = 10', variables: 'total = 10' },
          { step: 3, description: 'x = 2 -> break executed -> loop terminates', variables: 'total = 10' },
        ],
        commonMistake:
          'Adding the value 2 before the break is executed.',
      },
      difficulty: 'Medium',
      conceptTag: 'Loop Control',
    },
    {
      id: 'py-loop-05',
      topicId: 'mod-py-07',
      title: 'Continue Statement and Odd Number Accumulator',
      question:
        'What is the final output of the code snippet below?',
      type: 'predict_output',
      codeSnippet: {
        language: 'python',
        code: `sum_val = 0\nfor n in range(1, 6):\n    if n % 2 == 0:\n        continue\n    sum_val += n\nprint(sum_val)`,
      },
      options: [
        { id: 'a', text: '9' },
        { id: 'b', text: '6' },
        { id: 'c', text: '15' },
        { id: 'd', text: '0' },
      ],
      correctAnswer: 'a',
      explanation: {
        concept: 'Skipping Iterations with `continue`',
        summary:
          '`continue` skips the remainder of the current iteration and jumps directly to the next iteration of the loop.',
        stepByStep: [
          'n = 1: 1 % 2 != 0 -> sum_val = 0 + 1 = 1',
          'n = 2: 2 % 2 == 0 -> continue (skipped)',
          'n = 3: 3 % 2 != 0 -> sum_val = 1 + 3 = 4',
          'n = 4: 4 % 2 == 0 -> continue (skipped)',
          'n = 5: 5 % 2 != 0 -> sum_val = 4 + 5 = 9',
          'Result: 1 + 3 + 5 = 9.',
        ],
        keyTakeaway:
          '`continue` skips code below it for the current item, but unlike `break`, it does not terminate the loop.',
        codeTrace: [
          { step: 1, description: 'n = 1 -> added to sum', variables: 'sum_val = 1' },
          { step: 2, description: 'n = 2 -> even -> continue', variables: 'sum_val = 1' },
          { step: 3, description: 'n = 3 -> added to sum', variables: 'sum_val = 4' },
          { step: 4, description: 'n = 4 -> even -> continue', variables: 'sum_val = 4' },
          { step: 5, description: 'n = 5 -> added to sum', variables: 'sum_val = 9' },
        ],
      },
      difficulty: 'Medium',
      conceptTag: 'Loop Control',
    },
  ],

  // Topic 01: Introduction to Python
  'mod-py-01': [
    {
      id: 'py-intro-01',
      topicId: 'mod-py-01',
      title: 'Python Language Characteristics',
      question:
        'Which of the following statements about Python execution model and design is CORRECT?',
      type: 'single_choice',
      options: [
        { id: 'a', text: 'Python is a statically-typed language requiring explicit variable type declarations.' },
        { id: 'b', text: 'Python is dynamically-typed and interpreted line-by-line via bytecode compilation to a Virtual Machine (PVM).' },
        { id: 'c', text: 'Python code must be compiled into native machine machine-code binaries before running.' },
        { id: 'd', text: 'Indentation in Python is optional and purely decorative like in C or Java.' },
      ],
      correctAnswer: 'b',
      explanation: {
        concept: 'Python Architecture and Execution Model',
        summary:
          'Python is a dynamically typed, high-level language. Source code is compiled to `.pyc` bytecode, which is executed by the Python Virtual Machine (PVM). Indentation defines code blocks.',
        stepByStep: [
          '1. Source code (.py) is compiled into bytecode (.pyc).',
          '2. The Python Virtual Machine (PVM) interprets bytecode instructions line-by-line.',
          '3. Variables bind to objects at runtime without static type declarations.',
        ],
        keyTakeaway:
          'Python uses whitespace indentation to define scope and blocks, eliminating braces `{}`.',
      },
      difficulty: 'Easy',
      conceptTag: 'Python Basics',
    },
    {
      id: 'py-intro-02',
      topicId: 'mod-py-01',
      title: 'Printing Multiple Arguments',
      question:
        'What will be printed to the console by the following statement?',
      type: 'single_choice',
      codeSnippet: {
        language: 'python',
        code: `print("Python", "3.10", sep="*", end="!")`,
      },
      options: [
        { id: 'a', text: 'Python*3.10!' },
        { id: 'b', text: 'Python 3.10!' },
        { id: 'c', text: 'Python*3.10\\n' },
        { id: 'd', text: 'Python*3.10' },
      ],
      correctAnswer: 'a',
      explanation: {
        concept: 'print() Parameters `sep` and `end`',
        summary:
          '`sep` specifies the delimiter between multiple arguments, while `end` specifies the trailing string appended after printing.',
        stepByStep: [
          'Arguments: "Python" and "3.10".',
          '`sep="*"` replaces the default space with an asterisk -> "Python*3.10".',
          '`end="!"` replaces the default newline character `\\n` with "!" -> "Python*3.10!".',
        ],
        keyTakeaway:
          'Default values: `sep=" "` (single space) and `end="\\n"` (newline). Customizing them allows flexible formatting.',
      },
      difficulty: 'Easy',
      conceptTag: 'Print & I/O',
    },
  ],

  // Topic 02: Sequence of Instructions & I/O
  'mod-py-02': [
    {
      id: 'py-io-01',
      topicId: 'mod-py-02',
      title: 'input() Return Data Type',
      question:
        'In Python, what is the default data type returned by the built-in `input()` function, even if the user types numeric digits like 42?',
      type: 'single_choice',
      codeSnippet: {
        language: 'python',
        code: `val = input("Enter a number: ")  # User types 42\nprint(type(val))`,
      },
      options: [
        { id: 'a', text: "<class 'int'>" },
        { id: 'b', text: "<class 'str'>" },
        { id: 'c', text: "<class 'float'>" },
        { id: 'd', text: "<class 'number'>" },
      ],
      correctAnswer: 'b',
      explanation: {
        concept: 'Input Type Handling in Python',
        summary:
          '`input()` always reads user input as a string (`str`). If numeric operations are required, explicit type casting (e.g. `int()` or `float()`) is required.',
        stepByStep: [
          'When input is received from standard input, Python captures character streams.',
          'Even if the user enters 42, `input()` stores `"42"` as a string.',
          'Therefore, `type(val)` evaluates to `<class \'str\'>`.',
        ],
        keyTakeaway:
          'Always cast user input using `int(input())` or `float(input())` before doing arithmetic.',
        commonMistake:
          'Assuming numeric keystrokes automatically produce integer types without type conversion.',
      },
      difficulty: 'Easy',
      conceptTag: 'Type Conversion',
    },
  ],

  // Topic 06: Conditional Statements
  'mod-py-06': [
    {
      id: 'py-cond-01',
      topicId: 'mod-py-06',
      title: 'Short-Circuit Evaluation in Booleans',
      question:
        'What will be printed when the following script executes?',
      type: 'predict_output',
      codeSnippet: {
        language: 'python',
        code: `x = 10\ny = 0\nif y != 0 and (x / y) > 2:\n    print("Condition Met")\nelse:\n    print("Safe Division Avoided")`,
      },
      options: [
        { id: 'a', text: 'Safe Division Avoided' },
        { id: 'b', text: 'ZeroDivisionError: division by zero' },
        { id: 'c', text: 'Condition Met' },
        { id: 'd', text: 'SyntaxError' },
      ],
      correctAnswer: 'a',
      explanation: {
        concept: 'Short-Circuit Evaluation in `and` Operator',
        summary:
          'Python uses short-circuit evaluation. In `A and B`, if `A` evaluates to `False`, Python does NOT evaluate `B` at all.',
        stepByStep: [
          'Evaluate `y != 0`: since y = 0, `0 != 0` is `False`.',
          'Because the left-hand operand of `and` is False, the overall condition cannot be True.',
          'Python skips evaluating `(x / y) > 2`, completely avoiding a `ZeroDivisionError`!',
          'Execution jumps to the `else` block, printing "Safe Division Avoided".',
        ],
        keyTakeaway:
          'Short-circuiting is a core protective idiom in programming to guard against null-pointer or zero-division exceptions.',
        codeTrace: [
          { step: 1, description: 'y = 0', variables: 'y = 0' },
          { step: 2, description: 'Evaluate (y != 0) -> False', variables: 'Short-circuit active' },
          { step: 3, description: 'Enter else branch', variables: 'stdout: Safe Division Avoided' },
        ],
      },
      difficulty: 'Medium',
      conceptTag: 'Conditionals & Short-circuit',
    },
  ],

  // Web Development Topic 01: HTML5 Fundamentals
  'mod-web-01': [
    {
      id: 'web-html-01',
      topicId: 'mod-web-01',
      title: 'HTML Semantic Elements',
      question:
        'Which HTML5 tag is the most semantically appropriate container for independent, self-contained content that could be syndicated (e.g. a blog post, forum post, or news article)?',
      type: 'single_choice',
      options: [
        { id: 'a', text: '<article>' },
        { id: 'b', text: '<section>' },
        { id: 'c', text: '<div>' },
        { id: 'd', text: '<aside>' },
      ],
      correctAnswer: 'a',
      explanation: {
        concept: 'HTML5 Semantic Elements vs Generic Divs',
        summary:
          '`<article>` represents an autonomous, self-contained unit of information suitable for syndication. `<section>` represents a thematic grouping within a page.',
        stepByStep: [
          '`<article>`: self-contained piece of content (news article, blog post, review).',
          '`<section>`: thematic group of content, typically with a heading.',
          '`<aside>`: tangentially related content like sidebars or pull quotes.',
          '`<div>`: non-semantic generic container used solely for styling.',
        ],
        keyTakeaway:
          'Semantic tags improve screen reader accessibility (ARIA), SEO indexing, and maintainability.',
      },
      difficulty: 'Easy',
      conceptTag: 'Semantic HTML',
    },
  ],

  // Modern JavaScript Topic 03: ES6+ & DOM
  'mod-web-03': [
    {
      id: 'web-js-01',
      topicId: 'mod-web-03',
      title: 'Array.map() vs Array.forEach()',
      question:
        'What will be the output of the following JavaScript code snippet?',
      type: 'predict_output',
      codeSnippet: {
        language: 'javascript',
        code: `const nums = [1, 2, 3];\nconst mapped = nums.map(x => x * 2);\nconst forEached = nums.forEach(x => x * 2);\n\nconsole.log(mapped.length, forEached);`,
      },
      options: [
        { id: 'a', text: '3 undefined' },
        { id: 'b', text: '3 [2, 4, 6]' },
        { id: 'c', text: '[2, 4, 6] undefined' },
        { id: 'd', text: 'TypeError: Cannot read properties' },
      ],
      correctAnswer: 'a',
      explanation: {
        concept: 'Array.map() Return Value vs Array.forEach() Side Effects',
        summary:
          '`map()` transforms an array and returns a brand new array of equal length. `forEach()` performs an action for each element and always returns `undefined`.',
        stepByStep: [
          '`nums.map(x => x * 2)` returns `[2, 4, 6]`. Its length is 3.',
          '`nums.forEach(...)` iterates over items for side-effects, but returns `undefined`.',
          'Printing `mapped.length, forEached` outputs `3 undefined`.',
        ],
        keyTakeaway:
          'Use `map()` when you need a transformed array; use `forEach()` only when executing side-effects without collecting returns.',
      },
      difficulty: 'Medium',
      conceptTag: 'Array Methods',
    },
  ],
};

// Helper to get questions for a topic or generate intelligent fallback practice questions
export function getQuestionsForTopic(moduleId: string, topicTitle: string): MCQQuestion[] {
  if (TOPIC_MCQ_DATABASE[moduleId] && TOPIC_MCQ_DATABASE[moduleId].length > 0) {
    return TOPIC_MCQ_DATABASE[moduleId];
  }

  // Fallback dynamic questions based on topic title
  const cleanTitle = topicTitle.replace(/Topic \d+:\s*/i, '');
  return [
    {
      id: `${moduleId}-q1`,
      topicId: moduleId,
      title: `${cleanTitle} - Core Concept`,
      question: `Which of the following best defines the primary objective of studying "${cleanTitle}" in computer science and software development?`,
      type: 'single_choice',
      options: [
        { id: 'a', text: `It provides fundamental principles, control patterns, and operational logic essential for reliable software.` },
        { id: 'b', text: `It is only used in legacy mainframe systems and is deprecated in modern frameworks.` },
        { id: 'c', text: `It is an exclusively decorative design pattern without functional computation.` },
        { id: 'd', text: `It requires hardware modifications to execute.` },
      ],
      correctAnswer: 'a',
      explanation: {
        concept: `${cleanTitle} Mastery`,
        summary: `Mastering ${cleanTitle} establishes the logical foundation for writing maintainable, performant, and bug-free code.`,
        stepByStep: [
          `1. Understand syntax and semantics of ${cleanTitle}.`,
          `2. Trace step-by-step memory and variable states.`,
          `3. Apply best practices to prevent edge-case errors.`,
        ],
        keyTakeaway: `Core language constructs allow developers to decompose complex real-world requirements into clean procedural steps.`,
      },
      difficulty: 'Easy',
      conceptTag: cleanTitle,
    },
    {
      id: `${moduleId}-q2`,
      topicId: moduleId,
      title: `${cleanTitle} - Debugging & Best Practice`,
      question: `When implementing solutions involving "${cleanTitle}", what is the most critical factor to inspect to prevent runtime bugs or unexpected behavior?`,
      type: 'single_choice',
      options: [
        { id: 'a', text: 'Boundary conditions, termination states, and proper type compatibility.' },
        { id: 'b', text: 'Color scheme of the code editor.' },
        { id: 'c', text: 'Operating system desktop background.' },
        { id: 'd', text: 'The size of the hard drive.' },
      ],
      correctAnswer: 'a',
      explanation: {
        concept: 'Robust Programming & Verification',
        summary:
          'Software faults predominantly occur at edge boundaries (e.g. empty inputs, index limits, off-by-one bounds, null/type mismatches).',
        stepByStep: [
          'Verify initial condition setup.',
          'Verify state progression in each step.',
          'Verify graceful boundary termination.',
        ],
        keyTakeaway: 'Always test edge cases and boundary limits during development.',
      },
      difficulty: 'Medium',
      conceptTag: 'Best Practices',
    },
  ];
}
