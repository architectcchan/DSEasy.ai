
import { Subject, PastPaper, Level, TutorialStep } from './types';
import { Calculator, BookOpen, PenTool, Globe, Zap, Activity, TrendingUp, Microscope, Languages, FileText, Leaf, Landmark, Monitor, PieChart } from 'lucide-react';

export const SUBJECT_ICONS: Record<string, any> = {
  [Subject.MATH]: Calculator,
  [Subject.M1]: PieChart,
  [Subject.M2]: Calculator,
  [Subject.ENG]: PenTool,
  [Subject.CHI]: Languages,
  [Subject.CSD]: Landmark,
  [Subject.PHY]: Zap,
  [Subject.CHEM]: Activity,
  [Subject.BIO]: Leaf,
  [Subject.ECON]: TrendingUp,
  [Subject.BAFS]: TrendingUp,
  [Subject.HIST]: BookOpen,
  [Subject.GEOG]: Globe,
  [Subject.ICT]: Monitor,
  [Subject.SCI]: Microscope, // For lower form Science
};

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 5000];

export const MOCK_TIPS = [
  { title: "DSE English Paper 2", content: "Use the 'PEEL' (Point, Explanation, Evidence, Link) structure for every body paragraph to secure high organization marks." },
  { title: "Math 5** Strategy", content: "In Section B, don't just give the answer. Show the 'method marks' steps clearly. Even if the final answer is wrong, steps get points." },
  { title: "CSD Keywords", content: "Always link back to 'National Security' and 'Sustainable Development' concepts where relevant in the data response questions." },
  { title: "Econ Supply & Demand", content: "Label your axes! P and Q. Losing 1 mark for missing labels is the difference between Level 5 and 5*." },
];

export const MOCK_PAST_PAPERS: PastPaper[] = [
  { id: 'dbs23s6m', year: '2023', level: Level.S6, subject: Subject.MATH, school: 'Diocesan Boys School', paper: 'Mock Paper 1', topics: ['3D Geometry', 'Probability', 'Quadratic Equations'] },
  { id: 'spcc23s6chem', year: '2023', level: Level.S6, subject: Subject.CHEM, school: 'St. Pauls Co-ed', paper: 'Mock Paper 1B', topics: ['Acids & Bases', 'Redox', 'Fossil Fuels'] },
  { id: 'dgs22s5eng', year: '2022', level: Level.S5, subject: Subject.ENG, school: 'Diocesan Girls School', paper: 'Mid-Year Paper 2', topics: ['Social Issues', 'Debate Writing'] },
  { id: 'qc23s6phy', year: '2023', level: Level.S6, subject: Subject.PHY, school: 'Queens College', paper: 'Mock Paper 2', topics: ['Radioactivity', 'Astronomy', 'Energy'] },
  { id: 'lsc22s4math', year: '2022', level: Level.S4, subject: Subject.MATH, school: 'La Salle College', paper: 'Final Exam', topics: ['Logarithms', 'Circle Geometry'] },
  { id: 'hkdse21econ', year: '2021', level: Level.S6, subject: Subject.ECON, school: 'HKDSE Past Paper', paper: 'Paper 2', topics: ['Market Structure', 'GDP', 'International Trade'] },
  { id: 'ghs23chi', year: '2023', level: Level.S6, subject: Subject.CHI, school: 'Good Hope School', paper: 'Paper 1', topics: ['Reading Comprehension', 'Classical Chinese'] },
  { id: 'pc23bafs', year: '2023', level: Level.S6, subject: Subject.BAFS, school: 'Pui Ching Middle School', paper: 'Paper 1', topics: ['Accounting Principles', 'Management'] },
];

export const HKDSE_SKILL_TREE: Record<string, Record<string, string[]>> = {
  [Subject.CHI]: {
    "Paper 1: Reading": ["Classical Chinese (文言文)", "Modern Text Analysis", "Author's Perspective", "Rhetorical Devices"],
    "Paper 2: Writing": ["Narrative Skills", "Argumentative Logic", "Descriptive Vocabulary", "Sentence Structure"],
    "Paper 3: Listening": ["Integrated Skills", "Tone Analysis", "Data Synthesis", "Formatting"]
  },
  [Subject.ENG]: {
    "Paper 1: Reading": ["B2/C1 Vocabulary", "Inference Skills", "Text Organization", "Summary Cloze"],
    "Paper 2: Writing": ["Social Issues", "Debate Arguments", "Formal Register", "Idea Development"],
    "Paper 3: Listening": ["Note-taking", "Data File Manipulation", "Tone Identification", "Language Appropriacy"]
  },
  [Subject.MATH]: {
    "Number & Algebra": ["Quadratic Equations", "Logarithms", "Variations", "Sequences & Series"],
    "Geom & Trig": ["Circle Geometry", "3D Trigonometry", "Coordinate Geometry", "Locus"],
    "Data Handling": ["Probability", "Statistics", "Standard Deviation", "Permutation & Combination"]
  },
  [Subject.PHY]: {
    "Mechanics": ["Force & Motion", "Projectile Motion", "Momentum", "Energy & Work"],
    "Waves": ["Reflection/Refraction", "Light & Lenses", "Sound Waves"],
    "Electromagnetism": ["Circuits", "Magnetic Fields", "Induction", "Transformers"],
    "Atomic Physics": ["Radioactivity", "Half-life", "Fission/Fusion"]
  },
  [Subject.CHEM]: {
    "Planet Earth": ["Atmosphere", "Ocean", "Rocks & Minerals"],
    "Microscopic World": ["Atomic Structure", "Bonding", "Intermolecular Forces"],
    "Metals": ["Reactivity Series", "Extraction", "Corrosion"],
    "Acids & Bases": ["pH scale", "Titration", "Salts"]
  },
  [Subject.ECON]: {
    "Microeconomics": ["Supply & Demand", "Elasticity", "Market Intervention", "Market Structure"],
    "Macroeconomics": ["GDP & GNP", "Inflation & Unemployment", "Fiscal Policy", "Money & Banking"]
  },
  [Subject.CSD]: {
    "Hong Kong": ["One Country Two Systems", "Rule of Law", "Social Participation"],
    "The Nation": ["Reform & Opening Up", "Political Structure", "Foreign Diplomacy"],
    "Contemporary World": ["Globalization", "Public Health", "Technology"]
  },
  [Subject.BIO]: {
    "Cells & Molecules": ["Enzymes", "Cell Transport", "Photosynthesis"],
    "Genetics": ["Inheritance", "DNA Replication", "Biodiversity"],
    "Human Phys": ["Digestion", "Respiration", "Homeostasis"]
  }
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    targetId: 'dashboard-hero',
    title: 'Your Command Center',
    description: 'This is your personalized dashboard. Track your DSE Countdown, daily tasks, and University goals here.',
    position: 'center'
  },
  {
    targetId: 'radar-chart',
    title: 'Subject Mastery',
    description: 'This radar shows your balance across 5 subjects. Click any point to dive deep into specific skills like "Calculus" or "Reading".',
    position: 'left'
  },
  {
    targetId: 'quick-actions',
    title: 'Daily Drills',
    description: 'Short on time? Launch a quick 10-min quiz here to keep your streak alive.',
    position: 'right'
  },
  {
    targetId: 'nav-item-mistake-vault',
    title: 'Mistake Vault',
    description: 'Crucial Feature: Every mistake you make is saved here. Review them to ensure you never lose marks on the same concept twice.',
    position: 'right'
  }
];
