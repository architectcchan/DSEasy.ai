
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Subject, QuizQuestion, EssayFeedback, MockExamQuestion, Level, UserProfile, StudyTask, SpeakingFeedback, SpeakingMode, ShortAnswerFeedback, DashboardInsight } from '../types';

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API_KEY is missing");
  }
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `You are DSE.ai, Hong Kong's elite AI tutor.
Your goal is to help students from Secondary 1 to Secondary 6 achieve Level 5** in the HKDSE.

Key Guidelines:
- **Curriculum Alignment:** Strictly follow the Hong Kong DSE curriculum (HKEAA standards).
- **Methodology:** Socratic. Never give the answer immediately. Ask guiding questions.
- **Marking Schemes:** When explaining answers, refer to "marking points" or "keywords" that HKEAA examiners look for.
- **Tone:** Encouraging, smart, modern, and focused on efficiency (like a top tutor from a cram school).
- **Language:** You are fluent in English and Traditional Chinese (Cantonese context allowed for colloquial explanations if requested). 
- **Levels:** 
  - S1-S3: Focus on foundation and interest.
  - S4-S6: Focus strictly on DSE exam technique, drill-and-practice, and cut-off scores.

When generating content:
- Break down long explanations into bullet points or short paragraphs.
- Use bolding for key terms.
`;

export const chatWithTutor = async (
  history: { role: 'user' | 'model'; text: string }[],
  message: string,
  subject: Subject,
  level: Level
): Promise<string> => {
  try {
    const ai = getAI();
    
    // Schema for structured chat response
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        explanation: { type: Type.STRING, description: "The main response, broken into chunks." },
        followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 suggestions for what the user can ask next." }
      },
      required: ['explanation', 'followUpQuestions']
    };

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: `${SYSTEM_INSTRUCTION} 
        Current Context:
        - Subject: ${subject}
        - Level: ${level}
        
        If the user asks for a summary, provide "Cheat Sheet" style bullet points suitable for last-minute revision.
        Always offer 3 distinct follow-up options for the user to deepen understanding.
        `,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage({ message });
    return result.text || "";
  } catch (error) {
    console.error("Chat error:", error);
    // Fallback to raw text if JSON parsing fails or network error
    return JSON.stringify({
        explanation: "I'm having trouble connecting to the marking server. Please try again.",
        followUpQuestions: ["Try again", "Check connection", "Switch subject"]
    });
  }
};

export const chatEssayCoach = async (
  history: { role: 'user' | 'model'; text: string }[],
  message: string,
  essayText: string,
  topic: string,
  level: Level
): Promise<{ feedback: string, suggestions: string[] }> => {
    try {
        const ai = getAI();
        
        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                feedback: { type: Type.STRING, description: "The conversational feedback." },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 specific follow-up questions the student should ask next." }
            },
            required: ['feedback', 'suggestions']
        };

        const ESSAY_INSTRUCTION = `You are an expert HKDSE English Writing Coach. 
        Your goal is to help the student improve their essay to a Level 5** standard.
        
        Context:
        - Level: ${level}
        - Essay Topic: ${topic || "Not specified"}
        - Current Essay Draft: 
        """
        ${essayText}
        """

        Your Role:
        1. DO NOT just rewrite the essay for them.
        2. Identify specific "Pitfalls" common in HK students (e.g., Chinglish, lack of topic sentences, memorized phrases).
        3. Point out specific areas for improvement in 3 domains: Content, Language, Organization.
        4. Be conversational and encouraging, like a friendly tutor sitting next to them.
        5. If the essay is empty, encourage them to start brainstorming.
        
        Output:
        Return a JSON object with:
        - 'feedback': Your response text (markdown supported).
        - 'suggestions': Array of 3 strings. These are questions the STUDENT can click to ask YOU (e.g., "How do I improve my intro?", "Check my grammar", "Give me better vocab").
        `;

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: ESSAY_INSTRUCTION,
            },
            history: history.map(h => ({
                role: h.role,
                parts: [{ text: h.text }],
            })),
        });

        const result = await chat.sendMessage({ message });
        const text = result.text;
        
        if (text) {
            return JSON.parse(text) as { feedback: string, suggestions: string[] };
        }
        throw new Error("Empty response");

    } catch (error) {
        console.error("Essay Coach error:", error);
        return { 
            feedback: "I'm having trouble analyzing your essay right now. Keep writing!", 
            suggestions: ["Check my grammar", "Help me brainstorm", "What is a good thesis?"] 
        };
    }
};

