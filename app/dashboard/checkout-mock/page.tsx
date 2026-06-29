'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, CreditCard, Lock, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CheckoutMockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPlan = searchParams.get('plan') || 'pro';
  const plan = rawPlan === 'enterprise' ? 'enterprise' : 'pro';

  const [isLoading, setIsLoading] = React.useState(false);
  const [cardNumber, setCardNumber] = React.useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = React.useState('12/28');
  const [cvc, setCvc] = React.useState('***');
  const [cardName, setCardName] = React.useState('');

  const isPro = plan === 'pro';
  const price = isPro ? 49 : 199;
  const planName = isPro ? 'Pro Recruiter Plan' : 'Enterprise Plan';
  const description = isPro 
    ? '100 AI voice interviews/mo, advanced analytics & custom email templates.' 
    : 'Unlimited AI voice interviews/mo, custom voice coach & 24/7 dedicated support.';

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/stripe/mock-success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Success! Upgraded to ${planName}.`);
        setTimeout(() => {
          router.push(`/dashboard?payment=success&plan=${plan}`);
        }, 1500);
      } else {
        toast.error(data.error || 'Payment processing failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during payment processing.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center p-4 md:p-8">
      {/* Back button */}
      <button 
        onClick={() => router.push('/dashboard')}
        className="self-start flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-semibold mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancel and return to vocalHire
      </button>

      {/* Main Checkout container */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
        
        {/* Left Side: Order summary */}
        <div className="p-8 md:p-12 bg-zinc-900/40 border-r border-zinc-800 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Secure Payment Gateway</p>
                <p className="text-sm font-bold text-white leading-none mt-1">vocalHire Billing</p>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Subscription Plan</span>
              <div>
                <h2 className="text-2xl font-black text-white">{planName}</h2>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed">{description}</p>
              </div>

              <div className="pt-6 border-t border-zinc-800 space-y-3">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Subtotal</span>
                  <span>${price.toFixed(2)} / month</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>VAT / Sales Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-zinc-800/80">
                  <span className="text-sm font-bold text-white">Amount due today</span>
                  <span className="text-2xl font-black text-white">${price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800/60 flex items-center gap-2.5 text-[10px] text-zinc-500">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            <span>Guaranteed secure payment. This is a sandbox demonstration page simulating Stripe hosted checkout.</span>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="p-8 md:p-12 flex flex-col justify-between bg-zinc-950">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Payment Details</h3>
            <p className="text-xs text-zinc-400 mb-6 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-zinc-500" />
              Your credentials are simulated and processed securely.
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Email Address</label>
                <Input 
                  type="email" 
                  disabled
                  value="User Email (Auto-filled)"
                  className="bg-zinc-900 border-zinc-800 text-zinc-500 h-10 text-xs rounded-lg cursor-not-allowed opacity-80"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Card Information</label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700 h-10 text-xs rounded-lg pr-10"
                    required
                  />
                  <CreditCard className="absolute right-3.5 top-3 h-4 w-4 text-zinc-500" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Input 
                    type="text" 
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM / YY"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700 h-10 text-xs rounded-lg text-center"
                    required
                  />
                  <Input 
                    type="text" 
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="CVC"
                    className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700 h-10 text-xs rounded-lg text-center"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-zinc-400">Cardholder Name</label>
                <Input 
                  type="text" 
                  placeholder="e.g. Sarah Johnson"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-purple-500 placeholder-zinc-700 h-10 text-xs rounded-lg"
                  required
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 text-xs rounded-xl flex items-center justify-center gap-2 border-0 shadow-lg shadow-purple-600/10 cursor-pointer active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                      Processing payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4.5 w-4.5" />
                      Pay ${price.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-zinc-650">
              By completing purchase, you agree to our Terms of Service. Sandbox payment generates no actual bank charges.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
