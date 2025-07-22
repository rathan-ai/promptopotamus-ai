import Quiz from '@/components/Quiz';
import type { Metadata } from 'next';

const levelTitleMap: Record<string, string> = {
    'beginner': 'Promptling: Beginner Certification Exam',
    'intermediate': 'Promptosaur: Intermediate Certification Exam',
    'master': 'Promptopotamus: Master Certification Exam'
};

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
    const { level } = await params;
    const title = levelTitleMap[level] || 'Certification Exam';
    return {
        title: title,
        description: `Take the ${level} certification exam on AI prompt engineering.`,
    };
}

export default async function ExamPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  return (
    <div className="max-w-4xl mx-auto">
        <Quiz level={level} />
    </div>
  );
}