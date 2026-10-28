import type { Course, Module, Lesson, PortalEvent } from '@/types';

export interface SeedCourseDef {
  id: string;
  title: string;
  description: string;
  order: number;
  modules: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      description: string;
      videoId: string;
      notes: string;
      order: number;
      resourceLinks?: { label: string; url: string }[];
    }[];
  }[];
}

export const INITIAL_COURSES: SeedCourseDef[] = [
  {
    id: 'course-python',
    title: 'Computer Programming with Python',
    description:
      'Comprehensive topic-wise Python curriculum from foundational syntax and control flow to data structures, recursion, OOP, file I/O, and exception handling.',
    order: 1,
    modules: [
      {
        id: 'mod-py-01',
        title: 'Topic 01: Introduction to Python',
        order: 1,
        lessons: [
          {
            id: 'les-py-01-01',
            title: 'Programming with Python',
            description:
              'Introduction to what Python is, installation, REPL vs scripts, and understanding the Python execution model.',
            videoId: '7wnove7K-ZQ',
            notes:
              'Python is a high-level, interpreted, general-purpose programming language known for its readability and concise syntax.',
            order: 1,
            resourceLinks: [
              { label: 'Official Python Documentation', url: 'https://docs.python.org/3/' },
              { label: 'Python.org Downloads', url: 'https://www.python.org/downloads/' },
            ],
          },
          {
            id: 'les-py-01-02',
            title: 'Writing Your First Python Program',
            description:
              'Step-by-step walkthrough of creating, running, and debugging your first .py script.',
            videoId: '7IWOYhfAcVg',
            notes:
              'Use print() to display output to the console. Python files use the .py extension and are executed line-by-line by the Python interpreter.',
            order: 2,
          },
          {
            id: 'les-py-01-03',
            title: 'Python Modules & Pip Package Manager',
            description:
              'Understand built-in vs external modules and how to install third-party libraries using pip.',
            videoId: 'xwKO_y2gHxQ',
            notes:
              'Pip is the standard package manager for Python. Run `pip install <package_name>` to install packages from PyPI.',
            order: 3,
            resourceLinks: [
              { label: 'PyPI - Python Package Index', url: 'https://pypi.org/' },
            ],
          },
          {
            id: 'les-py-01-04',
            title: 'The Power of Python & Leveraging GenAI for Learning',
            description:
              'Real-world applications of Python and guidelines on using AI assistants responsibly to accelerate debugging and concept mastery.',
            videoId: 'Tto8TS-fJQU',
            notes:
              'Use AI tools to explain error tracebacks, explore edge cases, and generate targeted practice problems rather than copying solutions blindly.',
            order: 4,
          },
        ],
      },
      {
        id: 'mod-py-02',
        title: 'Topic 02: Sequence of Instructions & I/O',
        order: 2,
        lessons: [
          {
            id: 'les-py-02-01',
            title: 'Comments, Escape Sequences & Print Statement',
            description:
              'How Python executes instructions sequentially, single/multi-line comments, escape characters (\\n, \\t), and print() parameters (sep, end).',
            videoId: 'qxPMmW93eDs',
            notes:
              'Single-line comments begin with #. In print(a, b, sep="-", end="\\n"), sep controls the separator and end controls the trailing character.',
            order: 1,
          },
          {
            id: 'les-py-02-02',
            title: 'Taking User Input in Python',
            description:
              'Reading interactive input from users with input() and formatting output using f-strings.',
            videoId: 'WvG-R-xXouA',
            notes:
              'input() always returns a string (str). Wrap with int() or float() when performing numerical calculations.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-py-03',
        title: 'Topic 03: Variables and Data Types',
        order: 3,
        lessons: [
          {
            id: 'les-py-03-01',
            title: 'Variables and Built-in Data Types',
            description:
              'Deep dive into integers (int), floating-point numbers (float), complex numbers, booleans (bool), strings (str), and NoneType.',
            videoId: 'ORCuz7s5cCY',
            notes:
              'Python is dynamically typed—you do not need to declare variable types explicitly. Use type(x) to inspect the runtime type of any object.',
            order: 1,
          },
          {
            id: 'les-py-03-02',
            title: 'Variable Naming Rules & Memory References',
            description:
              'Identifier naming conventions (snake_case), object identity with id(), and how variables reference objects in memory.',
            videoId: 'TqPzwenhMj0',
            notes:
              'Variable names must start with a letter or underscore and are case-sensitive. Everything in Python is an object.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-py-04',
        title: 'Topic 04: Type Conversions',
        order: 4,
        lessons: [
          {
            id: 'les-py-04-01',
            title: 'Implicit vs Explicit Typecasting in Python',
            description:
              'How Python handles automatic coercion vs manual type conversion using int(), float(), str(), and bool().',
            videoId: 'Pu5bqySSSS0',
            notes:
              'Explicit typecasting converts one data type into another via constructor functions like int("42"). Invalid conversions raise a ValueError.',
            order: 1,
          },
        ],
      },
      {
        id: 'mod-py-05',
        title: 'Topic 05: Operators in Python',
        order: 5,
        lessons: [
          {
            id: 'les-py-05-01',
            title: 'Arithmetic, Assignment & Comparison Operators',
            description:
              'Working with +, -, *, /, // (floor division), % (modulo), ** (exponentiation), and relational operators.',
            videoId: 'FLVqcxnJP_E',
            notes:
              '/ always performs true float division, while // performs floor division returning the quotient rounded down.',
            order: 1,
          },
          {
            id: 'les-py-05-02',
            title: 'Logical, Identity, Membership & Bitwise Operators',
            description:
              'Understanding and, or, not, short-circuit evaluation, in / not in, is / is not, and bitwise operators (&, |, ^, ~, <<, >>).',
            videoId: 'PyfKCvHALj8',
            notes:
              'Use `==` to compare values and `is` to check whether two references point to the exact same object in memory.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-py-06',
        title: 'Topic 06: Conditional Statements',
        order: 6,
        lessons: [
          {
            id: 'les-py-06-01',
            title: 'If, Elif, Else & Nested Conditional Statements',
            description:
              'Controlling program branching with if, elif, and else blocks, indentation rules, and truthy/falsy values.',
            videoId: 'ceiuLR2ysas',
            notes:
              'Indentation (standard 4 spaces) defines code blocks in Python. Empty collections, 0, None, and "" evaluate to False in boolean contexts.',
            order: 1,
          },
        ],
      },
      {
        id: 'mod-py-07',
        title: 'Topic 07: Loops and Iterations',
        order: 7,
        lessons: [
          {
            id: 'les-py-07-01',
            title: 'For Loops and the range() Function',
            description:
              'Iterating over sequences and numeric ranges using range(start, stop, step) and enumerate().',
            videoId: 'fIYVzKp0q5w',
            notes:
              'range(start, stop, step) generates numbers from start up to (but excluding) stop.',
            order: 1,
          },
          {
            id: 'les-py-07-02',
            title: 'While Loops & Condition-Controlled Iteration',
            description:
              'Writing while loops, sentinel values, loop counters, and preventing infinite loops.',
            videoId: '-tCFyIyKVx0',
            notes:
              'Always ensure the loop condition variable is updated inside the while body so the loop terminates cleanly.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-py-08',
        title: 'Topic 08: Nested Loops & Loop Control Statements',
        order: 8,
        lessons: [
          {
            id: 'les-py-08-01',
            title: 'Break, Continue, and Pass Statements',
            description:
              'Altering loop execution flow: early termination with break, skipping iterations with continue, and null placeholders with pass.',
            videoId: 'RkwJnjdrm70',
            notes:
              '`break` exits the innermost enclosing loop immediately; `continue` jumps straight to the next iteration of the loop.',
            order: 1,
          },
          {
            id: 'les-py-08-02',
            title: 'Nested Loops & Loop-Else Clauses',
            description:
              '2D grid traversal, pattern printing with nested loops, and how the else block behaves on for/while loops.',
            videoId: 'qUkcIgErZzc',
            notes:
              'A loop `else` block runs only if the loop finished normally without encountering a `break` statement.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-py-09',
        title: 'Topic 09: Strings and String Methods',
        order: 9,
        lessons: [
          {
            id: 'les-py-09-01',
            title: 'Strings Fundamentals & Indexing',
            description:
              'Single, double, and triple-quoted strings, positive and negative indexing, and string immutability.',
            videoId: 'kMNFQYArrLg',
            notes:
              'Strings in Python are immutable sequences of Unicode characters. Negative indices count backward from the end (-1 is the last character).',
            order: 1,
          },
          {
            id: 'les-py-09-02',
            title: 'String Slicing & Operations',
            description:
              'Extracting substrings with s[start:stop:step], reversing strings with s[::-1], and concatenation.',
            videoId: '8jW7lpT8HW8',
            notes:
              'Slicing never raises an IndexError for out-of-range bounds; it gracefully clamps to the string boundaries.',
            order: 2,
          },
          {
            id: 'les-py-09-03',
            title: 'Essential String Methods',
            description:
              'Mastering strip(), split(), join(), replace(), find(), count(), startswith(), upper(), and lower().',
            videoId: '0INvoK_T0cE',
            notes:
              'Because strings are immutable, string methods always return a new string rather than modifying the original string in place.',
            order: 3,
          },
        ],
      },
      {
        id: 'mod-py-10',
        title: 'Topic 10: Lists and Tuples',
        order: 10,
        lessons: [
          {
            id: 'les-py-10-01',
            title: 'Introduction to Lists & List Comprehensions',
            description:
              'Creating dynamic arrays, indexing, slicing, mutability, and concise list comprehensions.',
            videoId: 'eF6nK5bSlmg',
            notes:
              'List comprehensions offer a readable syntax for transforming and filtering lists: `[x**2 for x in nums if x > 0]`.',
            order: 1,
          },
          {
            id: 'les-py-10-02',
            title: 'List Methods (append, extend, insert, pop, sort)',
            description:
              'In-place list mutations, sorting with custom keys, shallow vs deep copying, and time complexity.',
            videoId: 'scWc3F8LbOo',
            notes:
              '`list.sort()` sorts the list in-place and returns None, whereas `sorted(iterable)` returns a new sorted list.',
            order: 2,
          },
          {
            id: 'les-py-10-03',
            title: 'Tuples, Packing & Unpacking',
            description:
              'Immutable sequences, single-element tuple syntax `(x,)`, tuple unpacking, and using tuples as dictionary keys.',
            videoId: 'PipsOUDKrVk',
            notes:
              'Tuples are immutable and memory-efficient, making them ideal for fixed records and hashable composite keys.',
            order: 3,
          },
        ],
      },
      {
        id: 'mod-py-11',
        title: 'Topic 11: Dictionaries and Sets',
        order: 11,
        lessons: [
          {
            id: 'les-py-11-01',
            title: 'Dictionaries: Key-Value Pairs & Hash Maps',
            description:
              'Creating dictionaries, safe lookups with .get(), iterating over .keys(), .values(), and .items(), and dict comprehensions.',
            videoId: 'j2G68uQtOwM',
            notes:
              'Dictionaries provide O(1) average-case lookup, insertion, and deletion by key. Keys must be immutable (hashable) types.',
            order: 1,
          },
          {
            id: 'les-py-11-02',
            title: 'Sets: Uniqueness & Fast Membership Testing',
            description:
              'Creating sets, deduplicating collections, and understanding unordered unique elements.',
            videoId: 'l3kCO8cVA6o',
            notes:
              'Use `set()` to create an empty set (`{}` creates an empty dictionary). Membership checks (`x in my_set`) run in O(1) average time.',
            order: 2,
          },
          {
            id: 'les-py-11-03',
            title: 'Set Methods & Mathematical Set Operations',
            description:
              'Performing union (|), intersection (&), difference (-), symmetric difference (^), and subset/superset checks.',
            videoId: 'HOrutCnp2zo',
            notes:
              '`a.union(b)` returns a new set with elements from both sets; `a.intersection(b)` returns only elements common to both.',
            order: 3,
          },
        ],
      },
      {
        id: 'mod-py-12',
        title: 'Topic 12: Functions in Python',
        order: 12,
        lessons: [
          {
            id: 'les-py-12-01',
            title: 'Defining Functions, Parameters & Return Values',
            description:
              'Using the def keyword, returning single and multiple values, variable scope (LEGB rule), and modular design.',
            videoId: 'dyvxxJSGUsE',
            notes:
              'Functions without an explicit return statement automatically return `None`.',
            order: 1,
          },
          {
            id: 'les-py-12-02',
            title: 'Function Arguments: Default, Keyword, *args & **kwargs',
            description:
              'Positional vs keyword arguments, default parameter values, and variable-length argument packing/unpacking.',
            videoId: '0d6b6fFuCkE',
            notes:
              '`*args` collects extra positional arguments as a tuple; `**kwargs` collects extra keyword arguments as a dictionary.',
            order: 2,
          },
          {
            id: 'les-py-12-03',
            title: 'Lambda Functions, map(), filter(), and reduce()',
            description:
              'Anonymous inline functions and functional programming utilities in Python.',
            videoId: 'OErhjT4f5Cs',
            notes:
              '`lambda x: x * 2` creates a concise anonymous function, commonly used as a key function in `sorted()` or with `map()` and `filter()`.',
            order: 3,
          },
        ],
      },
      {
        id: 'mod-py-13',
        title: 'Topic 13: Recursion',
        order: 13,
        lessons: [
          {
            id: 'les-py-13-01',
            title: 'Recursion: Base Cases, Call Stack & Classic Problems',
            description:
              'Understanding how recursive calls use the call stack, preventing RecursionError, and solving factorial, Fibonacci, and tree traversal.',
            videoId: 'XYwJKFB8DUk',
            notes:
              'Every recursive function requires a clear base case that stops recursion and a recursive step that progresses toward the base case.',
            order: 1,
          },
        ],
      },
      {
        id: 'mod-py-14',
        title: 'Topic 14: Object-Oriented Programming (OOP)',
        order: 14,
        lessons: [
          {
            id: 'les-py-14-01',
            title: 'Classes, Objects, Constructors & Decorators',
            description:
              'Defining classes, the `self` parameter, `__init__` constructors, and method decorators.',
            videoId: 'PTBZ674EsvI',
            notes:
              '`__init__(self, ...)` initializes new object instances. `self` refers to the specific instance on which a method is called.',
            order: 1,
          },
          {
            id: 'les-py-14-02',
            title: 'Encapsulation, Getters & Setters (@property)',
            description:
              'Using `@property` decorators for clean attribute access, validation, and encapsulation.',
            videoId: '2gbCT8h9uyk',
            notes:
              'The `@property` decorator lets you define methods that can be accessed like regular attributes while enforcing validation logic.',
            order: 2,
          },
          {
            id: 'les-py-14-03',
            title: 'Instance Variables vs Class Variables',
            description:
              'Distinguishing per-instance state from shared class-level attributes and class/static methods.',
            videoId: 'tQdaeiF4j38',
            notes:
              'Class variables are shared across all instances of a class, whereas instance variables (`self.x`) belong uniquely to each object.',
            order: 3,
          },
        ],
      },
      {
        id: 'mod-py-15',
        title: 'Topic 15: File Handling',
        order: 15,
        lessons: [
          {
            id: 'les-py-15-01',
            title: 'File I/O: Opening, Reading, and Writing Files',
            description:
              'Working with file modes (`r`, `w`, `a`, `rb`), text vs binary files, and context managers (`with open(...) as f`).',
            videoId: 'eDBPlcWYses',
            notes:
              'Always use `with open("file.txt", "r") as f:` to ensure files are automatically closed even if an exception occurs.',
            order: 1,
          },
          {
            id: 'les-py-15-02',
            title: 'Working with read(), readline(), readlines() & seek()',
            description:
              'Streaming line-by-line file processing, writing multiple lines, and controlling file pointers.',
            videoId: 'l1FsnQxET9U',
            notes:
              'Iterating directly over a file object (`for line in f:`) is memory-efficient for reading large files line by line.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-py-16',
        title: 'Topic 16: Exception Handling',
        order: 16,
        lessons: [
          {
            id: 'les-py-16-01',
            title: 'Try, Except & Handling Runtime Errors',
            description:
              'Catching specific exceptions (ValueError, ZeroDivisionError, KeyError, FileNotFoundError) and raising custom errors.',
            videoId: '6SPDvPK38tw',
            notes:
              'Catch specific exception classes rather than a bare `except:` clause so you do not accidentally mask unexpected bugs.',
            order: 1,
          },
          {
            id: 'les-py-16-02',
            title: 'The finally Keyword & Resource Cleanup',
            description:
              'Using try-except-else-finally blocks and understanding why `finally` executes even when functions return early.',
            videoId: 'r_iuC-IDpPM',
            notes:
              'The `finally` block always executes whether an exception was raised or not, making it ideal for releasing external resources.',
            order: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'course-web-dev',
    title: 'Web Application Development',
    description:
      'Master modern frontend and full-stack web technologies topic-by-topic: Semantic HTML5, CSS3 Flexbox & Grid, ES6+ JavaScript, DOM, and React 19.',
    order: 2,
    modules: [
      {
        id: 'mod-web-01',
        title: 'Topic 01: HTML5 Fundamentals & Semantic Structure',
        order: 1,
        lessons: [
          {
            id: 'les-web-01-01',
            title: 'Complete HTML5 Structure, Tags, Forms & Tables',
            description:
              'Document anatomy, semantic elements (header, nav, main, section, article), forms, inputs, and accessibility.',
            videoId: 'HcOc7P5BMi4',
            notes:
              'Semantic HTML tags convey meaning to both browsers and assistive screen readers, improving SEO and accessibility.',
            order: 1,
            resourceLinks: [
              { label: 'MDN HTML Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
            ],
          },
          {
            id: 'les-web-01-02',
            title: 'HTML Crash Course: Building Structured Web Pages',
            description:
              'Hands-on practice structuring real-world web pages with clean markup, links, images, and lists.',
            videoId: 'qz0aGYrrlhU',
            notes:
              'Always include `alt` attributes on `<img>` elements and associate `<label>` elements with form controls.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-web-02',
        title: 'Topic 02: CSS3 Styling, Flexbox & Grid Layouts',
        order: 2,
        lessons: [
          {
            id: 'les-web-02-01',
            title: 'CSS3 Fundamentals, Selectors & The Box Model',
            description:
              'Specificity, cascade, margin, border, padding, content box vs border-box, typography, and colors.',
            videoId: 'ESnrn1kAD4E',
            notes:
              'Setting `box-sizing: border-box` ensures padding and borders are included inside an element’s declared width and height.',
            order: 1,
          },
          {
            id: 'les-web-02-02',
            title: 'Mastering CSS Flexbox Layouts',
            description:
              'Main axis vs cross axis, justify-content, align-items, flex-wrap, gap, and flexible sizing.',
            videoId: 'JJSoEo8JSnc',
            notes:
              'Flexbox excels at one-dimensional layouts (rows or columns) and dynamic alignment of navigation bars and card toolbars.',
            order: 2,
          },
          {
            id: 'les-web-02-03',
            title: 'Two-Dimensional Responsive Layouts with CSS Grid',
            description:
              'Grid tracks, `grid-template-columns`, `repeat(auto-fit, minmax(...))`, grid areas, and responsive breakpoints.',
            videoId: 't6CBKf8K_Ac',
            notes:
              'Use CSS Grid for two-dimensional page shells and gallery grids, and Flexbox for alignment inside individual components.',
            order: 3,
          },
        ],
      },
      {
        id: 'mod-web-03',
        title: 'Topic 03: Modern JavaScript (ES6+ & DOM)',
        order: 3,
        lessons: [
          {
            id: 'les-web-03-01',
            title: 'JavaScript Fundamentals: Variables, Functions & Arrays',
            description:
              'let/const, arrow functions, objects, array methods (map, filter, reduce), and control flow.',
            videoId: 'W6NZfCO5SIk',
            notes:
              'Prefer `const` by default and `let` when reassignment is needed. Avoid `var` to prevent hoisting and function-scoping bugs.',
            order: 1,
          },
          {
            id: 'les-web-03-02',
            title: 'DOM Manipulation, Events, Fetch API & Async/Await',
            description:
              'Selecting and updating DOM nodes, event listeners, Promises, async/await, and fetching JSON APIs.',
            videoId: 'VlPiVmYuoqw',
            notes:
              '`async/await` provides clean syntactic sugar over Promises. Always wrap network `fetch()` calls in `try / catch` blocks.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-web-04',
        title: 'Topic 04: React & Component Architecture',
        order: 4,
        lessons: [
          {
            id: 'les-web-04-01',
            title: 'React Fundamentals: Components, JSX, Props & State',
            description:
              'Thinking in components, declarative UI rendering, passing props, and managing interactive state with useState.',
            videoId: 'SqcY0GlETPk',
            notes:
              'React components must be pure functions of their props and state. Never mutate state directly—always call the setter function.',
            order: 1,
          },
          {
            id: 'les-web-04-02',
            title: 'Full React Course: Hooks, Routing & State Management',
            description:
              'Building complete single-page applications with useEffect, custom hooks, forms, and client-side routing.',
            videoId: 'TtPXvEcE11E',
            notes:
              'Keep state as close as possible to where it is used, and lift state up to the closest common parent when sibling components need to share it.',
            order: 2,
          },
        ],
      },
    ],
  },
  {
    id: 'course-quant-apt',
    title: 'Quantitative Aptitude',
    description:
      'Topic-wise mathematical problem solving, numerical reasoning, and high-speed calculation techniques for placements and competitive assessments.',
    order: 3,
    modules: [
      {
        id: 'mod-quant-01',
        title: 'Topic 01: Number Systems & Arithmetic',
        order: 1,
        lessons: [
          {
            id: 'les-quant-01-01',
            title: 'Number System Essentials, Divisibility & Factors',
            description:
              'Classification of numbers, divisibility rules, LCM & HCF, unit digit cyclicity, and remainder theorems.',
            videoId: '20JNw2XSfdM',
            notes:
              'For any two numbers A and B, Product (A × B) = HCF(A, B) × LCM(A, B). Divisibility by 9 holds when the sum of digits is divisible by 9.',
            order: 1,
          },
        ],
      },
      {
        id: 'mod-quant-02',
        title: 'Topic 02: Percentages & Applications',
        order: 2,
        lessons: [
          {
            id: 'les-quant-02-01',
            title: 'Percentages: Fraction-to-Percent Conversions & Shortcuts',
            description:
              'Rapid percentage calculations, successive percentage changes, and base-change formulas.',
            videoId: 'RWdNhJWwzSs',
            notes:
              'Net successive change of a% and b% is given by: (a + b + (a × b) / 100)%. Memorizing common fraction equivalents speeds up calculations.',
            order: 1,
          },
          {
            id: 'les-quant-02-02',
            title: 'Word Problems & Placement Questions on Percentages',
            description:
              'Solving exam-level problems on population growth, price-consumption trade-offs, and election vote shares.',
            videoId: '_TdyTKpNY8g',
            notes:
              'If price increases by R%, consumption must decrease by [R / (100 + R)] × 100% to keep expenditure constant.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-quant-03',
        title: 'Topic 03: Ratio, Proportion & Mixtures',
        order: 3,
        lessons: [
          {
            id: 'les-quant-03-01',
            title: 'Ratio and Proportion Fundamentals & Shortcut Tricks',
            description:
              'Combining ratios (A:B and B:C), fourth/mean proportionals, componendo-dividendo, and partnership shares.',
            videoId: 'jfoJBivWlnQ',
            notes:
              'If A:B = m:n and B:C = p:q, then A:B:C = (m·p) : (n·p) : (n·q).',
            order: 1,
          },
        ],
      },
      {
        id: 'mod-quant-04',
        title: 'Topic 04: Time and Work',
        order: 4,
        lessons: [
          {
            id: 'les-quant-04-01',
            title: 'Time, Work & Efficiency Method (LCM Approach)',
            description:
              'Using total work as the LCM of days, individual efficiencies, alternate-day work, and pipes & cisterns.',
            videoId: 'KE7tQf9spPg',
            notes:
              'Total Work = Efficiency × Time. Assuming Total Work = LCM(days) eliminates fractions and makes multi-worker problems fast to solve.',
            order: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'course-genai',
    title: 'Introduction to Generative AI',
    description:
      'Topic-wise exploration of Large Language Models (LLMs), transformer fundamentals, prompt engineering patterns, and AI developer workflows.',
    order: 4,
    modules: [
      {
        id: 'mod-genai-01',
        title: 'Topic 01: Generative AI & LLM Foundations',
        order: 1,
        lessons: [
          {
            id: 'les-genai-01-01',
            title: 'What is Generative AI? Models, Tokens & Transformers',
            description:
              'Understanding discriminative vs generative models, tokenization, embeddings, and next-token prediction.',
            videoId: 'NRmAXDWJVnU',
            notes:
              'Large Language Models predict the probability distribution of the next token given the preceding context window.',
            order: 1,
          },
          {
            id: 'les-genai-01-02',
            title: 'Generative AI Foundations Full Lecture',
            description:
              'Deep dive into foundation models, fine-tuning vs Retrieval-Augmented Generation (RAG), and evaluation.',
            videoId: 'd4yCWBGFCEs',
            notes:
              'Use RAG when your application needs grounded, up-to-date facts from external documents without retraining model weights.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-genai-02',
        title: 'Topic 02: Prompt Engineering',
        order: 2,
        lessons: [
          {
            id: 'les-genai-02-01',
            title: 'Prompt Engineering Masterclass: Zero-Shot, Few-Shot & CoT',
            description:
              'Designing clear system instructions, few-shot exemplars, Chain-of-Thought reasoning, and structured output formats.',
            videoId: '_ZvnD73m40o',
            notes:
              'Effective prompts specify Role, Task, Context, Constraints, and Output Format clearly.',
            order: 1,
          },
          {
            id: 'les-genai-02-02',
            title: 'Google Prompt Design Principles & Best Practices',
            description:
              'Iterative prompt refinement, temperature/top-p sampling controls, and mitigating hallucinations.',
            videoId: 'p09yRj47kNM',
            notes:
              'Lower temperature values (e.g., 0.0–0.2) produce more deterministic, factual responses suitable for coding and data extraction.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-genai-03',
        title: 'Topic 03: Working with AI Tools & Workflows',
        order: 3,
        lessons: [
          {
            id: 'les-genai-03-01',
            title: 'Building AI Applications with LLMs & LangChain',
            description:
              'Connecting LLMs to external tools, prompt templates, chains, memory, and document retrieval pipelines.',
            videoId: 't2bSApmPzU4',
            notes:
              'Break complex AI workflows into composable steps: input validation, context retrieval, LLM generation, and structured output parsing.',
            order: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'course-english',
    title: 'Communicative English Foundation',
    description:
      'Build workplace communication confidence across three core topics: interpersonal communication, spoken fluency & grammar, and presentation mastery.',
    order: 5,
    modules: [
      {
        id: 'mod-eng-01',
        title: 'Topic 01: Communication Basics',
        order: 1,
        lessons: [
          {
            id: 'les-eng-01-01',
            title: 'Introduction to Effective Communication & Active Listening',
            description:
              'Verbal vs non-verbal cues, barriers to communication, active listening, and workplace clarity.',
            videoId: 'u16EPwFmdis',
            notes:
              'Effective communication is measured by the clarity understood by the listener, not merely the words spoken.',
            order: 1,
          },
          {
            id: 'les-eng-01-02',
            title: 'Think Fast, Talk Smart: Structured Spontaneous Speaking',
            description:
              'Frameworks (What – So What – Now What) for answering questions clearly under pressure in interviews and meetings.',
            videoId: 'HAnw168huqA',
            notes:
              'Use the "What? So What? Now What?" structure to organize impromptu thoughts into concise, persuasive responses.',
            order: 2,
          },
        ],
      },
      {
        id: 'mod-eng-02',
        title: 'Topic 02: Grammar Essentials & Spoken Fluency',
        order: 2,
        lessons: [
          {
            id: 'les-eng-02-01',
            title: 'Developing English Speaking Fluency & Sentence Precision',
            description:
              'Practical techniques for thinking in English, tense consistency, subject-verb agreement, and vocabulary expansion.',
            videoId: 'CAU2zx2Ri_M',
            notes:
              'Practice shadowing and summarizing technical concepts aloud daily to build natural sentence rhythm and accuracy.',
            order: 1,
          },
        ],
      },
      {
        id: 'mod-eng-03',
        title: 'Topic 03: Presentation Skills & Public Speaking',
        order: 3,
        lessons: [
          {
            id: 'les-eng-03-01',
            title: 'Delivering Confident Presentations in English',
            description:
              'Structuring opening hooks, signposting transitions, explaining visual slides, and handling Q&A sessions.',
            videoId: 'Q074YSGwRTM',
            notes:
              'Use clear signposting phrases ("First, let’s examine...", "Moving to our second point...", "To summarize...") to guide your audience.',
            order: 1,
          },
          {
            id: 'les-eng-03-02',
            title: 'Presentation Skills: Voice Modulation & Body Language',
            description:
              'Pacing, vocal emphasis, eye contact, posture, and overcoming stage fright during technical demos.',
            videoId: 'IY5KUKe1rKs',
            notes:
              'Intentional pauses before and after key takeaways give your audience time to absorb important information.',
            order: 2,
          },
        ],
      },
    ],
  },
];

export const INITIAL_EVENTS: PortalEvent[] = [
  {
    id: 'event-01',
    title: 'Python Practice Session & Code Review',
    description:
      'Join the collaborative session to review Python loops, list comprehensions, and problem walkthroughs.',
    date: '2026-10-28T10:00:00Z',
    tag: 'Learning Reminder',
    published: true,
  },
  {
    id: 'event-02',
    title: 'Web Dev Workshop: Responsive Design',
    description:
      'Deep dive into mobile-first layout techniques and modern CSS Flexbox and Grid systems.',
    date: '2026-11-05T14:00:00Z',
    tag: 'Workshop',
    published: true,
  },
  {
    id: 'event-03',
    title: 'Algorithm Problem Solving Sprint',
    description:
      'Timed practice solving algorithmic challenges using Python data structures.',
    date: '2026-10-20T09:00:00Z',
    tag: 'Completed',
    published: true,
  },
];

// Flat Course List
export const DEFAULT_COURSES: Course[] = INITIAL_COURSES.map((c) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  order: c.order,
  published: true,
}));

// Default Modules mapped by courseId
export const DEFAULT_MODULES: Record<string, Module[]> = {};
// Default Lessons mapped by courseId
export const DEFAULT_LESSONS: Record<string, Lesson[]> = {};

INITIAL_COURSES.forEach((course) => {
  DEFAULT_MODULES[course.id] = course.modules.map((m) => ({
    id: m.id,
    courseId: course.id,
    title: m.title,
    order: m.order,
    published: true,
  }));

  const allLessonsForCourse: Lesson[] = [];
  course.modules.forEach((m) => {
    m.lessons.forEach((l) => {
      allLessonsForCourse.push({
        id: l.id,
        courseId: course.id,
        moduleId: m.id,
        title: l.title,
        description: l.description,
        videoProvider: 'youtube',
        videoId: l.videoId,
        notes: l.notes,
        resourceLinks: l.resourceLinks || [],
        order: l.order,
        published: true,
      });
    });
  });
  DEFAULT_LESSONS[course.id] = allLessonsForCourse;
});

export function getDefaultModulesByCourse(courseId: string): Module[] {
  return DEFAULT_MODULES[courseId] || [];
}

export function getDefaultLessonsByCourse(courseId: string): Lesson[] {
  return DEFAULT_LESSONS[courseId] || [];
}

export function getDefaultCourseById(courseId: string): Course | null {
  return DEFAULT_COURSES.find((c) => c.id === courseId) || null;
}

export function getDefaultLessonById(lessonId: string): Lesson | null {
  for (const courseId of Object.keys(DEFAULT_LESSONS)) {
    const found = DEFAULT_LESSONS[courseId].find((l) => l.id === lessonId);
    if (found) return found;
  }
  return null;
}

export function getDefaultEvents(): PortalEvent[] {
  return INITIAL_EVENTS;
}
