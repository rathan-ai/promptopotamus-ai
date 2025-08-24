import { redirect } from 'next/navigation';

export default function PricingPage() {
  // Redirect to Smart Prompts marketplace since we use individual pay-once pricing
  redirect('/smart-prompts');
}