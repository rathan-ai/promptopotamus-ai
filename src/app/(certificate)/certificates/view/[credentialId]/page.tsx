import { createServerClient } from "@/lib/supabase/server";
import { certificates } from "@/lib/data";
import CertificateDisplay from "@/components/CertificateDisplay";
import type { Metadata } from 'next';

type Props = {
  params: { credentialId: string };
};

// This function is now simplified to prevent the server error.
// It returns a generic title instead of fetching dynamic data.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Promptopotamus Certificate of Achievement',
    description: 'View this certificate earned from Promptopotamus.',
  };
}

// The main page component still fetches all the data to display it.
export default async function CertificateViewPage({ params }: Props) {
  const supabase = createServerClient();
  
  // Query 1: Get the certificate data first.
  const { data: certData, error: certError } = await supabase
    .from('user_certificates')
    .select('*')
    .eq('credential_id', params.credentialId)
    .single();

  if (certError || !certData) {
    return (
      <div className="text-center p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-red-600">Certificate Not Found</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">The link may be invalid, or there might be a slight delay after earning it. Please try again in a moment.</p>
      </div>
    );
  }
  
  // Query 2: Get the profile data separately for reliability.
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