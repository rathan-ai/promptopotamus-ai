import { redirect } from 'next/navigation';

export default function PricingPage() {
  // Redirect to the simple purchase page since we no longer have packages
  redirect('/purchase');
}