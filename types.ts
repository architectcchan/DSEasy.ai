
export enum Subject {
  // Core
  CHI = 'Chinese Language',
  ENG = 'English Language',
  MATH = 'Mathematics (Compulsory)',
  CSD = 'Citizenship & Social Dev',
  
  // Lower Forms
  SCI = 'Integrated Science',

  // Electives (Science)
  PHY = 'Physics',
  CHEM = 'Chemistry',
  BIO = 'Biology',
  
  // Electives (Commerce)
  ECON = 'Economics',
  BAFS = 'BAFS',
  
  // Electives (Arts/Others)
  HIST = 'History',
  GEOG = 'Geography',
  ICT = 'Info & Comm Tech',
  
  // Math Extensions
  M1 = 'M1 (Calculus & Stats)',
  M2 = 'M2 (Algebra & Calculus)'
}

export enum Level {
  S1 = 'Secondary 1',
  S2 = 'Secondary 2',
  S3 = 'Secondary 3',
  S4 = 'Secondary 4 (DSE)',
  S5 = 'Secondary 5 (DSE)',
  S6 = 'Secondary 6 (DSE)'
}

export enum Role {
  STUDENT = 'Student',
  TUTOR = 'Tutor',
  PARENT = 'Parent'
}

export interface UserProfile {
  name: string;
  role: Role;
  level: Level;
  examYear: string;
  electives: Subject[];
  targetGrade: string; // e.g., "5**"
  targetUni?: string;
  currentGrades: Record<string, string>; // Subject -> Grade
  learningStyle: string[]; // e.g. ['Visual', 'Practice']
  studySchedule: string; // e.g. 'Evenings'
  weaknesses: string[];
  hasSeenTutorial: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  type: 'drill' | 'review' | 'paper';
  completed: boolean;
  subject: Subject;
  duration: string;
  xpReward: number;
  topic?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  suggestions?: string[];
}

export type QuestionType = 'mc' | 'short';

export interface QuizQuestion {
  type: QuestionType;
  question: string;
  options?: string[]; // Only for MC
  correctIndex?: number; // Only for MC
  keywords?: string[]; // Only for Short Answer
  answer?: string; // Model answer for Short Answer
  explanation: string;
  topic: string;
  difficulty: 'Foundation' | 'DSE Level' | '5* Challenge' | '5** Master';
}

export interface MockExamQuestion extends QuizQuestion {
  commonMistake: string; 
  examTip: string;       
}

export interface EssayFeedback {
  score: string; // e.g., "Level 4", "Level 5**"
  strengths: string[];
  weaknesses: string[];
  improvedParagraph: string;
  generalComment: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  questionsAsked: number;
  topicsMastered: number;
  subjectActivity: Record<string, number>;
}

export interface PastPaper {
  id: string;
  year: string;
  level: Level;
  subject: Subject;
  school: string; // e.g., DBS, SPCC
  paper: string;
  topics: string[];
}

export interface SkillMetric {
  name: string;
  score: number; // 0-100
  trend: 'up' | 'down' | 'stable';
}

export interface SubjectReadiness {
  subject: Subject;
  score: number; // 0-100 (converted to Level 1-5**)
  predictedGrade: string;
  skills: SkillMetric[];
}

export interface MockExamResult {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  topicBreakdown: Record<string, number>;
}

export interface MistakeRecord {
  id: string;
  subject: Subject;
  question: QuizQuestion;
  userAnswerIndex?: number; // For MC
  userAnswerText?: string; // For Short Answer
  timestamp: number;
  reflectionNote?: string;
  errorType?: 'Careless' | 'Concept' | 'Time';
}

// Speaking Coach Types
export type SpeakingMode = 'PartA_Group' | 'PartB_Individual';

export interface SpeakingFeedback {
  score: string; // Level 1-5**
  pronunciationTip: string;
  vocabularyScore: number; // 0-10
  fluencyScore: number; // 0-10
  betterExpression: string; // A rewritten version of a specific sentence
  examinerComment: string;
}

export interface ShortAnswerFeedback {
  isCorrect: boolean;
  matchedKeywords: string[];
  missedKeywords: string[];
  feedback: string;
}

export interface DashboardInsight {
  title: string;
  description: string;
  action: string;
}

export interface TutorialStep {
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface GameLevel {
  id: number;
  subject: Subject;
  pairs: { term: string, definition: string }[];
}

export type AppView = 'onboarding' | 'dashboard' | 'chat' | 'quiz' | 'essay' | 'notes' | 'papers' | 'mock-exam-hub' | 'mock-exam' | 'mistake-vault' | 'speaking-coach' | 'game';

// Helper Types for Curriculum
export interface CurriculumComponent {
  name: string;
  skills: string[];
}

export interface SubjectCurriculum {
  components: CurriculumComponent[];
}
