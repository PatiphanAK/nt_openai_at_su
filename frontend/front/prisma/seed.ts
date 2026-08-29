import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seeds the demo content: 9 students, 8 courses with required topics, and
 * 16 summaries across all six styles, plus organic like rows so the style
 * recommender has real signal on first run.
 *
 * Idempotent: wipes and recreates only @skillschool.demo users and the
 * content tables — real registered users are never touched.
 *
 * Run: bun prisma/seed.ts
 */

const db = new PrismaClient();
const DEMO_EMAIL_DOMAIN = "skillschool.demo";
const DEMO_PASSWORD = "password123";

const demoUsers = [
  {
    handle: "pat",
    name: "Pat",
    major: "Computer Science",
    year: 3,
    color: "from-indigo-500 to-violet-500",
    bio: "CS junior. I turn long lectures into compact bullet notes I can revise on the bus.",
  },
  {
    handle: "mia",
    name: "Mia Tanaka",
    major: "Computer Science",
    year: 2,
    color: "from-rose-400 to-pink-500",
    bio: "If it can't be drawn as a diagram, I don't understand it yet.",
  },
  {
    handle: "leo",
    name: "Leo Fernandez",
    major: "Mathematics",
    year: 4,
    color: "from-sky-400 to-blue-500",
    bio: "Math major. I write summaries I wish the textbook had.",
  },
  {
    handle: "aisha",
    name: "Aisha Rahman",
    major: "Economics",
    year: 3,
    color: "from-amber-400 to-orange-500",
    bio: "Econ with a CS minor. Real-world examples or it didn't happen.",
  },
  {
    handle: "noah",
    name: "Noah Kim",
    major: "Chemistry",
    year: 2,
    color: "from-emerald-400 to-teal-500",
    bio: "Flashcards are a lifestyle. Ask me about spaced repetition.",
  },
  {
    handle: "sara",
    name: "Sara Idris",
    major: "Psychology",
    year: 1,
    color: "from-violet-400 to-purple-500",
    bio: "Fresher who writes study guides like blog posts — because reading them should feel nice.",
  },
  {
    handle: "tom",
    name: "Tomas Novak",
    major: "Physics",
    year: 3,
    color: "from-cyan-400 to-sky-500",
    bio: "Problem recipes over theory dumps. Give me the 5 steps and go.",
  },
  {
    handle: "ines",
    name: "Inés Duarte",
    major: "English Literature",
    year: 4,
    color: "from-fuchsia-400 to-rose-500",
    bio: "I re-outline every essay structure until it fits on one page.",
  },
  {
    handle: "ken",
    name: "Ken Sato",
    major: "Business",
    year: 2,
    color: "from-lime-400 to-green-500",
    bio: "Self-quizzing beats re-reading. I make Q&A sheets for everything.",
  },
];

