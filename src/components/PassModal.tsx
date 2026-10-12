import React, { useState } from 'react';
import { X, Sparkles, Shield, Gamepad2, Award, Zap, Code2, Check, ArrowRight } from 'lucide-react';
import { Profile } from '../types';
import { SupabaseStore } from '../lib/supabase';
import { handlePaystackWebhookEvent } from '../api/webhooks/paystack';

interface PassModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onPassUpdated: (updatedProfile: Profile) => void;
}

export const PassModal: React.FC<PassModalProps> = ({
  isOpen,
  onClose,
  profile,
  onPassUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'perks' | 'webhook'>('perks');
  const [webhookLogs, setWebhookLogs] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const handleTogglePass = () => {
    const updated = SupabaseStore.toggleProPass();
    onPassUpdated(updated);
  };

  const handleSimulatePaystackWebhook = async () => {
    setIsSimulating(true);
    setWebhookLogs(null);

    // Mock incoming Paystack charge.success event payload
    const mockPayload = {
      event: 'charge.success',
      data: {
        id: Math.floor(Math.random() * 1000000),
        domain: 'live',
        status: 'success',
        reference: `pstk_ref_${Date.now()}`,
        amount: 2500000, // 25,000 NGN in kobo
        gateway_response: 'Successful',
        paid_at: new Date().toISOString(),
        channel: 'card',
        currency: 'NGN',
        customer: {
          id: 48291,
          email: `${profile.username.toLowerCase()}@sovereign.academy`,
        },
        metadata: {
          user_id: profile.id,
          username: profile.username,
          tier: 'sovereign_creator_pass',
        },
      },
    };

    try {
      const res = await handlePaystackWebhookEvent(
        JSON.stringify(mockPayload),
        'simulated_hmac_sha512_hash',
        'simulation_mode'
      );

      setWebhookLogs(JSON.stringify(res, null, 2));

      if (res.success && res.userId) {
        // Unlock user profile with has_pro_pass = TRUE
        const updated = SupabaseStore.setProPassExplicit(true);
        onPassUpdated(updated);
      }
    } catch (err: any) {
      setWebhookLogs(JSON.stringify({ error: err?.message || String(err) }, null, 2));
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0c1222] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border-b border-amber-800/40 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Sparkles className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                Full Access Gate
              </div>
              <h3 className="text-xl font-black text-slate-100">Sovereign Creator Pass</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('perks')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'perks'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pass Benefits &amp; Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('webhook')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'webhook'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Paystack Webhook Architecture</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm">
          {activeTab === 'perks' && (
            <>
              <p className="text-slate-300 leading-relaxed">
                Unlock advanced coding modules, capstone game projects, and verified digital certifications for aspiring young computer scientists.
              </p>

              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Included with Creator Pass:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-start gap-2.5">
                    <Gamepad2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Level 5 RPG Engine Quest</div>
                      <div className="text-slate-400 text-[11px]">Turn-based battle state machine</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Dedicated Pyodide Worker</div>
                      <div className="text-slate-400 text-[11px]">Zero UI thread stutters</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Verified Python Medal</div>
                      <div className="text-slate-400 text-[11px]">Cryptographic badge of completion</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">Offline-First Cloud Sync</div>
                      <div className="text-slate-400 text-[11px]">Zero progress loss on spotty WiFi</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Test Action */}
              <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-slate-400 text-xs">One-Time Student Lifetime Grant (Paystack)</div>
                  <div className="text-2xl font-black text-slate-100 font-mono">
                    ₦25,000 <span className="text-xs text-slate-400 font-normal">/ lifetime</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTogglePass}
                  className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all shadow-md ${
                    profile.has_pro_pass
                      ? 'bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  }`}
                >
                  {profile.has_pro_pass ? 'Deactivate Pass (Test Mode)' : 'Activate Pass (Instant Simulation)'}
                </button>
              </div>

              <div className="text-[11px] text-center text-slate-500">
                Current status: {profile.has_pro_pass ? 'Active Pass' : 'Standard Student Pass'} · Supabase RLS enforces tier gating.
              </div>
            </>
          )}

          {activeTab === 'webhook' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 mb-1">
                  Paystack Webhook Fulfillment Pipeline
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  When a payment completes, Paystack invokes <code className="text-amber-400 font-mono">POST /api/webhooks/paystack</code>. The endpoint verifies the <code className="text-sky-400 font-mono">x-paystack-signature</code> header via HMAC SHA512 against <code className="text-emerald-400 font-mono">PAYSTACK_SECRET_KEY</code>, extracts <code className="text-sky-300 font-mono">metadata.user_id</code>, and executes <code className="text-amber-300 font-mono">UPDATE profiles SET has_pro_pass = TRUE</code>.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-slate-500">// Event: charge.success</div>
                <div className="text-sky-400">Target User: {profile.id} ({profile.username})</div>
                <div className="text-amber-400">Currency: NGN (Kobo format: 2500000)</div>
                <div className="text-emerald-400">Granted Field: has_pro_pass = TRUE</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSimulatePaystackWebhook}
                  disabled={isSimulating}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {isSimulating ? (
                    <span>Processing Webhook...</span>
                  ) : (
                    <>
                      <span>Trigger Simulated Paystack Webhook</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {profile.has_pro_pass && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Check className="w-4 h-4" />
                    <span>User Unlocked</span>
                  </span>
                )}
              </div>

              {webhookLogs && (
                <div className="mt-3">
                  <div className="text-slate-400 font-bold mb-1">Paystack Webhook Dispatch Result:</div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-emerald-300 whitespace-pre-wrap">
                    {webhookLogs}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassModal;
