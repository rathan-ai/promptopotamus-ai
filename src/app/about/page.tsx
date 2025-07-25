import { Metadata } from 'next';
import { Brain, Target, Users, Award, Heart, Lightbulb, Rocket, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About Us - Promptopotamus',
  description: 'Learn about Promptopotamus, our mission to democratize AI prompt engineering, and the team behind the platform.',
};

const teamMembers = [
  {
    name: 'Alex Chen',
    role: 'CEO & Founder',
    bio: 'Former AI researcher at Google, passionate about making AI accessible to everyone.',
    image: '/team/alex.jpg'
  },
  {
    name: 'Sarah Johnson',
    role: 'Head of Product',
    bio: 'Product leader with 10+ years building developer tools and educational platforms.',
    image: '/team/sarah.jpg'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Lead Engineer',
    bio: 'Full-stack engineer specializing in AI/ML applications and scalable systems.',
    image: '/team/marcus.jpg'
  },
  {
    name: 'Dr. Emily Watson',
    role: 'Head of Education',
    bio: 'Former Stanford professor, expert in AI education and curriculum development.',
    image: '/team/emily.jpg'
  }
];

const values = [
  {
    icon: Brain,
    title: 'Innovation First',
    description: 'We continuously push the boundaries of what\'s possible with AI prompting and education.'
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Our platform is built by and for the prompt engineering community.'
  },
  {
    icon: Shield,
    title: 'Quality & Safety',
    description: 'Every prompt is reviewed for quality, safety, and educational value.'
  },
  {
    icon: Heart,
    title: 'Accessible Learning',
    description: 'We believe everyone should have access to high-quality AI education.'
  }
];

export default function AboutPage() {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-900/10 dark:via-purple-900/5 dark:to-pink-900/10 rounded-3xl -z-10"></div>
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-display gradient-text mb-6">
            About Promptopotamus
          </h1>
          <p className="text-body-large text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
            We're on a mission to democratize AI prompt engineering education and create the world's largest 
            marketplace for high-quality Smart Prompts. Our platform empowers individuals and organizations 
            to harness the full potential of artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/smart-prompts">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Brain className="w-5 h-5 mr-2" />
                Explore Our Platform
              </Button>
            </Link>
            <Link href="/certificates">
              <Button size="lg" variant="outline">
                <Award className="w-5 h-5 mr-2" />
                Get Certified
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-8 rounded-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
              To make AI prompt engineering accessible to everyone through comprehensive education, 
              professional certification, and a thriving marketplace of high-quality Smart Prompts. 
              We believe that effective AI communication should be a skill available to all.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
              A world where every professional can effectively communicate with AI systems, 
              accelerating innovation and productivity across all industries. We envision 
              Promptopotamus as the global standard for prompt engineering education and certification.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-h1 text-neutral-900 dark:text-white mb-6">Our Story</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mb-8"></div>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-body-large text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
            Promptopotamus was born from a simple observation: while AI models were becoming incredibly powerful, 
            most people struggled to communicate effectively with them. Our founders, having worked at the forefront 
            of AI research and education, recognized that prompt engineering was becoming a critical skill for the future.
          </p>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
            In 2023, we launched with a vision to bridge this gap. What started as a collection of educational 
            resources has grown into a comprehensive platform featuring interactive tools, professional certifications, 
            and a thriving marketplace where certified creators share their expertise.
          </p>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Today, Promptopotamus serves over 10,000 active users worldwide, from students learning their first 
            prompts to enterprise teams optimizing complex AI workflows. Our community has created over 50,000 
            prompts and earned more than 1,200 professional certifications.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-h1 text-neutral-900 dark:text-white mb-6">Our Values</h2>
            <p className="text-body-large text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              These core principles guide everything we do, from product development to community building.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 hover:scale-105 transition-transform duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-h4 text-neutral-900 dark:text-white mb-4">{value.title}</h3>
                  <p className="text-body text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-h1 text-neutral-900 dark:text-white mb-6">Meet Our Team</h2>
          <p className="text-body-large text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            We're a diverse team of AI researchers, educators, and engineers passionate about 
            making AI accessible to everyone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Users className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-h4 text-neutral-900 dark:text-white mb-2">{member.name}</h3>
              <p className="text-small font-medium text-indigo-600 dark:text-indigo-400 mb-3">{member.role}</p>
              <p className="text-small text-neutral-600 dark:text-neutral-400 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Join Us */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 py-24 rounded-2xl mx-6">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-h1 text-neutral-900 dark:text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-body-large text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Ready to become part of the AI revolution? Whether you're just starting out or looking to 
            advance your career, we have the tools and community to help you succeed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/smart-prompts">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Start Learning Today
              </Button>
            </Link>
            <Link href="mailto:careers@promptopotamus.com">
              <Button size="lg" variant="outline">
                <Lightbulb className="w-5 h-5 mr-2" />
                Join Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}