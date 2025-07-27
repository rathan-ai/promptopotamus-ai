import { createServerClient } from "@/lib/supabase/server";
import { certificates } from "@/lib/data";
import CertificateDisplay from "@/components/features/certificates/CertificateDisplay";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Metadata } from 'next';

// Step 1: Define the params as a Promise
type PageProps = {
  params: Promise<{ credentialId: string }>;
};

// Step 2: Update generateMetadata to await the params
export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
  const params = await paramsPromise; // Await the promise to get the object
  const supabase = await createServerClient();
  
  const { data } = await supabase.from('user_certificates').select('certificate_slug, user_id').eq('credential_id', params.credentialId).single();

  if (!data) {
    return { title: 'Certificate' };
  }

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user_id).single();
  
  const certInfo = certificates[data.certificate_slug];
  const userName = profile?.full_name || 'Valued Learner';
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

// Step 3: Update the Page component to await the params
export default async function CertificateViewPage({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise; // Await the promise to get the object
  const supabase = await createServerClient();
  
  const { data: certData, error: certError } = await supabase
    .from('user_certificates')
    .select('*')
    .eq('credential_id', params.credentialId)
    .single();

  if (certError || !certData) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Certificate Not Found</h1>
        <p>The link may be invalid or the certificate has not been processed yet.</p>
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
    <div className="max-w-4xl mx-auto">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link href="/certificates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Button>
        </Link>
      </div>
      
      <h1 className="text-center text-2xl font-bold mb-8">Certificate of Achievement</h1>
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