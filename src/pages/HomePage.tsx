import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import LoginModal from '@/components/auth/LoginModal';
import SignupModal from '@/components/auth/SignupModal';

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Fade in on scroll observer
      const elements = document.querySelectorAll('.fade-in-scroll');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.85;
        if (isVisible) {
          el.classList.add('visible');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen -mt-6 -mx-4 sm:-mx-6 -mb-24">
      {/* Floating Auth Buttons - Top Right */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 sm:gap-3 animate-fade-in">
        <Button
          variant="outline"
          onClick={() => setShowLogin(true)}
          className="rounded-full shadow-soft-lg hover:shadow-glow backdrop-blur-xl bg-white/90 border-border/50 text-sm sm:text-base px-4 sm:px-6"
        >
          Log In
        </Button>
        <Button
          onClick={() => setShowSignup(true)}
          className="rounded-full shadow-soft-lg hover:shadow-glow text-sm sm:text-base px-4 sm:px-6"
        >
          Sign Up
        </Button>
      </div>

      {/* Hero Section - Light with parallax */}
      <section className="relative min-h-screen flex items-center justify-center section-light parallax-container overflow-hidden">
        {/* Floating decorative elements */}
        <div
          className="absolute top-20 right-[10%] w-24 h-24 rounded-full bg-soft-yellow opacity-60 float-element"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute bottom-32 left-[15%] w-32 h-32 rounded-full bg-soft-pink opacity-50 float-element"
          style={{ animationDelay: '2s', transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div
          className="absolute top-1/3 right-[20%] w-16 h-16 rounded-xl bg-primary/10 rotate-12 float-element"
          style={{ animationDelay: '4s', transform: `translateY(${scrollY * 0.25}px) rotate(${scrollY * 0.05}deg)` }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20 text-center">
          <h1 className="display-heading text-6xl sm:text-7xl md:text-8xl mb-8 animate-fade-in">
            Career Fair Buddy
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-12 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in"
             style={{ animationDelay: '0.2s' }}>
            Digitize your career fair journey with elegance and precision
          </p>
          <Button
            size="lg"
            onClick={() => setShowSignup(true)}
            className="px-12 py-7 text-lg rounded-full shadow-soft-lg hover:shadow-glow animate-scale-in"
            style={{ animationDelay: '0.4s' }}
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* Feature Section 1 - Dark Background */}
      <section className="section-dark py-28 sm:py-40 fade-in-scroll">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="display-heading text-5xl sm:text-6xl" style={{ color: 'var(--cream)' }}>
                Organized preparation.
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Pre-event checklists ensure you're impeccably ready: resumes polished, outfit chosen, elevator pitch rehearsed. Every detail, perfected.
              </p>
            </div>
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-soft-lg">
              <img
                src="/organized-prep.png"
                alt="Organized preparation"
                className="w-full h-full object-contain p-8 bg-gradient-to-br from-primary/20 to-accent/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - Royal Blue */}
      <section className="section-royal py-28 sm:py-40 fade-in-scroll">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-soft-lg order-2 md:order-1">
              <img
                src="/scan-extract.png"
                alt="Scan and extract"
                className="w-full h-full object-contain p-8 bg-white/10 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="display-heading text-5xl sm:text-6xl" style={{ color: 'var(--cream)' }}>
                Scan and extract.
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Capture company flyers and business cards instantly. Our intelligent system auto-extracts information with remarkable precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3 - Light */}
      <section className="section-light py-28 sm:py-40 fade-in-scroll">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="display-heading text-5xl sm:text-6xl">
                Smart follow-up.
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Track thank-you emails, monitor application status, and maintain connections effortlessly. Never miss an opportunity.
              </p>
            </div>
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-soft-lg">
              <img
                src="/followups.png"
                alt="Smart follow-up"
                className="w-full h-full object-contain p-8 bg-gradient-to-br from-secondary/30 to-accent/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Dark */}
      <section className="section-dark py-32 sm:py-48 fade-in-scroll">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-8">
          <h2 className="display-heading text-5xl sm:text-6xl md:text-7xl" style={{ color: 'var(--cream)' }}>
            Use Career Fair Buddy today.
          </h2>
          <p className="text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            You're just one step away from managing your career fair experience with unprecedented elegance and efficiency.
          </p>
          <Button
            size="lg"
            onClick={() => setShowSignup(true)}
            className="px-12 py-7 text-lg rounded-full shadow-soft-lg hover:shadow-glow bg-white text-near-black hover:bg-gray-100"
          >
            Create Your Free Account
          </Button>
        </div>
      </section>

      {/* Final CTA - Royal Blue */}
      <section className="section-royal py-32 sm:py-48 fade-in-scroll">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center space-y-8">
          <h2 className="display-heading text-5xl sm:text-6xl md:text-7xl" style={{ color: 'var(--cream)' }}>
            Ready to get organized?
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed">
            Start your free trial today. No credit card needed.
          </p>
          <Button
            size="lg"
            onClick={() => setShowSignup(true)}
            className="px-12 py-7 text-lg rounded-full shadow-soft-lg hover:shadow-glow bg-white text-near-black hover:bg-gray-100"
          >
            Create Your Free Account
          </Button>
        </div>
      </section>

      {/* Footer - Dark */}
      <footer className="section-dark border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-bold mb-6 text-lg" style={{ color: 'var(--cream)' }}>About</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="elegant-link hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="elegant-link hover:text-white transition-colors">How it works</a></li>
                <li><a href="#" className="elegant-link hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-6 text-lg" style={{ color: 'var(--cream)' }}>Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="elegant-link hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="elegant-link hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="elegant-link hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-6 text-lg" style={{ color: 'var(--cream)' }}>Legal</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="elegant-link hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="elegant-link hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="elegant-link hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-6 text-lg" style={{ color: 'var(--cream)' }}>Connect</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="elegant-link hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="elegant-link hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="elegant-link hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-400">
            <p>© 2025 Career Fair Buddy. All rights reserved.</p>
            <button
              onClick={() => setShowLogin(true)}
              className="elegant-link hover:text-white font-medium transition-colors"
            >
              Already have an account? Log in
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSwitchToSignup={() => { setShowLogin(false); setShowSignup(true); }} />
      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} onSwitchToLogin={() => { setShowSignup(false); setShowLogin(true); }} />
    </div>
  );
}