const courses = [
  {
    id: "CS201",
    code: "CS201",
    title: "Data Structures & Algorithms",
    school: "School of Computing",
    instructor: "Dr. Elena Wu",
    term: "Semester 1, 2026",
    description:
      "Core data structures (lists, trees, graphs, hash tables) and the algorithms that use them, with a focus on complexity analysis. The final exam requires implementing and analyzing each structure from scratch.",
    requiredTopics: [
      "Arrays & Big-O",
      "Linked Lists",
      "Stacks & Queues",
      "Trees & BSTs",
      "Graph Traversal",
      "Sorting Algorithms",
      "Hash Tables",
    ],
  },
  {
    id: "MA105",
    code: "MA105",
    title: "Calculus II",
    school: "School of Science",
    instructor: "Prof. Marcus Hale",
    term: "Semester 1, 2026",
    description:
      "Techniques of integration, applications of the integral, and sequences and series. The midterm requires choosing and justifying an integration technique per problem.",
    requiredTopics: [
      "Integration Techniques",
      "Applications of Integrals",
      "Sequences & Series",
      "Parametric Equations",
      "Polar Coordinates",
    ],
  },
  {
    id: "EC210",
    code: "EC210",
    title: "Microeconomics",
    school: "School of Business",
    instructor: "Dr. Amina Yusuf",
    term: "Semester 1, 2026",
    description:
      "How consumers and firms make decisions and how markets coordinate them. Assessment includes diagram-based short answers, so summaries with graphs are especially useful.",
    requiredTopics: [
      "Supply & Demand",
      "Elasticity",
      "Consumer Choice",
      "Production & Costs",
      "Market Structures",
      "Externalities",
    ],
  },
  {
    id: "CH230",
    code: "CH230",
    title: "Organic Chemistry I",
    school: "School of Science",
    instructor: "Dr. Sofia Petrova",
    term: "Semester 1, 2026",
    description:
      "Structure, nomenclature and reactivity of organic compounds. The department requires memorized functional-group properties and mechanism arrow-pushing for the quiz series.",
    requiredTopics: [
      "Nomenclature",
      "Isomerism",
      "Reaction Mechanisms",
      "Stereochemistry",
      "Functional Groups",
      "Spectroscopy Basics",
    ],
  },
  {
    id: "EN120",
    code: "EN120",
    title: "Academic English",
    school: "School of Humanities",
    instructor: "Ms. Laura Chen",
    term: "Semester 1, 2026",
    description:
      "Academic writing from thesis to citation. The portfolio requirement asks for one argumentative essay per unit that passes department plagiarism screening.",
    requiredTopics: [
      "Essay Structure",
      "Thesis Statements",
      "Citation Styles",
      "Paraphrasing",
      "Argumentation",
      "Peer Review",
    ],
  },
  {
    id: "CS310",
    code: "CS310",
    title: "Database Systems",
    school: "School of Computing",
    instructor: "Dr. Ravi Menon",
    term: "Semester 1, 2026",
    description:
      "Relational modeling, SQL and transaction management. The group project requires a normalized schema (3NF minimum) with a written justification.",
    requiredTopics: [
      "Relational Model",
      "SQL Queries",
      "ER Modeling",
      "Normalization",
      "Indexing",
      "Transactions & ACID",
    ],
  },
  {
    id: "PS150",
    code: "PS150",
    title: "Introductory Psychology",
    school: "School of Social Sciences",
    instructor: "Dr. Naomi Brooks",
    term: "Semester 1, 2026",
    description:
      "A survey of the major areas of psychology. Exams reward connecting classic studies to modern findings, so narrative summaries work well here.",
    requiredTopics: [
      "Research Methods",
      "Biopsychology",
      "Memory",
      "Learning & Conditioning",
      "Development",
      "Social Psychology",
    ],
  },
  {
    id: "PH110",
    code: "PH110",
    title: "Physics: Mechanics",
    school: "School of Science",
    instructor: "Dr. Omar Farouk",
    term: "Semester 1, 2026",
    description:
      "Newtonian mechanics up to oscillations. The weekly problem sets are graded, and past students say worked problem recipes are the highest-value summaries.",
    requiredTopics: [
      "Kinematics",
      "Newton's Laws",
      "Work & Energy",
      "Momentum",
      "Rotational Motion",
      "Oscillations",
    ],
  },
];

type SeedSummary = {
  slug: string;
  title: string;
  course: string;
  author: string;
  createdAt: string;
  format: string;
  depth: string;
  tone: string;
  hasExamples: boolean;
  hasFormulas: boolean;
  hasDiagrams: boolean;
  topicsCovered: string[];
  baseLikes: number;
  baseSaves: number;
  sections: { heading: string; body: string }[];
};

