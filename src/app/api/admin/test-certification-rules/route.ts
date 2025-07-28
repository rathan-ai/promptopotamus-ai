import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { hasAnyValidCertificate } from '@/lib/certification';

/**
 * Test endpoint to verify certification business rules are working
 * This endpoint simulates the certification check for creating sellable artifacts
 */
export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch user's certificates
    const { data: userCertificates, error: certError } = await supabase
      .from('user_certificates')
      .select('certificate_slug, expires_at, created_at')
      .eq('user_id', user.id);
    
    if (certError) {
      return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 });
    }
    
    // Check certification status
    const hasValidCertification = hasAnyValidCertificate(userCertificates || []);
    
    // Simulate what would happen if user tries to create a sellable artifact
    const canCreateSellableArtifacts = hasValidCertification;
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      certificationStatus: {
        hasValidCertification,
        canCreateSellableArtifacts,
        certificates: userCertificates?.map(cert => ({
          type: cert.certificate_slug,
          expires: cert.expires_at,
          isValid: new Date(cert.expires_at) > new Date(),
          daysUntilExpiry: Math.ceil((new Date(cert.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        })) || []
      },
      businessRules: {
        smartPromptsMarketplace: canCreateSellableArtifacts ? 'ALLOWED' : 'BLOCKED - CERTIFICATION REQUIRED',
        message: canCreateSellableArtifacts 
          ? 'User can create sellable Smart Prompts in the marketplace'
          : 'User must complete certification before creating sellable artifacts'
      },
      recommendations: !canCreateSellableArtifacts ? [
        'Complete at least one certification exam (Beginner, Intermediate, or Master)',
        'Visit /certificates to start your certification journey',
        'Certified users can create and sell Smart Prompts in the marketplace'
      ] : [
        'You can create sellable Smart Prompts in the marketplace',
        'Your certification enables quality content creation',
        'Share your expertise through the Smart Prompts marketplace'
      ]
    });
    
  } catch (error) {
    console.error('Certification test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}