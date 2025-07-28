/**
 * Quiz Randomization Utilities
 * 
 * This module provides functions to properly randomize quiz question options
 * while maintaining answer correctness and improving user experience.
 */

// Types for quiz data structure (based on actual database format)
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[]; // Array of 4 options
  answer?: string;   // Full text of correct answer (optional, used for validation)
}

export interface RandomizedQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  originalCorrectAnswer: string; // For debugging/audit purposes
}

/**
 * Fisher-Yates shuffle algorithm for proper randomization
 * More reliable than Math.random() - 0.5 sorting
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Randomizes the order of options for a single quiz question
 * while tracking the correct answer's new position
 */
export function randomizeQuestionOptions(question: QuizQuestion): RandomizedQuestion {
  const { options, answer } = question;
  
  // Validate that we have 4 options
  if (!options || options.length !== 4) {
    console.warn(`Question ${question.id} does not have exactly 4 options:`, options);
    return {
      id: question.id,
      question: question.question,
      options: options || [],
      correctIndex: 0,
      originalCorrectAnswer: answer || 'UNKNOWN'
    };
  }
  
  // Find the index of the correct answer by matching the answer text
  let originalCorrectIndex = -1;
  if (answer) {
    originalCorrectIndex = options.findIndex(option => 
      option.trim().toLowerCase() === answer.trim().toLowerCase()
    );
  }
  
  if (originalCorrectIndex === -1) {
    console.warn(`Question ${question.id}: Could not find correct answer "${answer}" in options:`, options);
    // Return unrandomized if we can't identify correct answer
    return {
      id: question.id,
      question: question.question,
      options: options,
      correctIndex: 0, // Default to first option
      originalCorrectAnswer: answer || 'UNKNOWN'
    };
  }
  
  // Create array of options with their original indices
  const optionsWithIndices = options.map((option, index) => ({
    option,
    originalIndex: index,
    isCorrect: index === originalCorrectIndex
  }));
  
  // Validate that all options are unique
  const uniqueValues = new Set(options.map(opt => opt.trim().toLowerCase()));
  if (uniqueValues.size !== options.length) {
    console.warn(`Question ${question.id} has duplicate options:`, options);
  }
  
  // Shuffle the options while preserving the correct answer tracking
  const shuffledOptions = fisherYatesShuffle(optionsWithIndices);
  
  // Find the new index of the correct answer
  const newCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect);
  
  return {
    id: question.id,
    question: question.question,
    options: shuffledOptions.map(opt => opt.option),
    correctIndex: newCorrectIndex,
    originalCorrectAnswer: answer || 'UNKNOWN'
  };
}

/**
 * Randomizes options for multiple quiz questions
 */
export function randomizeQuizQuestions(questions: QuizQuestion[]): RandomizedQuestion[] {
  return questions.map(randomizeQuestionOptions);
}

/**
 * Validates that a quiz question has proper structure and unique options
 */
