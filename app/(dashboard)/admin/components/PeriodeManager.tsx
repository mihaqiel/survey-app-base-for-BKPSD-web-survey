"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus, Check, Power, PowerOff, Loader2, Copy, ExternalLink } from "lucide-react";

interface Periode {
  id: string;
  label: string;
  token: string;
  status: string;
  createdAt?: string;
}

interface Props {
  activePeriode: Periode | null;
  allPeriodes: Periode[];
}

function generateToken(label: string): string {
  const slug = label.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 20);
  const random = Math.random().toString(36).slice(2, 8);
  const year = new Date().getFullYear();
  return `skm-${slug}-${year}-${random}`;
}

export default function PeriodeManager({ activePeriode, allPeriodes }: Props) {
  const [periodes, setPeriodes]   = useState<Periode[]>(allPeriodes);
  const [active, setActive]       = useState<Periode | null>(activePeriode);
  const [showForm, setShowForm]   = useState(false);
  const [label, setLabel]         = useState("");
  const [copied, setCopied]       = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [surveyBase, setSurveyBase] = useState("/enter?token=");

  useEffect(() => {
    setSurveyBase(`${window.location.origin}/enter?token=`);
  }, []);

  const handleCreate = () => {
    if (!label.trim()) return;
    const token = generateToken(label);
    startTransition(async () => {
      const res = await fetch("/api/periode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim(), token }),
      });
      if (res.ok) window.location.reload();
    });
  };

  const handleToggle = (id: string, currentStatus: string) => {
    startTransition(async () => {
      if (currentStatus === "AKTIF") {
        // Deactivate
        await fetch(`/api/periode/${id}/deactivate`, { method: "POST" });
      } else {
        // Activate (deactivates all others)
        await fetch(`/api/periode/${id}/activate`, { method: "POST" });
      }
      window.location.reload();
    });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="p-5 space-y-4">

      {/* Period list */}
      {periodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Belum ada periode</p>
        </div>
      ) : (
        <div className="space-y-2">
          {periodes.map(p => {
            const isActive  = p.status === "AKTIF";
            const surveyUrl = `${surveyBase}${p.token}`;
            return (
              <div key={p.id} className={`border overflow-hidden transition-all ${
                isActive ? "border-[#009CC5] bg-sky-50" : "border-gray-200 bg-white"
              }`}>
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[11px] font-black text-[#132B4F] truncate">{p.label}</p>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[8px] font-black text-[#009CC5] uppercase tracking-widest bg-sky-100 px-2 py-0.5">
                          <Check className="w-2.5 h-2.5" />Aktif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] font-mono text-gray-400 truncate max-w-[160px]">{p.token}</p>
                      <button
                        onClick={() => copyToClipboard(p.token, `token-${p.id}`)}
                        className="text-gray-300 hover:text-[#009CC5] transition-colors"
                        title="Copy token"
                      >
                        {copied === `token-${p.id}`
                          ? <Check className="w-3 h-3 text-green-500" />
                          : <Copy className="w-3 h-3" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Copy survey link */}
                    <button
                      onClick={() => copyToClipboard(surveyUrl, `link-${p.id}`)}
                      title="Copy link survei"
                      className="flex items-center gap-1 px-2 py-1.5 border border-gray-200 text-[9px] font-black text-gray-500 hover:bg-[#F0F4F8] transition-all">
                      {copied === `link-${p.id}` ? <Check className="w-3 h-3 text-green-500" /> : <ExternalLink className="w-3 h-3" />}
                      Link
                    </button>

                    {/* Toggle active/inactive */}
                    <button
                      onClick={() => handleToggle(p.id, p.status)}
                      disabled={isPending}
                      className={`flex items-center gap-1 px-2 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all disabled:opacity-40 ${
                        isActive
                          ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                          : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> :
                        isActive
                          ? <><PowerOff className="w-3 h-3" />Nonaktifkan</>
                          : <><Power className="w-3 h-3" />Aktifkan</>
                      }
                    </button>
                  </div>
                </div>

                {/* Survey URL bar */}
                {isActive && (
                  <div className="px-4 py-2 bg-[#132B4F] flex items-center gap-2">
                    <p className="text-[9px] font-mono text-white/50 truncate flex-1">{surveyUrl}</p>
                    <a href={surveyUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[9px] font-black text-[#FAE705] hover:text-white uppercase tracking-widest transition-colors shrink-0">
                      Buka →
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add new period */}
      {showForm ? (
        <div className="border border-gray-200 p-4 space-y-3 bg-[#F8FAFC]">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Periode Baru</p>
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
              Label Periode <span className="text-red-400">*</span>
            </label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)}
              title="Label Periode" placeholder="e.g. SKM Semester 1 2026"
              className="w-full px-3 py-2.5 bg-white border-2 border-transparent focus:border-[#009CC5] text-sm font-bold text-[#132B4F] placeholder-gray-300 outline-none transition-all" />
            {label && (
              <p className="text-[9px] font-mono text-gray-400 mt-1.5">
                Token otomatis: <span className="text-[#009CC5]">{generateToken(label)}</span>
              </p>
            )}
          </div>
          <p className="text-[9px] text-gray-400">Token akses akan dibuat otomatis oleh sistem.</p>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!label.trim() || isPending}
              className="flex-1 py-2.5 bg-[#132B4F] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#009CC5] disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              {isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Membuat...</> : <><Plus className="w-3.5 h-3.5" />Buat Periode</>}
            </button>
            <button onClick={() => { setShowForm(false); setLabel(""); }}
              className="px-4 py-2.5 border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
              Batal
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full py-2.5 border-2 border-dashed border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:border-[#009CC5] hover:text-[#009CC5] transition-all flex items-center justify-center gap-2">
          <Plus className="w-3.5 h-3.5" />Tambah Periode Baru
        </button>
      )}
    </div>
  );
}