const summaries: SeedSummary[] = [
  {
    slug: "big-o-in-plain-language",
    title: "Big-O Notation in Plain Language",
    course: "CS201",
    author: "pat",
    createdAt: "2026-08-24",
    format: "bullets",
    depth: "quick-review",
    tone: "concise",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: false,
    topicsCovered: ["Arrays & Big-O"],
    baseLikes: 128,
    baseSaves: 61,
    sections: [
      {
        heading: "What Big-O actually measures",
        body: `- How the runtime (or memory) grows when the input n grows
- It ignores constants and hardware — only the growth curve matters
- We always describe the worst case unless stated otherwise
> Big-O is about the shape of the curve, not the speed of your laptop.`,
      },
      {
        heading: "The complexities you must recognize",
        body: `- O(1) — array index lookup, hash insert
- O(log n) — binary search, balanced BST search
- O(n) — one linear scan
- O(n log n) — merge sort, heap sort
- O(n²) — nested loops, bubble sort
- O(2ⁿ) — naive subset enumeration`,
      },
      {
        heading: "Rules of thumb for exams",
        body: `- Drop constants: O(3n) → O(n)
- Drop smaller terms: O(n² + n) → O(n²)
- Different inputs get different variables: O(a + b), not O(n²)
- Nested loops over the same n usually mean O(n²)
> If a loop halves the input each time, think log n.`,
      },
    ],
  },
  {
    slug: "binary-search-trees-visualized",
    title: "Binary Search Trees, Visualized",
    course: "CS201",
    author: "mia",
    createdAt: "2026-08-18",
    format: "mindmap",
    depth: "standard",
    tone: "friendly",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: true,
    topicsCovered: ["Trees & BSTs"],
    baseLikes: 96,
    baseSaves: 54,
    sections: [
      {
        heading: "The BST map",
        body: `- BST rule
  - left child < parent
  - right child > parent
- Core operations
  - search — walk left or right, O(h)
  - insert — search until you fall off, attach there
  - delete — three cases
    - leaf → just remove
    - one child → splice child up
    - two children → replace with in-order successor
- The height problem
  - sorted inserts → degenerate linked list, O(n)
  - fix → AVL / red-black self-balancing
> Sketch each case by hand once — the operations stick after that.`,
      },
    ],
  },
  {
    slug: "bfs-vs-dfs-when-to-use-which",
    title: "BFS vs DFS: When to Use Which",
    course: "CS201",
    author: "mia",
    createdAt: "2026-08-10",
    format: "outline",
    depth: "deep-dive",
    tone: "academic",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: true,
    topicsCovered: ["Graph Traversal"],
    baseLikes: 74,
    baseSaves: 39,
    sections: [
      {
        heading: "I. Traversal order",
        body: `- A. Breadth-first search (BFS)
  - 1. Explores level by level using a queue (FIFO)
  - 2. Visits all vertices at distance k before distance k + 1
- B. Depth-first search (DFS)
  - 1. Follows one path as deep as possible using a stack (LIFO) or recursion
  - 2. Backtracks when it hits a dead end`,
      },
      {
        heading: "II. Complexity",
        body: `- A. Both visit every vertex and edge once: O(V + E) with adjacency lists
- B. Space differs
  - 1. BFS holds a whole frontier: O(V) in the worst case
  - 2. DFS holds one path: O(h), where h is the maximum depth`,
      },
      {
        heading: "III. Choosing between them",
        body: `- A. Use BFS when
  - 1. You need the shortest path in an unweighted graph
  - 2. The answer is "closest" anything (nearest exit, fewest moves)
- B. Use DFS when
  - 1. You need to detect cycles or topological order
  - 2. The graph is deep and memory is tight
> Exam tip: "shortest path" without weights in the question is a BFS signal.`,
      },
    ],
  },
  {
    slug: "sorting-algorithms-flashcards",
    title: "Sorting Algorithms: Flashcards",
    course: "CS201",
    author: "noah",
    createdAt: "2026-08-05",
    format: "flashcards",
    depth: "quick-review",
    tone: "concise",
    hasExamples: false,
    hasFormulas: true,
    hasDiagrams: false,
    topicsCovered: ["Sorting Algorithms"],
    baseLikes: 67,
    baseSaves: 45,
    sections: [
      {
        heading: "Deck 1 — Complexity",
        body: `Q: Best-case complexity of bubble sort?
A: O(n) — one pass with no swaps on an already-sorted array.

Q: Worst-case complexity of quicksort?
A: O(n²) — when the pivot is always the smallest or largest element.

Q: Which O(n log n) sorts are stable?
A: Merge sort and heap sort is NOT stable; merge sort is. Quicksort is not stable by default.`,
      },
      {
        heading: "Deck 2 — Identification",
        body: `Q: Which sort builds a max-heap first?
A: Heap sort.

Q: Which sort repeatedly takes the next smallest element?
A: Selection sort.

Q: Which sort is best for nearly-sorted data?
A: Insertion sort — close to O(n) when few elements are out of place.`,
      },
    ],
  },
  {
    slug: "integration-techniques-cheat-sheet",
    title: "Integration Techniques Cheat Sheet",
    course: "MA105",
    author: "leo",
    createdAt: "2026-08-22",
    format: "outline",
    depth: "quick-review",
    tone: "concise",
    hasExamples: true,
    hasFormulas: true,
    hasDiagrams: false,
    topicsCovered: ["Integration Techniques", "Applications of Integrals"],
    baseLikes: 153,
    baseSaves: 97,
    sections: [
      {
        heading: "I. The decision ladder (try in this order)",
        body: `- A. Simplify / rewrite first ( identities, expand, split fractions )
- B. u-substitution
  - 1. Look for a function and its derivative sitting in the integrand
- C. Integration by parts
  - 1. Product of unlike functions → ∫u dv = uv − ∫v du
  - 2. Choose u by LIATE: Log, Inverse trig, Algebraic, Trig, Exponential
- D. Trig identities / trig substitution
  - 1. √(a² − x²) → x = a·sin θ
  - 2. √(a² + x²) → x = a·tan θ
- E. Partial fractions
  - 1. Rational function with a factorable denominator`,
      },
      {
        heading: "II. One worked example per rung",
        body: `- A. u-sub: ∫ x·e^(x²) dx → u = x², = ½e^(x²) + C
- B. by parts: ∫ x·ln x dx → u = ln x, dv = x dx → (x²/2)ln x − x²/4 + C
- C. trig sub: ∫ dx/√(9−x²) → arcsin(x/3) + C
> The midterm wants the technique name written next to each solution.`,
      },
      {
        heading: "III. Applications the exam pulls from",
        body: `- A. Area between curves: ∫ [top − bottom] dx
- B. Volume by disks: π ∫ R(x)² dx
- C. Average value: (1/(b−a)) ∫ f(x) dx`,
      },
    ],
  },
  {
    slug: "convergence-tests-step-by-step",
    title: "Convergence Tests, Step by Step",
    course: "MA105",
    author: "leo",
    createdAt: "2026-08-14",
    format: "narrative",
    depth: "deep-dive",
    tone: "academic",
    hasExamples: true,
    hasFormulas: true,
    hasDiagrams: false,
    topicsCovered: ["Sequences & Series"],
    baseLikes: 61,
    baseSaves: 33,
    sections: [
      {
        heading: "Why the order of testing matters",
        body: `Most points are lost on series questions not because a test was applied badly, but because the wrong test was tried first. Think of the tests as a funnel: always check the two cheapest conditions before reaching for the heavy machinery. First ask whether the terms fail to approach zero — if so, the Test for Divergence ends the problem immediately. No test can rescue a series whose terms do not vanish.`,
      },
      {
        heading: "The funnel, in prose",
        body: `If the terms do go to zero, compare the series to a p-series or a geometric series in your head. When the series looks like a polynomial ratio, the Limit Comparison Test is the honest tool: divide by the dominant term and see what number falls out. A positive finite number means both series share the same fate. When exponents or factorials appear, the Ratio Test usually gives a clean limit; when the series alternates, the Alternating Series Test asks only two humble questions — do the terms shrink, and do they shrink monotonically?`,
      },
      {
        heading: "What to write for full marks",
        body: `State the test by name, verify each of its hypotheses explicitly, then conclude. Writing "converges by comparison" without showing the inequality or the limit comparison value is what the grader circles in red. One sentence of hypothesis-checking is worth more than a page of algebra.`,
      },
    ],
  },
  {
    slug: "supply-and-demand-from-zero",
    title: "Supply & Demand from Zero",
    course: "EC210",
    author: "aisha",
    createdAt: "2026-08-25",
    format: "narrative",
    depth: "standard",
    tone: "friendly",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: true,
    topicsCovered: ["Supply & Demand", "Elasticity"],
    baseLikes: 142,
    baseSaves: 80,
    sections: [
      {
        heading: "The one graph everything sits on",
        body: `Every market question in this course is answered on the same picture: price on the vertical axis, quantity on the horizontal, a downward-sloping demand curve and an upward-sloping supply curve crossing at equilibrium. Demand slopes down because as price rises, buyers walk away. Supply slopes up because as price rises, sellers find it worthwhile to bring more to market. Where they cross, the market clears — quantity supplied equals quantity demanded.`,
      },
      {
        heading: "Shifts versus movements",
        body: `Here is the distinction the quizzes love. A change in price moves you along a curve; a change in anything else shifts the whole curve. Income rises and demand shifts right. A frost kills the coffee harvest and supply shifts left. When both curves move at once, reason it out: supply left + demand right means price clearly rises, but the effect on quantity depends on which shift is bigger — say exactly that in your answer.`,
      },
      {
        heading: "Elasticity in one breath",
        body: `Elasticity asks how much quantity responds when price moves. Necessities and goods without substitutes are inelastic — insulin barely budges. Luxuries and goods with many substitutes are elastic — one brand of cola loses buyers to every other when it raises its price. The revenue rule follows: if demand is inelastic, a price increase raises total revenue, because buyers stay.`,
      },
    ],
  },
  {
    slug: "four-market-structures-compared",
    title: "Four Market Structures Compared",
    course: "EC210",
    author: "ken",
    createdAt: "2026-08-16",
    format: "qa",
    depth: "quick-review",
    tone: "concise",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: false,
    topicsCovered: ["Market Structures"],
    baseLikes: 88,
    baseSaves: 41,
    sections: [
      {
        heading: "Self-quiz",
        body: `Q: How many sellers are in perfect competition?
A: Very many — each is a price taker with zero market power.

Q: What defines a monopoly?
A: A single seller with no close substitutes, blocked by barriers to entry.

Q: What is the key feature of monopolistic competition?
A: Many sellers with differentiated products — branding gives slight pricing power.

Q: What is an oligopoly?
A: A few large sellers whose decisions are interdependent; game theory lives here.`,
      },
      {
        heading: "Long-run profit",
        body: `Q: Which structures earn zero economic profit in the long run?
A: Perfect competition and monopolistic competition — free entry erodes profits.

Q: Which can sustain long-run profit?
A: Monopoly and oligopoly — barriers keep entrants out.`,
      },
    ],
  },
  {
    slug: "functional-groups-flashcards",
    title: "Functional Groups: Flashcards",
    course: "CH230",
    author: "noah",
    createdAt: "2026-08-20",
    format: "flashcards",
    depth: "quick-review",
    tone: "concise",
    hasExamples: true,
    hasFormulas: true,
    hasDiagrams: false,
    topicsCovered: ["Functional Groups", "Nomenclature"],
    baseLikes: 110,
    baseSaves: 72,
    sections: [
      {
        heading: "Deck 1 — Identify the group",
        body: `Q: R–OH is what functional group, and what suffix in naming?
A: An alcohol; the suffix is -ol (ethanol, propan-2-ol).

Q: R–COOH?
A: A carboxylic acid; suffix -oic acid — always carbon 1 of the chain.

Q: R–CHO?
A: An aldehyde; suffix -al, and the C=O sits at the end of the chain.

Q: R–CO–R′?
A: A ketone; suffix -one, numbered like any substituent (propan-2-one).`,
      },
      {
        heading: "Deck 2 — Properties",
        body: `Q: Which functional group makes a molecule water-soluble at low carbon counts?
A: Any group that hydrogen-bonds: –OH, –NH₂, –COOH.

Q: Ranking acidity: alcohol vs phenol vs carboxylic acid?
A: Carboxylic acid > phenol > alcohol.

Q: What suffix marks an amine?
A: -amine (ethanamine); primary, secondary or tertiary by how many R groups sit on N.`,
      },
    ],
  },
  {
    slug: "stereochemistry-without-tears",
    title: "Stereochemistry Without Tears",
    course: "CH230",
    author: "noah",
    createdAt: "2026-08-08",
    format: "bullets",
    depth: "standard",
    tone: "friendly",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: true,
    topicsCovered: ["Stereochemistry", "Isomerism"],
    baseLikes: 57,
    baseSaves: 29,
    sections: [
      {
        heading: "The isomer family tree",
        body: `- Isomers = same formula, different arrangement
  - Constitutional — different connectivity
  - Stereoisomers — same connectivity, different 3D arrangement
    - Enantiomers — non-superimposable mirror images
    - Diastereomers — stereoisomers that are NOT mirror images
- Geometric (cis/trans) is a diastereomer case, not a third family
> Draw the family tree once from memory — it's a guaranteed quiz item.`,
      },
      {
        heading: "R/S in four steps",
        body: `- 1. Find the stereocenter (carbon with 4 different groups)
- 2. Rank the four groups by CIP priority (higher atomic number wins)
- 3. Point the lowest-priority group away from you
- 4. 1→2→3 clockwise = R, counter-clockwise = S
> If two groups look identical, look one bond further — the tie-breaker is always further out.`,
      },
    ],
  },
  {
    slug: "essay-structure-five-move-skeleton",
    title: "Essay Structure: The 5-Move Skeleton",
    course: "EN120",
    author: "ines",
    createdAt: "2026-08-26",
    format: "outline",
    depth: "standard",
    tone: "friendly",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: false,
    topicsCovered: ["Essay Structure", "Thesis Statements", "Argumentation"],
    baseLikes: 165,
    baseSaves: 103,
    sections: [
      {
        heading: "I. The skeleton",
        body: `- A. Introduction
  - 1. Hook — one sentence of context, no dictionary quotes
  - 2. Thesis — your claim + the reason it holds (the "because" clause)
  - 3. Roadmap — one sentence naming your moves
- B. Body paragraphs ×3
  - 1. Topic sentence — a mini-thesis for the paragraph
  - 2. Evidence — quote or data with citation
  - 3. Analysis — at least two sentences explaining HOW the evidence proves the topic sentence
- C. Conclusion
  - 1. Restate the thesis in fresh words, then widen the lens`,
      },
      {
        heading: "II. The ratio rule",
        body: `- A. Evidence never explains itself
  - 1. If analysis is shorter than the quote, cut the quote
- B. One paragraph = one move
  - 1. If a topic sentence contains "and also", it is probably two paragraphs`,
      },
      {
        heading: "III. Thesis quality checklist",
        body: `- A. It is an arguable claim, not a fact
- B. It names the mechanism ("because ...")
- C. A reasonable person could disagree with it
> Run your draft against this list before submitting the portfolio piece.`,
      },
    ],
  },
  {
    slug: "paraphrasing-that-passes-plagiarism-checks",
    title: "Paraphrasing That Passes Plagiarism Checks",
    course: "EN120",
    author: "ines",
    createdAt: "2026-08-11",
    format: "qa",
    depth: "standard",
    tone: "academic",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: false,
    topicsCovered: ["Paraphrasing", "Citation Styles"],
    baseLikes: 49,
    baseSaves: 26,
    sections: [
      {
        heading: "Common questions",
        body: `Q: Is paraphrasing just swapping synonyms?
A: No — that is patchwriting and it is flagged. You must rebuild the sentence from your own syntax, then cite.

Q: Do I cite a paraphrase?
A: Yes. Citation is about ideas, not quotation marks.

Q: What is the reliable paraphrase procedure?
A: Read the passage, close the source, write the idea from memory, reopen and check for accuracy, then add the citation.

Q: When must I quote instead?
A: When the exact wording matters — a definition, a distinctive phrase, or language you are analyzing.`,
      },
    ],
  },
  {
    slug: "sql-joins-explained-with-coffee-orders",
    title: "SQL Joins Explained with Coffee Orders",
    course: "CS310",
    author: "pat",
    createdAt: "2026-08-23",
    format: "bullets",
    depth: "standard",
    tone: "friendly",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: true,
    topicsCovered: ["SQL Queries", "Relational Model"],
    baseLikes: 121,
    baseSaves: 66,
    sections: [
      {
        heading: "Setup — two tiny tables",
        body: `- customers(id, name) — 1 Ada, 2 Ben, 3 Cleo
- orders(id, customer_id, drink) — (10, 1, latte), (11, 1, espresso), (12, 9, mocha)
> Every join type is just a different answer to "which rows survive?"`,
      },
      {
        heading: "The four joins, as coffee orders",
        body: `- INNER JOIN — only matched pairs
  - Ada's two orders appear; Ben and Cleo vanish (no orders)
- LEFT JOIN — every customer, matched or not
  - Ben and Cleo appear with NULL drink columns
- RIGHT JOIN — every order, matched or not
  - order 12 (customer 9) appears with NULL name
- FULL OUTER JOIN — everything from both sides
> When the exam says "including customers with no orders", that phrase = LEFT JOIN.`,
      },
      {
        heading: "Traps that cost marks",
        body: `- Filtering the right table in WHERE silently turns a LEFT JOIN back into an INNER JOIN — filter in ON instead
- COUNT(*) after a LEFT JOIN counts NULL rows too; count a column to exclude them
- Duplicate rows from one-to-many joins break SUM() — aggregate after joining, not before`,
      },
    ],
  },
  {
    slug: "normalization-1nf-to-3nf-walkthrough",
    title: "Normalization: 1NF → 3NF Walkthrough",
    course: "CS310",
    author: "mia",
    createdAt: "2026-08-13",
    format: "mindmap",
    depth: "deep-dive",
    tone: "academic",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: true,
    topicsCovered: ["Normalization", "ER Modeling"],
    baseLikes: 83,
    baseSaves: 47,
    sections: [
      {
        heading: "Normal forms map",
        body: `- 1NF — atomic values
  - no repeating groups or comma-lists in a cell
  - violation: (student, courses = "CS201, MA105") → split to rows
- 2NF — 1NF + no partial dependency
  - every non-key column depends on the WHOLE composite key
  - only matters when the key is composite
- 3NF — 2NF + no transitive dependency
  - non-key column must not depend on another non-key column
  - violation: (course_id → instructor → office) → move office to an instructor table
- BCNF — every determinant is a candidate key (beyond the project scope)
> The group project grades the JUSTIFICATION: name the dependency you removed at each step.`,
      },
    ],
  },
  {
    slug: "how-memory-actually-works",
    title: "How Memory Actually Works",
    course: "PS150",
    author: "sara",
    createdAt: "2026-08-27",
    format: "narrative",
    depth: "deep-dive",
    tone: "friendly",
    hasExamples: true,
    hasFormulas: false,
    hasDiagrams: true,
    topicsCovered: ["Memory", "Learning & Conditioning"],
    baseLikes: 134,
    baseSaves: 76,
    sections: [
      {
        heading: "Three stores, one story",
        body: `Memory is not a recording; it is three workstations in a relay. Sensory memory holds everything you perceive for under two seconds — the reason you can "still hear" a sentence after someone finishes saying it. Whatever you attend to moves into short-term (working) memory, which can juggle roughly four items for about twenty seconds. Rehearse or connect those items and they encode into long-term memory, where capacity is effectively unlimited but retrieval is the gamble.`,
      },
      {
        heading: "Why cramming fails — in exam terms",
        body: `The classic evidence is the serial position effect: in a free-recall test, people remember the first items (primacy — they got encoded) and the last items (recency — still sitting in short-term memory) while the middle collapses. Cramming packs everything into the fragile middle of your timeline. Spaced repetition works because each spaced review re-encodes the material as a new primacy event, strengthening the long-term copy instead of refreshing the fragile short-term one.`,
      },
      {
        heading: "Retrieval is the skill being tested",
        body: `The forgetting-curve experiments showed most forgetting happens immediately after learning unless something intervenes. The intervention that works is retrieval practice — testing yourself, which strengthens the pathway you will need in the exam hall. This is also why recognition (multiple choice) feels easier than recall (essay): the cue is provided. Study with the cues removed, because that is the format your exam grades.`,
      },
    ],
  },
  {
    slug: "momentum-and-collisions-problem-recipe",
    title: "Momentum & Collisions: Problem Recipe",
    course: "PH110",
    author: "tom",
    createdAt: "2026-08-19",
    format: "qa",
    depth: "standard",
    tone: "concise",
    hasExamples: true,
    hasFormulas: true,
    hasDiagrams: false,
    topicsCovered: ["Momentum", "Newton's Laws"],
    baseLikes: 92,
    baseSaves: 44,
    sections: [
      {
        heading: "The recipe (works for every collision problem)",
        body: `Q: Where do I start on any collision question?
A: Write p = mv for each body BEFORE the collision, choosing a positive direction and stating it.

Q: What equation do I always write?
A: Conservation of momentum: m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′ (vector sum, signs carry the directions).

Q: How do elastic and inelastic cases differ?
A: Inelastic — objects stick together, so the right side becomes (m₁+m₂)v′. Elastic — additionally conserve kinetic energy, or use the relative-velocity shortcut: v₁ − v₂ = −(v₁′ − v₂′).

Q: What about 2D collisions?
A: Conserve momentum component by component — one equation for x, one for y.`,
      },
      {
        heading: "Worked micro-example",
        body: `Q: 2 kg at 3 m/s hits a stationary 1 kg and they stick. Final velocity?
A: p_before = 2×3 = 6 kg·m/s → v′ = 6 / (2+1) = 2 m/s in the original direction.

> Signs are the whole game: define positive once, and never "fix" a negative velocity — it means the object reversed.`,
      },
    ],
  },
];

