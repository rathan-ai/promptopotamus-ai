import { QuizLevel } from './data';

export interface CertificationStatus {
  hasValidCertificate: boolean;
  expiresAt?: string;
  canTakeLevel: boolean;
  prerequisiteMissing?: QuizLevel;
  failureCount?: number;
}

export interface LevelDependency {
  level: QuizLevel;
  requires?: QuizLevel;
  nextLevel?: QuizLevel;
}

// Define the sequential level progression
export const levelDependencies: LevelDependency[] = [
  { level: 'beginner' }, // No prerequisites
  { level: 'intermediate', requires: 'beginner' },
  { level: 'master', requires: 'intermediate' }
];

/**
 * Check if user can take a specific level based on prerequisites
 */
export function canTakeLevel(level: QuizLevel, userCertificates: any[]): {
  canTake: boolean;
  reason?: string;
  prerequisiteMissing?: QuizLevel;
} {
  const dependency = levelDependencies.find(dep => dep.level === level);
  
  if (!dependency?.requires) {
    // No prerequisites (beginner level)
    return { canTake: true };
  }

  // Check if user has valid prerequisite certificate
  const prerequisiteCert = userCertificates.find(cert => 
    cert.certificate_slug === getSlugForLevel(dependency.requires!) &&
    new Date(cert.expires_at) > new Date()
  );

  if (!prerequisiteCert) {
    return {
      canTake: false,
      reason: `You must have a valid ${dependency.requires} certificate to take the ${level} exam.`,
      prerequisiteMissing: dependency.requires
    };
  }

  return { canTake: true };
}

/**
 * Get certificate slug for level
 */
export function getSlugForLevel(level: QuizLevel): string {
  const slugMap: Record<QuizLevel, string> = {
    'beginner': 'promptling',
    'intermediate': 'promptosaur', 
    'master': 'promptopotamus'
  };
  return slugMap[level];
}

/**
 * Get level for certificate slug
 */
export function getLevelForSlug(slug: string): QuizLevel | null {
  const levelMap: Record<string, QuizLevel> = {
    'promptling': 'beginner',
    'promptosaur': 'intermediate',
    'promptopotamus': 'master'
  };
  return levelMap[slug] || null;
}

/**
 * Handle failure cascade - if user fails 3 times at a level,
 * determine which level they should retry
 */
export function getRecommendedLevelAfterFailure(
  failedLevel: QuizLevel, 
  failureCount: number,
  userCertificates: any[]
): {
  recommendedLevel: QuizLevel;
  reason: string;
} {
  // If failed 3+ times, drop to previous level
  if (failureCount >= 3) {
    const dependency = levelDependencies.find(dep => dep.level === failedLevel);
    
    if (dependency?.requires) {
      // Check if prerequisite certificate is still valid
      const prerequisiteCert = userCertificates.find(cert => 
        cert.certificate_slug === getSlugForLevel(dependency.requires!) &&
        new Date(cert.expires_at) > new Date()
      );
      
      if (!prerequisiteCert) {
        return {
          recommendedLevel: dependency.requires,
          reason: `After 3 failed attempts at ${failedLevel}, you need to renew your ${dependency.requires} certification first.`
        };
      }
    }
    
    // If at beginner level or prerequisite is valid, stay at same level
    return {
      recommendedLevel: failedLevel,
      reason: `You can retry the ${failedLevel} exam after the cooldown period.`
    };
  }
  
  return {
    recommendedLevel: failedLevel,
    reason: `You can retry the ${failedLevel} exam.`
  };
}

/**
 * Check if user has any valid certificates (for marketplace access)
 */
export function hasAnyValidCertificate(userCertificates: any[]): boolean {
  return userCertificates.some(cert => 
    new Date(cert.expires_at) > new Date()
  );
}

/**
 * Get highest valid certification level
 */
export function getHighestValidLevel(userCertificates: any[]): QuizLevel | null {
  const validCerts = userCertificates.filter(cert => 
    new Date(cert.expires_at) > new Date()
  );
  
  if (validCerts.find(cert => cert.certificate_slug === 'promptopotamus')) return 'master';
  if (validCerts.find(cert => cert.certificate_slug === 'promptosaur')) return 'intermediate';
  if (validCerts.find(cert => cert.certificate_slug === 'promptling')) return 'beginner';
  
  return null;
}

/**
 * Count consecutive failures for a level
 */
export function countConsecutiveFailures(attempts: any[], level: QuizLevel): number {
  const levelAttempts = attempts
    .filter(attempt => attempt.quiz_level === level)
    .sort((a, b) => new Date(b.attempted_at).getTime() - new Date(a.attempted_at).getTime());
  
  let consecutiveFailures = 0;
  for (const attempt of levelAttempts) {
    if (attempt.passed) break;
    consecutiveFailures++;
  }
  
  return consecutiveFailures;
}