export const generateQuiz = async (subject: Subject, topic: string, level: Level): Promise<QuizQuestion[]> => {
  try {
    const ai = getAI();
    
    // Flexible schema to allow both MC and Short Answer
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['mc', 'short'] },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for MC" },
          correctIndex: { type: Type.INTEGER, description: "Only for MC" },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for Short Answer. The mandatory keywords." },
          answer: { type: Type.STRING, description: "Model answer for Short Answer" },
          explanation: { type: Type.STRING },
          topic: { type: Type.STRING },
          difficulty: { type: Type.STRING },
        },
        required: ['type', 'question', 'explanation', 'topic', 'difficulty'],
      },
    };

    const prompt = `Generate 3 questions for HKDSE ${subject} at ${level} level.
    Topic: "${topic}". 
    
    Requirements:
    1. Mix of 'mc' (Multiple Choice) and 'short' (Short Answer) types.
    2. For 'short' questions, provide specific 'keywords' that MUST be present in the answer to get marks (marking scheme style).
    3. Include at least one "5** Master" question that requires multi-step reasoning.
    4. For the 'difficulty' field, use one of these exact values: 'Foundation', 'DSE Level', '5* Challenge', '5** Master'.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: SYSTEM_INSTRUCTION
      },
    });

    const text = result.text;
    if (!text) return [];
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Quiz generation error:", error);
    return [];
  }
};

export const evaluateShortAnswer = async (userAnswer: string, question: QuizQuestion): Promise<ShortAnswerFeedback> => {
  try {
    const ai = getAI();
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        isCorrect: { type: Type.BOOLEAN },
        matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        missedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        feedback: { type: Type.STRING }
      },
      required: ['isCorrect', 'matchedKeywords', 'missedKeywords', 'feedback']
    };

    const prompt = `Evaluate this student's short answer based on the DSE marking scheme.
    Question: "${question.question}"
    Required Keywords (Marking Scheme): ${JSON.stringify(question.keywords)}
    Model Answer: "${question.answer}"
    Student Answer: "${userAnswer}"

    Task:
    1. Check if the student answer contains the required keywords (synonyms are acceptable if they carry exact technical meaning).
    2. Determine if the concept is correct.
    3. If they missed keywords, list them in 'missedKeywords'.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: SYSTEM_INSTRUCTION
      },
    });

    const text = result.text;
    if (!text) throw new Error("Evaluation failed");
    return JSON.parse(text) as ShortAnswerFeedback;
  } catch (error) {
     // Fallback simple check
     const keywords = question.keywords || [];
     const matched = keywords.filter(k => userAnswer.toLowerCase().includes(k.toLowerCase()));
     const missed = keywords.filter(k => !userAnswer.toLowerCase().includes(k.toLowerCase()));
     return {
        isCorrect: missed.length === 0,
        matchedKeywords: matched,
        missedKeywords: missed,
        feedback: missed.length === 0 ? "Perfect match!" : `You missed the keyword: ${missed[0]}`
     };
  }
};