// Organic likes between demo students, aligned with each reader's style —
// this is what gives the recommender and "similar students" real signal.
const organicLikes: [reader: string, summary: string][] = [
  ["pat", "binary-search-trees-visualized"],
  ["pat", "stereochemistry-without-tears"],
  ["pat", "how-memory-actually-works"],
  ["mia", "normalization-1nf-to-3nf-walkthrough"],
  ["mia", "sorting-algorithms-flashcards"],
  ["mia", "functional-groups-flashcards"],
  ["leo", "how-memory-actually-works"],
  ["leo", "integration-techniques-cheat-sheet"],
  ["leo", "supply-and-demand-from-zero"],
  ["aisha", "big-o-in-plain-language"],
  ["aisha", "stereochemistry-without-tears"],
  ["aisha", "how-memory-actually-works"],
  ["noah", "bfs-vs-dfs-when-to-use-which"],
  ["noah", "integration-techniques-cheat-sheet"],
  ["sara", "convergence-tests-step-by-step"],
  ["sara", "stereochemistry-without-tears"],
  ["tom", "bfs-vs-dfs-when-to-use-which"],
  ["tom", "four-market-structures-compared"],
  ["tom", "paraphrasing-that-passes-plagiarism-checks"],
  ["ines", "how-memory-actually-works"],
  ["ines", "integration-techniques-cheat-sheet"],
  ["ken", "momentum-and-collisions-problem-recipe"],
  ["ken", "sorting-algorithms-flashcards"],
  ["ken", "functional-groups-flashcards"],
];

