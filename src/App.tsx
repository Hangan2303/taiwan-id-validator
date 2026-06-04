import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CreditCard, Building2 } from 'lucide-react';
import NationalIdPanel from './components/NationalIdPanel';
import BusinessNumberPanel from './components/BusinessNumberPanel';

type MainTab = 'national' | 'business';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('national');
  const [nationalPrefill, setNationalPrefill] = useState('');
  const [businessPrefill, setBusinessPrefill] = useState('');

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-primary text-on-primary px-6 py-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
              Taiwan ID Validator
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              National ID · New UI Number · Unified Business Number
            </p>
          </div>
        </div>
      </header>

      {/* Main tab bar */}
      <div className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex gap-1">
            {([
              ['national', 'National ID / New UI Number', CreditCard],
              ['business', 'Unified Business Number', Building2],
            ] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'national' ? (
            <motion.div
              key="national"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
            >
              {/* Info card */}
              <div className="mb-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant text-sm text-on-surface-variant space-y-1">
                <p><span className="font-semibold text-on-surface">National ID:</span> D1 = 1 (male) / 2 (female) · Modulo 10 checksum · 10 characters</p>
                <p><span className="font-semibold text-on-surface">New UI Number:</span> D1 = 8 (male) / 9 (female) · Same checksum · For foreign nationals</p>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                <NationalIdPanel
                  prefillId={nationalPrefill}
                  onVerifyGenerated={setNationalPrefill}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="business"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 p-4 rounded-xl bg-surface-container-low border border-outline-variant text-sm text-on-surface-variant space-y-1">
                <p><span className="font-semibold text-on-surface">Unified Business Number (統一編號):</span> 8 digits · Weights [1,2,1,2,1,2,4,1] · Modulo 5 checksum</p>
                <p><span className="font-semibold text-on-surface">D7 = 7 exception:</span> 7×4=28→10, treated as 1 or 0 — either sum passing modulo 5 makes the number valid.</p>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                <BusinessNumberPanel
                  prefillId={businessPrefill}
                  onVerifyGenerated={setBusinessPrefill}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 pb-8 text-center text-xs text-on-surface-variant/50">
        Taiwan National ID · New UI Number · Unified Business Number — checksum validation per ROC government specification
      </footer>
    </div>
  );
}
