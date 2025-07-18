import { createServerClient } from "@/lib/supabase/server";
import { certificates } from "@/lib/data";
import CertificateDisplay from "@/components/CertificateDisplay";
import type { Metadata } from 'next';

// Corrected type definition for the page props
type Props = {
  params: { credentialId: string };
};

// This function generates the special meta tags for sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerClient();
  
  // Query 1: Get the certificate data first.
  const { data: certData } = await supabase
    .from('user_certificates')
    .select('certificate_slug, user_id')
    .eq('credential_id', params.credentialId)
    .single();

  if (!certData) {
    return { title: 'Certificate Not Found' };
  }
  
  // Query 2: Get the profile data separately.
  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', certData.user_id)
    .single();
  
  const certInfo = certificates[certData.certificate_slug];
  const userName = profileData?.full_name || 'Valued Learner';
  const pageTitle = `${userName} - ${certInfo.badgeName}`;
  const ogImageUrl = `/api/og/${params.credentialId}`;

  return {
    title: pageTitle,
    description: `View the certificate earned by ${userName} from Promptopotamus.`,
    openGraph: {
      title: pageTitle,
      description: certInfo.description,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: certInfo.description,
      images: [ogImageUrl],
    },
  };
}

// The main page component
export default async function CertificateViewPage({ params }: Props) {
  const supabase = createServerClient();
  
  const { data: certData, error: certError } = await supabase
    .from('user_certificates')
    .select('*')
    .eq('credential_id', params.credentialId)
    .single();

  if (certError || !certData) {
    return (
      <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-red-600">Certificate Not Found</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">The link may be invalid or the certificate has not been processed yet.</p>
      </div>
    );
  }
  
  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, username')
    .eq('id', certData.user_id)
    .single();

  const certInfo = certificates[certData.certificate_slug];
  const userName = profileData?.full_name || profileData?.username || 'Valued Learner';

  return (
    <div className="max-w-4xl mx-auto w-full">
      <CertificateDisplay 
        level={certInfo.level} 
        badgeName={certInfo.badgeName} 
        userName={userName} 
        credentialId={certData.credential_id}
        issueDate={certData.earned_at}
        expiryDate={certData.expires_at}
      />
    </div>
  );
}