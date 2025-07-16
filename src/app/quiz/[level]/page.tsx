import Quiz from '@/components/Quiz';
import type { Metadata } from 'next';

const levelTitleMap: Record<string, string> = {
    'beginner': 'Promptling: Beginner Certification Exam',
    'intermediate': 'Promptosaur: Intermediate Certification Exam',
    'master': 'Promptopotamus: Master Certification Exam'
};

export async function generateMetadata({ params }: { params: { level: string } }): Promise<Metadata> {
    const title = levelTitleMap[params.level] || 'Certification Exam';
    return {
        title: title,
        description: `Take the ${params.level} certification exam on AI prompt engineering.`,
    };
}

export default function ExamPage({ params }: { params: { level: string } }) {
  return (
    <div className="max-w-4xl mx-auto">
        <Quiz level={params.level} />
    </div>
  );
}