const DEMO_EMAILS = demoUsers.map((u) => `${u.handle}@${DEMO_EMAIL_DOMAIN}`);

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Wipe previous demo data (never touches real registered users). Likes and
  // saves go first since they reference the summaries being recreated.
  const oldDemoUsers = await db.user.findMany({
    where: { email: { in: DEMO_EMAILS } },
    select: { id: true },
  });
  const demoIds = oldDemoUsers.map((u) => u.id);

  await db.like.deleteMany({});
  await db.save.deleteMany({});
  await db.summary.deleteMany({});
  await db.course.deleteMany({});
  await db.user.deleteMany({ where: { id: { in: demoIds } } });

  // Users
  const userIdByHandle = new Map<string, string>();
  for (const u of demoUsers) {
    const row = await db.user.create({
      data: {
        id: crypto.randomUUID(),
        email: `${u.handle}@${DEMO_EMAIL_DOMAIN}`,
        name: u.name,
        password: passwordHash,
        handle: u.handle,
        major: u.major,
        year: u.year,
        bio: u.bio,
        color: u.color,
      },
    });
    userIdByHandle.set(u.handle, row.id);
  }

  // Courses
  for (const c of courses) {
    await db.course.create({ data: c });
  }

  // Summaries
  const summaryIdBySlug = new Map<string, string>();
  for (const s of summaries) {
    const row = await db.summary.create({
      data: {
        id: crypto.randomUUID(),
        slug: s.slug,
        title: s.title,
        course_id: s.course,
        author_id: userIdByHandle.get(s.author)!,
        created_at: new Date(`${s.createdAt}T12:00:00Z`),
        format: s.format,
        depth: s.depth,
        tone: s.tone,
        hasExamples: s.hasExamples,
        hasFormulas: s.hasFormulas,
        hasDiagrams: s.hasDiagrams,
        topicsCovered: s.topicsCovered,
        sections: s.sections,
        baseLikes: s.baseLikes,
        baseSaves: s.baseSaves,
      },
    });
    summaryIdBySlug.set(s.slug, row.id);
  }

  // Organic likes
  for (const [reader, summary] of organicLikes) {
    await db.like.create({
      data: {
        user_id: userIdByHandle.get(reader)!,
        summary_id: summaryIdBySlug.get(summary)!,
      },
    });
  }

  console.log(
    `Seeded: ${demoUsers.length} users, ${courses.length} courses, ${summaries.length} summaries, ${organicLikes.length} likes.`
  );
  console.log(`Demo login: any handle @${DEMO_EMAIL_DOMAIN} / ${DEMO_PASSWORD} (e.g. pat@${DEMO_EMAIL_DOMAIN})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
