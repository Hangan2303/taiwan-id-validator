import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Zap, CheckCircle2, XCircle, Copy, Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import type { IdType, NationalIdValidationResult, NationalIdGenerationResult } from '../lib/nationalId';
import { validateNationalId, generateNationalId } from '../lib/nationalId';

interface Props {
  prefillId?: string;
  onVerifyGenerated?: (id: string) => void;
}

type SubTab = 'validate' | 'generate';

function CalcTable({ steps, total }: { steps: NationalIdValidationResult['steps']; total: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr className="bg-surface-container-low">
            {['Position', 'Value', 'Weight', 'Contribution'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 first:rounded-tl-xl last:rounded-tr-xl">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {steps.map((step, i) => (
            <tr key={i} className="border-t border-outline-variant hover:bg-surface-container-low/60 transition-colors">
              <td className="px-4 py-2.5 font-mono text-xs text-on-surface-variant">{step.position}</td>
              <td className="px-4 py-2.5 font-mono font-bold text-on-surface">{step.value}</td>
              <td className="px-4 py-2.5 font-mono text-on-surface-variant">×{step.weight}</td>
              <td className="px-4 py-2.5 font-mono font-semibold text-primary">{step.contribution}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-surface-container-low border-t-2 border-outline-variant">
            <td colSpan={3} className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant rounded-bl-xl">
              Total S
            </td>
            <td className="px-4 py-3 font-mono font-bold text-on-surface rounded-br-xl">
              {total} &nbsp;
              <span className="text-on-surface-variant font-normal">({total} % 10 = <span className={total % 10 === 0 ? 'text-green-600 font-bold' : 'text-error font-bold'}>{total % 10}</span>)</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
    </button>
  );
}

export default function NationalIdPanel({ prefillId, onVerifyGenerated }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('validate');
  const [idType, setIdType] = useState<IdType>('national');
  const [input, setInput] = useState('');
  const [validateResult, setValidateResult] = useState<NationalIdValidationResult | null>(null);
  const [generateResult, setGenerateResult] = useState<NationalIdGenerationResult | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (prefillId) {
      setInput(prefillId);
      setSubTab('validate');
      setValidateResult(validateNationalId(prefillId));
    }
  }, [prefillId]);

  const handleValidate = () => {
    setValidateResult(validateNationalId(input));
  };

  const handleGenerate = () => {
    const result = generateNationalId(idType);
    setGenerateResult(result);
    setShowSteps(false);
  };

  const handleVerifyGenerated = () => {
    if (generateResult) {
      onVerifyGenerated?.(generateResult.id);
      setInput(generateResult.id);
      setSubTab('validate');
      setValidateResult(validateNationalId(generateResult.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab bar */}
      <div className="flex gap-2 bg-surface-container-high rounded-xl p-1">
        {([['validate', 'Validate', Search], ['generate', 'Generate', Zap]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              subTab === key
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'validate' ? (
          <motion.div key="validate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Enter National ID or New UI Number
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => {
                    setInput(e.target.value.toUpperCase());
                    setValidateResult(null);
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleValidate()}
                  maxLength={10}
                  placeholder="e.g. A123456789"
                  className="flex-1 font-mono text-lg px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all tracking-widest placeholder:text-on-surface-variant/30 placeholder:text-base placeholder:font-sans placeholder:tracking-normal"
                />
                <button
                  onClick={handleValidate}
                  className="px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary-container transition-colors"
                >
                  Validate
                </button>
              </div>
            </div>

            <AnimatePresence>
              {validateResult && (
                <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
                  {validateResult.error ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700">
                      <XCircle size={20} className="shrink-0" />
                      <span className="text-sm font-medium">{validateResult.error}</span>
                    </div>
                  ) : (
                    <>
                      <div className={`flex items-center gap-4 p-5 rounded-xl border ${validateResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        {validateResult.valid
                          ? <CheckCircle2 size={32} className="text-green-600 shrink-0" />
                          : <XCircle size={32} className="text-red-600 shrink-0" />}
                        <div>
                          <div className={`text-xl font-extrabold font-display ${validateResult.valid ? 'text-green-700' : 'text-red-700'}`}>
                            {validateResult.valid ? 'VALID' : 'INVALID'}
                          </div>
                          <div className="text-sm mt-0.5 text-on-surface-variant">
                            {validateResult.idType === 'national' ? 'National ID Card (ROC)' : 'New UI Number (Foreign National)'}
                            {' · '}
                            {input[1] === '1' || input[1] === '8' ? 'Male' : 'Female'}
                          </div>
                        </div>
                      </div>
                      <CalcTable steps={validateResult.steps} total={validateResult.total} />
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div key="generate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-5">
            {/* ID type toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                ID Type
              </label>
              <div className="flex gap-2 bg-surface-container-high rounded-xl p-1 w-fit">
                {([['national', 'National ID'], ['newui', 'New UI Number']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setIdType(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      idType === key
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-on-surface-variant/70">
                {idType === 'national' ? 'D1 = 1 (male) or 2 (female)' : 'D1 = 8 (male) or 9 (female)'}
              </p>
            </div>

            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:bg-primary-container transition-colors"
            >
              <RefreshCw size={15} />
              Generate
            </button>

            <AnimatePresence>
              {generateResult && (
                <motion.div key="gen-result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* ID display */}
                  <div className="flex items-center gap-3 p-5 bg-surface-container-lowest rounded-xl border border-outline-variant">
                    <span className="flex-1 font-mono text-2xl font-bold tracking-[0.2em] text-on-surface text-center">
                      {generateResult.id}
                    </span>
                    <CopyButton text={generateResult.id} />
                  </div>

                  <div className="flex gap-3">
                    {/* Verify button */}
                    <button
                      onClick={handleVerifyGenerated}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <Search size={14} />
                      Verify this ID
                    </button>

                    {/* Show/hide steps */}
                    <button
                      onClick={() => setShowSteps(v => !v)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
                    >
                      {showSteps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {showSteps ? 'Hide' : 'Show'} Calculation
                    </button>
                  </div>

                  <AnimatePresence>
                    {showSteps && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                        <CalcTable steps={generateResult.steps} total={generateResult.total} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
