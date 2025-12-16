'use client';

import { Award, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Certificate {
  id: number;
  certificate_slug: string;
  earned_at: string;
  credential_id: string;
}

interface CertificationProgressProps {
  certificates: Certificate[];
}

const CERTIFICATION_LEVELS = [
  {
    slug: 'promptling',
    quizSlug: 'beginner',
    name: 'Promptling',
    description: 'Foundation in prompt engineering',
    icon: '🌱',
    color: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-500',
  },
  {
    slug: 'promptosaur',
    quizSlug: 'intermediate',
    name: 'Promptosaur',
    description: 'Advanced prompt techniques',
    icon: '🦕',
    color: 'blue',
    bgGradient: 'from-blue-500 to-indigo-500',
  },
  {
    slug: 'promptopotamus',
    quizSlug: 'master',
    name: 'Promptopotamus',
    description: 'Master prompt engineer',
    icon: '🦛',
    color: 'purple',
    bgGradient: 'from-purple-500 to-pink-500',
  },
];

export default function CertificationProgress({ certificates }: CertificationProgressProps) {
  const earnedSlugs = certificates.map(c => c.certificate_slug);

  // Calculate overall progress
  const earnedCount = earnedSlugs.length;
  const totalLevels = CERTIFICATION_LEVELS.length;
  const progressPercent = Math.round((earnedCount / totalLevels) * 100);

  // Find next certification to earn
  const nextCert = CERTIFICATION_LEVELS.find(level => !earnedSlugs.includes(level.slug));

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h3 className="card-title flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Certification Journey
          </h3>
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {earnedCount}/{totalLevels} Complete
          </span>
        </div>
      </div>

      <div className="card-content space-y-6">
        {/* Overall Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white">
              {progressPercent}%
            </span>
          </div>
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Certification Cards */}
        <div className="grid gap-4">
          {CERTIFICATION_LEVELS.map((level, index) => {
            const isEarned = earnedSlugs.includes(level.slug);
            const isLocked = index > 0 && !earnedSlugs.includes(CERTIFICATION_LEVELS[index - 1].slug);
            const certificate = certificates.find(c => c.certificate_slug === level.slug);

            return (
              <div
                key={level.slug}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isEarned
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : isLocked
                    ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 opacity-60'
                    : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                      isEarned
                        ? `bg-gradient-to-br ${level.bgGradient}`
                        : isLocked
                        ? 'bg-neutral-200 dark:bg-neutral-700'
                        : 'bg-neutral-100 dark:bg-neutral-700'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-neutral-400" />
                    ) : (
                      <span>{level.icon}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-neutral-900 dark:text-white">
                        {level.name}
                      </h4>
                      {isEarned && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {level.description}
                    </p>
                    {isEarned && certificate && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Earned {new Date(certificate.earned_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div>
                    {isEarned ? (
                      <Link
                        href={`/certificates/view/${certificate?.credential_id}`}
                        className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
                      >
                        View Certificate
                      </Link>
                    ) : isLocked ? (
                      <span className="text-sm text-neutral-400">
                        Complete previous first
                      </span>
                    ) : (
                      <Link href={`/certificates/${level.quizSlug}`}>
                        <button className="btn btn-sm btn-primary flex items-center gap-1">
                          Start Quiz
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Encouragement Message */}
        {nextCert && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-semibold">Next up:</span> Complete the {nextCert.name} certification to unlock new features and showcase your expertise!
            </p>
          </div>
        )}

        {earnedCount === totalLevels && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <span>
                <span className="font-semibold">Congratulations!</span> You've mastered all certification levels. You're now a certified Promptopotamus expert!
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
