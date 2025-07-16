'use client';

import { useRef } from 'react';
import { Award, Share2, Download, Linkedin } from 'lucide-react';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

interface CertificateDisplayProps {
  level: 'Beginner' | 'Intermediate' | 'Master';
  badgeName: string;
  userName: string;
  credentialId?: string;
  issueDate?: string;
  expiryDate?: string;
}

const levelStyles = {
  Beginner: { name: 'Bronze', gradient: 'from-amber-200 via-yellow-600 to-amber-900', textColor: 'text-amber-950', iconColor: 'text-amber-800' },
  Intermediate: { name: 'Silver', gradient: 'from-slate-300 via-slate-400 to-slate-500', textColor: 'text-slate-900', iconColor: 'text-slate-700' },
  Master: { name: 'Gold', gradient: 'from-yellow-300 via-amber-400 to-yellow-500', textColor: 'text-yellow-900', iconColor: 'text-yellow-700' },
};

export default function CertificateDisplay({ level, badgeName, userName, credentialId, issueDate, expiryDate }: CertificateDisplayProps) {
  const styles = levelStyles[level];
  const certificateRef = useRef<HTMLDivElement>(null);
  const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;
  
  const handleShare = () => {
    if (!credentialId) return;
    const shareUrl = `${window.location.origin}/certificates/view/${credentialId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Public certificate link copied to clipboard!');
  };

  const handleDownload = () => {
    if (certificateRef.current) {
      html2canvas(certificateRef.current, { scale: 2, backgroundColor: null }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `Promptopotamus_Certificate_${userName.replace(/\s/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const handleAddToLinkedIn = () => {
    if (!issueDate || !expiryDate || !credentialId) {
      toast.error("Certificate data is missing for LinkedIn share.");
      return;
    }
    
    const certUrl = `${window.location.origin}/certificates/view/${credentialId}`;
    const issueMonth = new Date(issueDate).getMonth() + 1;
    const issueYear = new Date(issueDate).getFullYear();
    const expirationMonth = new Date(expiryDate).getMonth() + 1;
    const expirationYear = new Date(expiryDate).getFullYear();
    const organizationName = 'Innorag';
    
    const linkedInUrl = new URL('https://www.linkedin.com/profile/add');
    linkedInUrl.searchParams.append('startTask', 'CERTIFICATION_NAME');
    linkedInUrl.searchParams.append('name', badgeName);
    linkedInUrl.searchParams.append('organizationName', organizationName);
    linkedInUrl.searchParams.append('issueYear', String(issueYear));
    linkedInUrl.searchParams.append('issueMonth', String(issueMonth));
    linkedInUrl.searchParams.append('expirationYear', String(expirationYear));
    linkedInUrl.searchParams.append('expirationMonth', String(expirationMonth));
    linkedInUrl.searchParams.append('certUrl', certUrl);
    linkedInUrl.searchParams.append('certId', credentialId);

    window.open(linkedInUrl.toString(), '_blank');
  };

  return (
    <div className="w-full">
      <div ref={certificateRef} className={`relative bg-gradient-to-br ${styles.gradient} p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden border-2 border-white/20`}>
        {isExpired && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-4 py-1 rounded-full flex items-center z-10">
                <AlertTriangle className="mr-2 h-4 w-4" /> EXPIRED
            </div>
        )}
        <Award size={120} className={`absolute -top-4 -right-4 opacity-10 ${styles.iconColor}`} strokeWidth={1} />
        <div className="relative text-center">
          <div className="mb-4">
            <span className={`inline-block bg-white/20 ${styles.textColor} text-sm font-bold px-4 py-1 rounded-full`}>
              {styles.name} Tier Certificate
            </span>
          </div>
          <h2 className={`text-4xl font-bold ${styles.textColor}`}>{badgeName}</h2>
          <p className={`mt-8 text-lg ${styles.textColor} opacity-90`}>This certifies that</p>
          <p className={`text-3xl font-extrabold my-2 text-white`}>{userName || 'Valued Learner'}</p>
          <p className={`text-lg ${styles.textColor} opacity-90`}>has successfully demonstrated the required skills.</p>
          <div className={`text-xs mt-10 ${styles.textColor} opacity-70`}>
            <p>Issued on: {issueDate ? new Date(issueDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            <p>Expires on: {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button onClick={handleAddToLinkedIn} className="bg-[#0077B5] hover:bg-[#006097] text-white">
            <Linkedin className="mr-2 h-4 w-4" /> Add to LinkedIn
        </Button>
        {credentialId && (
            <Button onClick={handleShare} variant="secondary">
                <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
        )}
        <Button onClick={handleDownload} variant="secondary">
            <Download className="mr-2 h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}