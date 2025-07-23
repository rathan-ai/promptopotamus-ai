'use client';

import { useRef } from 'react';
import { Award, Share2, Download, Linkedin, AlertTriangle } from 'lucide-react';
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
  'Beginner': {
    name: 'Bronze',
    gradient: 'from-orange-600 to-amber-700',
    textColor: 'text-amber-100',
    iconColor: 'text-amber-200',
  },
  'Intermediate': {
    name: 'Silver',
    gradient: 'from-slate-400 to-slate-600',
    textColor: 'text-slate-100',
    iconColor: 'text-slate-200',
  },
  'Master': {
    name: 'Gold',
    gradient: 'from-yellow-500 to-yellow-600',
    textColor: 'text-yellow-100',
    iconColor: 'text-yellow-200',
  },
};

export default function CertificateDisplay({ level, badgeName, userName, credentialId, issueDate, expiryDate }: CertificateDisplayProps) {
  const styles = levelStyles[level];
  const certificateRef = useRef<HTMLDivElement>(null);
  const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;
  
  const handleShare = () => {
    if (credentialId) {
      const url = `${window.location.origin}/certificates/view/${credentialId}`;
      navigator.clipboard.writeText(url);
      toast.success('Certificate URL copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (certificateRef.current) {
      html2canvas(certificateRef.current, { 
        scale: 2,
        backgroundColor: null,
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `Promptopotamus_Certificate_${userName.replace(/\s/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const handleAddToLinkedIn = () => {
    if (!credentialId) return;
    
    const certUrl = `${window.location.origin}/certificates/view/${credentialId}`;
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(badgeName)}&organizationName=Promptopotamus&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}&certUrl=${encodeURIComponent(certUrl)}`;
    
    window.open(linkedInUrl, '_blank');
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
          
          {/* Expiry Date - Prominent Display */}
          {expiryDate && (
            <div className={`mt-6 p-3 rounded-lg border ${isExpired 
              ? 'bg-red-100/20 border-red-300/50 dark:bg-red-900/20 dark:border-red-600/50' 
              : 'bg-white/10 border-white/20'
            }`}>
              <p className={`text-sm font-semibold ${isExpired ? 'text-red-200' : styles.textColor}`}>
                {isExpired ? '⚠️ Certificate Expired' : '✓ Valid Until'}
              </p>
              <p className={`text-lg font-bold ${isExpired ? 'text-red-100' : 'text-white'}`}>
                {new Date(expiryDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          )}
          
          <div className={`text-xs mt-6 ${styles.textColor} opacity-70 space-y-1`}>
            <p className="font-medium">Created by Innorag Technologies Private Limited</p>
            <p>Issued on: {issueDate ? new Date(issueDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            {credentialId && <p>Credential ID: {credentialId}</p>}
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {credentialId && (
          <Button onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" /> Share Certificate
          </Button>
        )}
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Download PNG
        </Button>
        {credentialId && (
          <Button onClick={handleAddToLinkedIn} className="flex items-center gap-2">
            <Linkedin className="h-4 w-4" /> Add to LinkedIn
          </Button>
        )}
      </div>
    </div>
  );
}