export const generateDiagnosticQuestion = async (subject: Subject, level: Level): Promise<QuizQuestion | null> => {
  try {
    const ai = getAI();
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['mc'] },
        question: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        correctIndex: { type: Type.INTEGER },
        explanation: { type: Type.STRING },
        topic: { type: Type.STRING, description: "The specific sub-skill being tested (e.g. Calculus, Grammar)" },
        difficulty: { type: Type.STRING },
      },
      required: ['question', 'options', 'correctIndex', 'explanation', 'topic', 'difficulty', 'type'],
    };

    const prompt = `Generate ONE diagnostic multiple choice question for HKDSE ${subject} at ${level} level.
    Goal: Assess if the student has grasped a fundamental concept required for a Level 4 grade.
    The question should be challenging but not impossible.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: SYSTEM_INSTRUCTION
      },
    });

    const text = result.text;
    if (!text) return null;
    return JSON.parse(text) as QuizQuestion;
  } catch (error) {
    console.error("Diagnostic generation error:", error);
    return null;
  }
};

export const generateMockExam = async (subject: Subject, topics: string[], level: Level): Promise<MockExamQuestion[]> => {
  try {
    const ai = getAI();
    
    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['mc'] },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
          topic: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          commonMistake: { type: Type.STRING, description: "Common error made by HK students." },
          examTip: { type: Type.STRING, description: "Tip to get the 'M' mark or 'A' mark." }
        },
        required: ['type', 'question', 'options', 'correctIndex', 'explanation', 'topic', 'difficulty', 'commonMistake', 'examTip'],
      },
    };

    const prompt = `Create a mini-mock exam (5 questions) for HKDSE ${subject} (${level}). 
    Topics: ${topics.join(', ')}.
    Focus on tricky concepts that separate Level 4 students from Level 5** students.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: SYSTEM_INSTRUCTION
      },
    });

    const text = result.text;
    if (!text) return [];
    return JSON.parse(text) as MockExamQuestion[];
  } catch (error) {
    console.error("Mock Exam generation error:", error);
    return [];
  }
};

export const gradeEssay = async (essay: string, topic: string, level: Level): Promise<EssayFeedback> => {
  try {
    const ai = getAI();
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.STRING, description: "HKDSE Grade (Level 1 to 5**)" },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        improvedParagraph: { type: Type.STRING, description: "Rewrite specifically to hit the 'Content' and 'Language' marking criteria." },
        generalComment: { type: Type.STRING },
      },
      required: ['score', 'strengths', 'weaknesses', 'improvedParagraph', 'generalComment'],
    };

    const prompt = `Grade this essay based on HKDSE standards for ${level}.
    Topic: ${topic}. 
    Essay: "${essay}"
    
    Reference the HKEAA marking scheme criteria: Content, Language, Organization.
    Be strict but helpful. Ask the student a reflective question in the general comment.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: SYSTEM_INSTRUCTION
      },
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as EssayFeedback;
  } catch (error) {
    console.error("Grading error:", error);
    throw error;
  }
};

export const generateStudyPlan = async (profile: UserProfile): Promise<StudyTask[]> => {
  try {
    const ai = getAI();

    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['drill', 'review', 'paper'] },
          completed: { type: Type.BOOLEAN },
          subject: { type: Type.STRING },
          duration: { type: Type.STRING },
          xpReward: { type: Type.INTEGER },
          topic: { type: Type.STRING },
        },
        required: ['id', 'title', 'description', 'type', 'completed', 'subject', 'duration', 'xpReward'],
      },
    };

    const prompt = `Generate 3 personalized daily study tasks for a Hong Kong student.
    Profile:
    - Role: ${profile.role}
    - Level: ${profile.level} (Exam Year: ${profile.examYear})
    - Electives: ${profile.electives.join(', ')}
    - Target Grade: ${profile.targetGrade} (Uni Goal: ${profile.targetUni || 'General'})
    - Weaknesses: ${profile.weaknesses.join(', ')}
    - Learning Style: ${profile.learningStyle.join(', ')}

    Create tasks that specifically address their identified weaknesses and match their learning style (e.g. if 'Visual', suggest diagrams/videos; if 'Practice', suggest drills).
    Task types: 'drill' (quiz), 'review' (reading notes), 'paper' (mini mock).
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: SYSTEM_INSTRUCTION
      },
    });

    const text = result.text;
    if (!text) return [];
    return JSON.parse(text) as StudyTask[];

  } catch (error) {
    console.error("Study plan generation error:", error);
    return [
      {
        id: '1',
        title: 'Math MC Drill',
        description: 'Complete 5 MC questions on Quadratic Equations',
        type: 'drill',
        completed: false,
        subject: Subject.MATH,
        duration: '10 min',
        xpReward: 100,
        topic: 'Quadratic Equations'
      },
      {
        id: '2',
        title: 'English Vocab Review',
        description: 'Learn 5 new synonyms for "Important"',
        type: 'review',
        completed: false,
        subject: Subject.ENG,
        duration: '5 min',
        xpReward: 50,
        topic: 'Vocabulary'
      }
    ];
  }
};