export function validateQuizQuestion(question: QuizQuestion): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check if question has text
  if (!question.question || question.question.trim() === '') {
    issues.push('Question text is missing or empty');
  }
  
  // Check if options exist and have correct length
  if (!question.options) {
    issues.push('Options are missing');
    return { isValid: false, issues };
  }
  
  if (question.options.length !== 4) {
    issues.push(`Expected 4 options, found ${question.options.length}`);
  }
  
  // Check if all options have content
  question.options.forEach((option, index) => {
    if (!option || option.trim() === '') {
      issues.push(`Option ${index + 1} is missing or empty`);
    }
  });
  
  // Check for duplicate options
  const trimmedOptions = question.options.map(opt => opt?.trim().toLowerCase()).filter(Boolean);
  const uniqueValues = new Set(trimmedOptions);
  
  if (uniqueValues.size !== trimmedOptions.length) {
    issues.push('Some options are identical');
    
    // Identify which options are duplicated
    const duplicates: string[] = [];
    const seen = new Set<string>();
    
    for (const value of trimmedOptions) {
      if (seen.has(value)) {
        duplicates.push(value);
      } else {
        seen.add(value);
      }
    }
    
    if (duplicates.length > 0) {
      issues.push(`Duplicate options found: ${duplicates.join(', ')}`);
    }
  }
  
  // Check for correct answer
  if (!question.answer) {
    issues.push('Correct answer is not specified');
  } else {
    // Check if correct answer matches one of the options
    const answerMatch = question.options.some(option => 
      option?.trim().toLowerCase() === question.answer?.trim().toLowerCase()
    );
    
    if (!answerMatch) {
      issues.push(`Correct answer "${question.answer}" does not match any option`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Validates multiple quiz questions and returns a summary report
 */
export function validateQuizQuestions(questions: QuizQuestion[]): {
  totalQuestions: number;
  validQuestions: number;
  invalidQuestions: number;
  issues: Array<{
    questionId: number;
    issues: string[];
  }>;
} {
  const results = questions.map(q => ({
    questionId: q.id,
    validation: validateQuizQuestion(q)
  }));
  
  const validQuestions = results.filter(r => r.validation.isValid).length;
  const invalidQuestions = results.length - validQuestions;
  
  const issues = results
    .filter(r => !r.validation.isValid)
    .map(r => ({
      questionId: r.questionId,
      issues: r.validation.issues
    }));
  
  return {
    totalQuestions: questions.length,
    validQuestions,
    invalidQuestions,
    issues
  };
}

/**
 * Improved shuffling for question selection
 * Replaces the problematic Math.random() - 0.5 approach
 */
export function shuffleQuestions<T>(questions: T[]): T[] {
  return fisherYatesShuffle(questions);
}

/**
 * Utility to check answer distribution bias by position
 */
export function analyzeAnswerDistribution(questions: QuizQuestion[]): {
  distribution: Record<string, number>;
  isBalanced: boolean;
  bias: string | null;
} {
  const distribution: Record<string, number> = { 
    'Position 1': 0, 
    'Position 2': 0, 
    'Position 3': 0, 
    'Position 4': 0 
  };
  
  questions.forEach(q => {
    if (q.answer && q.options) {
      const correctIndex = q.options.findIndex(option => 
        option?.trim().toLowerCase() === q.answer?.trim().toLowerCase()
      );
      
      if (correctIndex !== -1) {
        const positionKey = `Position ${correctIndex + 1}`;
        distribution[positionKey]++;
      }
    }
  });
  
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const expectedPerPosition = total / 4; // 25% each for balanced distribution
  const threshold = expectedPerPosition * 0.4; // 40% threshold for bias detection
  
  let bias: string | null = null;
  let isBalanced = true;
  
  for (const [position, count] of Object.entries(distribution)) {
    if (Math.abs(count - expectedPerPosition) > threshold) {
      isBalanced = false;
      if (count > expectedPerPosition + threshold) {
        bias = `${position} is over-represented (${count}/${total} = ${Math.round(count/total*100)}%)`;
      }
    }
  }
  
  return {
    distribution,
    isBalanced,
    bias
  };
}

/**
 * Generate a report for quiz data quality
 */
export function generateQuizQualityReport(questions: QuizQuestion[]): {
  summary: {
    totalQuestions: number;
    validQuestions: number;
    problematicQuestions: number;
  };
  validation: ReturnType<typeof validateQuizQuestions>;
  answerDistribution: ReturnType<typeof analyzeAnswerDistribution>;
  recommendations: string[];
} {
  const validation = validateQuizQuestions(questions);
  const answerDistribution = analyzeAnswerDistribution(questions);
  
  const recommendations: string[] = [];
  
  if (validation.invalidQuestions > 0) {
    recommendations.push(`Fix ${validation.invalidQuestions} questions with validation issues`);
  }
  
  if (!answerDistribution.isBalanced) {
    recommendations.push('Rebalance correct answer distribution across options');
    if (answerDistribution.bias) {
      recommendations.push(answerDistribution.bias);
    }
  }
  
  if (validation.issues.some(issue => 
    issue.issues.some(i => i.includes('identical')))) {
    recommendations.push('Review and fix questions with identical options');
  }
  
  return {
    summary: {
      totalQuestions: questions.length,
      validQuestions: validation.validQuestions,
      problematicQuestions: validation.invalidQuestions
    },
    validation,
    answerDistribution,
    recommendations
  };
}