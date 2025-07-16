import Link from 'next/link';
import { certificates, type Certificate } from '@/lib/data';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Certification Exams',
  description: 'Test your prompt engineering knowledge and earn a certificate.',
};

const CertificateCard = ({ cert }: { cert: Certificate }) => (
    <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 transition-transform hover:scale-105">
        <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{cert.badgeName}</h3>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">{cert.description}</p>
        <div className="mt-4">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${cert.level === 'Beginner' ? 'bg-green-500/10 text-green-500' : cert.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                {cert.level}
            </span>
        </div>
        <Link href={`/certificates/${cert.slug}`} passHref>
            <Button asChild className="w-full mt-6">
              <a>View Details & Start Exam</a>
            </Button> 
        </Link>
    </div>
);

export default function CertificatesPage() {
    const certs = Object.values(certificates);
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-center mb-2 dark:text-white">Certification Exams</h1> 
            <p className="text-center text-lg text-neutral-600 dark:text-neutral-400 mb-12">Test your knowledge and earn a badge to certify your skills.</p>
            <div className="grid md:grid-cols-1 gap-8">
                {certs.map(cert => <CertificateCard key={cert.slug} cert={cert} />)}
            </div>
        </div>
    );
}