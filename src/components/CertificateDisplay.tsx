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

const levelStyles = { /* ... styles remain the same ... */ };

export default function CertificateDisplay({ level, badgeName, userName, credentialId, issueDate, expiryDate }: CertificateDisplayProps) {
  const styles = levelStyles[level];
  const certificateRef = useRef<HTMLDivElement>(null);
  const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;
  
  const handleShare = () => { /* ... function remains the same ... */ };
  const handleDownload = () => { /* ... function remains the same ... */ };
  const handleAddToLinkedIn = () => { /* ... function remains the same ... */ };

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
        {/* ... Buttons remain the same ... */}
      </div>
    </div>
  );
}