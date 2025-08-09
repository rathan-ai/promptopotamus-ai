'use client';

import Link from 'next/link';
import { certificates, type Certificate } from '@/lib/data';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { CheckCircle, Lock, ArrowRight, AlertTriangle, Award, Users } from 'lucide-react';
import { FEATURE_PRICING } from '@/features/payments/services/payment-constants';

interface UserCertificate {
  certificate_slug: string;
  expires_at: string;
  earned_at: string;
  credential_id: string;
}

interface CertificationStatus {
  hasValidLevel1: boolean;
  hasValidLevel2: boolean;
  hasValidLevel3: boolean;
  canTakeLevel1: boolean;
  canTakeLevel2: boolean;
  canTakeLevel3: boolean;
}

const EnhancedCertificateCard = ({ 
  cert, 
  status,
  isLocked,
  prerequisite,
  credentialId
}: { 
  cert: Certificate;
  status: 'available' | 'completed' | 'locked' | 'expired';
  isLocked: boolean;
  prerequisite?: string;
  credentialId?: string;
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
          text: 'Completed',
          buttonText: 'View Certificate',
          buttonVariant: 'outline' as const
        };
      case 'expired':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-500" />,
          badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
          text: 'Expired - Renew',
          buttonText: 'Retake Exam',
          buttonVariant: 'default' as const
        };
      case 'locked':
        return {
          icon: <Lock className="w-6 h-6 text-neutral-400" />,
          badge: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
          text: `Requires ${prerequisite}`,
          buttonText: 'Locked',
          buttonVariant: 'outline' as const
        };
      default:
        return {
          icon: <Award className="w-6 h-6 text-blue-500" />,
          badge: `${cert.level === 'Beginner' ? 'bg-green-500/10 text-green-500' : cert.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`,
          text: cert.level,
          buttonText: 'Start Exam',
          buttonVariant: 'default' as const
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`relative bg-white dark:bg-neutral-800/50 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 transition-all hover:shadow-xl ${isLocked ? 'opacity-60' : 'hover:scale-105'}`}>
      {status === 'completed' && (
        <div className="absolute top-4 right-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {statusInfo.icon}
          <span className={`ml-3 px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.badge}`}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
        {cert.badgeName}
      </h3>
      
      <p className="text-neutral-600 dark:text-neutral-300 mb-4">
        {cert.description}
      </p>

      {/* Prerequisites Warning */}
      {isLocked && prerequisite && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex items-start">
            <Lock className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Prerequisites Required
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Complete {prerequisite} certification first to unlock this level.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Skills & Benefits */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
          Skills You&apos;ll Validate:
        </h4>
        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
          {cert.skills.slice(0, 2).map((skill, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
              {skill}
            </li>
          ))}
        </ul>
      </div>

      {/* Exam Cost */}
      {status !== 'completed' && (
        <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Exam Cost:
            </span>
            <span className="text-sm font-medium">${FEATURE_PRICING.EXAM_ATTEMPT} per attempt</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Link href={
        isLocked ? '#' 
        : status === 'completed' && credentialId ? `/certificates/view/${credentialId}`
        : `/certificates/${cert.slug}`
      } passHref>
        <Button 
          asChild={!isLocked} 
          disabled={isLocked}
          variant={statusInfo.buttonVariant}
          className="w-full"
        >
          <a className={isLocked ? 'cursor-not-allowed' : ''}>
            {statusInfo.buttonText}
          </a>
        </Button>
      </Link>
    </div>
  );
};

export default function CertificatesPage() {
  const [certificationStatus, setCertificationStatus] = useState<CertificationStatus>({
    hasValidLevel1: false,
    hasValidLevel2: false,
    hasValidLevel3: false,
    canTakeLevel1: true,
    canTakeLevel2: false,
    canTakeLevel3: false,
  });
  
  const [userCertificates, setUserCertificates] = useState<UserCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCertificationStatus = async () => {
      try {
        const response = await fetch('/api/smart-prompts/my-prompts');
        if (response.ok) {
          const data = await response.json();
          const certificates = data.certificationStatus.certificates || [];
          setUserCertificates(certificates);

          // Check current status
          const now = new Date();
          const validLevel1 = certificates.find((cert: UserCertificate) => 
            cert.certificate_slug === 'promptling' && new Date(cert.expires_at) > now
          );
          const validLevel2 = certificates.find((cert: UserCertificate) => 
            cert.certificate_slug === 'promptosaur' && new Date(cert.expires_at) > now
          );
          const validLevel3 = certificates.find((cert: UserCertificate) => 
            cert.certificate_slug === 'promptopotamus' && new Date(cert.expires_at) > now
          );

          setCertificationStatus({
            hasValidLevel1: !!validLevel1,
            hasValidLevel2: !!validLevel2,
            hasValidLevel3: !!validLevel3,
            canTakeLevel1: true,
            canTakeLevel2: !!validLevel1,
            canTakeLevel3: !!validLevel2,
          });
        }
      } catch (error) {
        console.error('Error checking certification status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCertificationStatus();
  }, []);

  const getCertStatus = (certSlug: string): 'available' | 'completed' | 'locked' | 'expired' => {
    const userCert = userCertificates.find(cert => cert.certificate_slug === certSlug);
    
    if (userCert) {
      const isExpired = new Date(userCert.expires_at) <= new Date();
      return isExpired ? 'expired' : 'completed';
    }

    // Check if locked based on prerequisites
    if (certSlug === 'promptosaur' && !certificationStatus.hasValidLevel1) return 'locked';
    if (certSlug === 'promptopotamus' && !certificationStatus.hasValidLevel2) return 'locked';
    
    return 'available';
  };

  const getPrerequisite = (certSlug: string): string | undefined => {
    if (certSlug === 'promptosaur') return 'Level 1 (Promptling)';
    if (certSlug === 'promptopotamus') return 'Level 2 (Promptosaur)';
    return undefined;
  };

  const getCredentialId = (certSlug: string): string | undefined => {
    const userCert = userCertificates.find(cert => cert.certificate_slug === certSlug);
    return userCert?.credential_id;
  };

  const certs = Object.values(certificates);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4 dark:text-white">
          Certification Exams
        </h1> 
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          Follow the sequential path to master AI prompt engineering and unlock marketplace features.
        </p>

        {/* Certification Path Flow */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700 mb-8">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">
            🎯 Certification Path
          </h2>
          <div className="flex items-center justify-center space-x-4 flex-wrap">
            <div className={`flex items-center px-4 py-2 rounded-lg ${certificationStatus.hasValidLevel1 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
              {certificationStatus.hasValidLevel1 ? <CheckCircle className="w-4 h-4 mr-2" /> : <Award className="w-4 h-4 mr-2" />}
              Level 1
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400" />
            <div className={`flex items-center px-4 py-2 rounded-lg ${certificationStatus.hasValidLevel2 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : certificationStatus.canTakeLevel2 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
              {certificationStatus.hasValidLevel2 ? <CheckCircle className="w-4 h-4 mr-2" /> : certificationStatus.canTakeLevel2 ? <Award className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              Level 2
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400" />
            <div className={`flex items-center px-4 py-2 rounded-lg ${certificationStatus.hasValidLevel3 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : certificationStatus.canTakeLevel3 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
              {certificationStatus.hasValidLevel3 ? <CheckCircle className="w-4 h-4 mr-2" /> : certificationStatus.canTakeLevel3 ? <Award className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              Level 3
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400" />
            <div className={`flex items-center px-4 py-2 rounded-lg ${(certificationStatus.hasValidLevel1 || certificationStatus.hasValidLevel2 || certificationStatus.hasValidLevel3) ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'}`}>
              <Users className="w-4 h-4 mr-2" />
              Marketplace
            </div>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4">
            {certificationStatus.hasValidLevel1 || certificationStatus.hasValidLevel2 || certificationStatus.hasValidLevel3 
              ? '✨ Marketplace unlocked! Create and sell Smart Prompts to the community.'
              : 'Complete any certification level to unlock Smart Prompts marketplace features.'
            }
          </p>
        </div>
      </div>

      {/* Certificate Cards */}
      <div className="grid gap-8">
        {certs.map(cert => {
          const status = getCertStatus(cert.slug);
          const credentialId = getCredentialId(cert.slug);
          return (
            <EnhancedCertificateCard 
              key={cert.slug} 
              cert={cert}
              status={status}
              isLocked={status === 'locked'}
              prerequisite={getPrerequisite(cert.slug)}
              credentialId={credentialId}
            />
          );
        })}
      </div>
    </div>
  );
}
