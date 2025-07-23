'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import CertificateDisplay from '@/components/CertificateDisplay';
import { certificates } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UserCertificate {
  certificate_slug: string;
  expires_at: string;
  earned_at: string;
  credential_id: string;
}

export default function CertificateViewPage() {
  const params = useParams();
  const certificateSlug = params.certificateSlug as string;
  const [userCertificate, setUserCertificate] = useState<UserCertificate | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setError('Please log in to view your certificates');
          setLoading(false);
          return;
        }
        setUser(user);

        // Get user certificates
        const { data: userCerts, error: certsError } = await supabase
          .from('user_certificates')
          .select('certificate_slug, expires_at, earned_at, credential_id')
          .eq('user_id', user.id)
          .eq('certificate_slug', certificateSlug)
          .single();

        if (certsError) {
          if (certsError.code === 'PGRST116') {
            setError('Certificate not found. Please complete the certification exam first.');
          } else {
            throw certsError;
          }
          setLoading(false);
          return;
        }

        setUserCertificate(userCerts);
      } catch (error) {
        console.error('Error fetching certificate:', error);
        setError('Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    if (certificateSlug) {
      fetchCertificate();
    }
  }, [certificateSlug, supabase]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Certificate Not Found</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">{error}</p>
        <Link href="/certificates">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Button>
        </Link>
      </div>
    );
  }

  const certificate = certificates[certificateSlug as keyof typeof certificates];
  if (!certificate || !userCertificate) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Certificate Not Found</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">The requested certificate could not be found.</p>
        <Link href="/certificates">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Button>
        </Link>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Certified User';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/certificates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Button>
        </Link>
      </div>

      {/* Certificate Display */}
      <CertificateDisplay
        level={certificate.level}
        badgeName={certificate.badgeName}
        userName={userName}
        credentialId={userCertificate.credential_id}
        issueDate={userCertificate.earned_at}
        expiryDate={userCertificate.expires_at}
      />

      {/* Certificate Details */}
      <div className="mt-12 bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Certificate Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Certificate ID:</p>
            <p className="font-mono text-xs">{userCertificate.credential_id}</p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Level:</p>
            <p>{certificate.level}</p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Issued Date:</p>
            <p>{new Date(userCertificate.earned_at).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-neutral-500 dark:text-neutral-400">Expiry Date:</p>
            <p className={new Date(userCertificate.expires_at) < new Date() ? 'text-red-600 font-semibold' : ''}>
              {new Date(userCertificate.expires_at).toLocaleDateString()}
              {new Date(userCertificate.expires_at) < new Date() && ' (Expired)'}
            </p>
          </div>
        </div>
        
        {/* Renewal Notice */}
        {new Date(userCertificate.expires_at) < new Date() && (
          <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Certificate Expired</h4>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
              This certificate has expired. To maintain your certification status and marketplace access, please retake the exam.
            </p>
            <Link href={`/certificates/${certificateSlug}`}>
              <Button size="sm">Retake Exam</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}