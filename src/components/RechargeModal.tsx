'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Wallet, QrCode, Copy, CheckCircle2, Loader2, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { gerarPixRecarga, checkTransactionStatus } from '@/app/actions/pagamentos';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_VALUES = [10, 20, 50, 100, 200];

export function RechargeModal({ isOpen, onClose, onSuccess }: RechargeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'select' | 'pay' | 'success'>('select');
  const [amount, setAmount] = useState<string>('50');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string; pixId: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Garantir que o portal só tente renderizar no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Resetar estado ao fechar/abrir
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setPixData(null);
      setLoading(false);
    }
  }, [isOpen]);

  // Polling para checar status do pagamento quando estiver na tela de 'pay'
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'pay' && pixData?.pixId) {
      interval = setInterval(async () => {
        const res = await checkTransactionStatus(pixData.pixId);
        if (res.status === 'COMPLETED') {
          setStep('success');
          if (onSuccess) onSuccess();

          // Dispara evento de conversão/purchase para o Google Analytics
          const addedAmount = parseFloat(amount.replace(',', '.'));
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'manual_event_PURCHASE', {
              value: isNaN(addedAmount) ? 0 : addedAmount,
              currency: 'BRL',
              transaction_id: pixData.pixId
            });
          }

          clearInterval(interval);
        }
      }, 5000); // Checa a cada 5 segundos
    }
    return () => clearInterval(interval);
  }, [step, pixData, onSuccess, amount]);

  const handleGeneratePix = async () => {
    const val = parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val < 5) {
      toast.error('Valor inválido. Mínimo R$ 5,00');
      return;
    }

    setLoading(true);
    const res = await gerarPixRecarga(val);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else if (res.success && res.qrCode) {
      setPixData({
        qrCode: res.qrCode,
        qrCodeBase64: res.qrCodeBase64 || '',
        pixId: res.pixId || ''
      });
      setStep('pay');
    }
  };

  const copyToClipboard = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      toast.success('Código Pix copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl text-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Recarregar Saldo</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          
          {step === 'select' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selecione o valor</label>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_VALUES.map(v => (
                    <button
                      key={v}
                      onClick={() => setAmount(v.toString())}
                      className={`py-3 px-4 rounded-xl border font-bold transition-all ${
                        amount === v.toString() 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/10'
                      }`}
                    >
                      R$ {v}
                    </button>
                  ))}
                  <div className="relative col-span-3">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                    <input 
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Outro valor"
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/70 leading-relaxed">
                  O saldo é adicionado instantaneamente após a confirmação do pagamento. O valor mínimo é de R$ 5,00.
                </p>
              </div>

              <button
                onClick={handleGeneratePix}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                Gerar PIX de Pagamento
              </button>
            </div>
          )}

          {step === 'pay' && pixData && (
            <div className="flex flex-col items-center text-center space-y-6 py-2">
              <div className="relative p-4 bg-white rounded-3xl shadow-2xl">
                <img 
                  src={pixData.qrCodeBase64} 
                  alt="QR Code Pix" 
                  className="w-48 h-48"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/5 transition-opacity rounded-3xl" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Escaneie o QR Code</h3>
                <p className="text-sm text-slate-400">Ou use o botão abaixo para copiar o código</p>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={copyToClipboard}
                  className={`w-full py-4 rounded-2xl border flex items-center justify-center gap-3 font-bold transition-all ${
                    copied 
                      ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Código Copiado!' : 'Copiar Código Pix'}
                </button>

                <div className="flex items-center justify-center gap-3 text-slate-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-medium tracking-wide uppercase">Aguardando Pagamento...</span>
                </div>
              </div>

              <button
                onClick={() => setStep('select')}
                className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-4"
              >
                Voltar e escolher outro valor
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center text-center space-y-6 py-8 animate-in zoom-in-90 duration-500">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">Pagamento Confirmado!</h3>
                <p className="text-slate-400">Sua recarga de <span className="text-green-400 font-bold">R$ {amount}</span> já está disponível em seu saldo.</p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Excelente, vamos lá!
              </button>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