export const generateDashboardInsight = async (profile: UserProfile, stats: any): Promise<DashboardInsight> => {
  try {
    const ai = getAI();
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        action: { type: Type.STRING }
      },
      required: ['title', 'description', 'action']
    };
    
    const prompt = `Analyze this student's profile and stats to provide a strategic dashboard insight.
    Profile: ${JSON.stringify(profile)}
    Stats: ${JSON.stringify(stats)}
    
    Identify a specific cognitive trend (e.g. good accuracy but low volume, or strong Logic but weak Application).
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });
    
    const text = result.text;
    if(!text) throw new Error("No insight");
    return JSON.parse(text) as DashboardInsight;
  } catch (e) {
    return {
      title: "Balance Your Skills",
      description: "Your Knowledge is high, but Application needs work. Focus on past paper drills.",
      action: "Start Paper 2 Drill"
    };
  }
};

// --- SPEAKING COACH SERVICES ---

export const getSpeakingTopic = async (mode: SpeakingMode): Promise<{topic: string, context?: string}> => {
    try {
        const ai = getAI();
        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                topic: { type: Type.STRING },
                context: { type: Type.STRING, description: "Background info or the previous speaker's point" }
            },
            required: ['topic', 'context']
        };
        
        const prompt = mode === 'PartA_Group' 
            ? "Generate a DSE English Paper 4 Part A scenario. Provide a 'Context' which is what Candidate A just said (an opinion on a social issue in HK), and 'Topic' which is the general theme."
            : "Generate a DSE English Paper 4 Part B (Individual Response) question. The question should be challenging and require a 1-minute response.";
            
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });
        
        const text = result.text;
        if(!text) return { topic: "Technology in Education", context: "I think technology distracts students." };
        return JSON.parse(text) as {topic: string, context?: string};

    } catch (e) {
        return { topic: "Social Media usage", context: "Some say social media causes anxiety among youth." };
    }
};

export const generateSpeakingFeedback = async (transcript: string, topic: string, mode: SpeakingMode): Promise<SpeakingFeedback> => {
    try {
        const ai = getAI();
        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.STRING },
                pronunciationTip: { type: Type.STRING, description: "Comment on sentence flow, rhythm, or detected filler words." },
                vocabularyScore: { type: Type.INTEGER },
                fluencyScore: { type: Type.INTEGER },
                betterExpression: { type: Type.STRING, description: "Rewrite one of the user's sentences to sound more native/academic." },
                examinerComment: { type: Type.STRING }
            },
            required: ['score', 'pronunciationTip', 'vocabularyScore', 'fluencyScore', 'betterExpression', 'examinerComment']
        };

        const prompt = `Analyze this spoken response for HKDSE English Paper 4 (${mode}).
        Topic: "${topic}"
        Transcript: "${transcript}"

        Criteria:
        1. Pronunciation & Delivery: (Infer from text flow - e.g. look for run-on sentences, 'um/uh' fillers, short choppy sentences).
        2. Communication Strategies: Did they respond relevantly?
        3. Vocabulary: Did they use varied words?
        4. Ideas: Was the content substantial?

        Be strict. 5** requires sophisticated phrasing.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });

        const text = result.text;
        if (!text) throw new Error("No response");
        return JSON.parse(text) as SpeakingFeedback;

    } catch (error) {
        console.error("Speaking feedback error", error);
        return {
            score: "3",
            pronunciationTip: "Unable to analyze.",
            vocabularyScore: 0,
            fluencyScore: 0,
            betterExpression: "N/A",
            examinerComment: "Analysis failed."
        };
    }
};
