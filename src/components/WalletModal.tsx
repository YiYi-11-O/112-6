import React, { useState } from 'react';
import { X, Ticket, Sparkles, Inbox } from 'lucide-react';
import { Voucher } from '../types';
import { VoucherCard } from './VoucherCard';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  onRedeem: (voucherId: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  vouchers,
  onRedeem,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'redeemed'>('all');

  if (!isOpen) return null;

  const filteredVouchers = vouchers.filter((v) => {
    if (filter === 'active') return !v.isRedeemed;
    if (filter === 'redeemed') return v.isRedeemed;
    return true;
  });

  const activeCount = vouchers.filter((v) => !v.isRedeemed).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                我的兌換券錢包
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black">
                    {activeCount} 張有效
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">本機已獲得之所有專屬防偽票券</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉錢包"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-zinc-900 flex items-center gap-2 bg-black/40">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'all'
                ? 'bg-zinc-800 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            全部 ({vouchers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'active'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            待使用 ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('redeemed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'redeemed'
                ? 'bg-zinc-800 text-zinc-300 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            已核銷 ({vouchers.length - activeCount})
          </button>
        </div>

        {/* Vouchers List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredVouchers.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                <Inbox className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-zinc-400">目前沒有兌換券</p>
              <p className="text-xs text-zinc-600 max-w-xs mx-auto">
                點選首頁「開始挑戰」並答對題目，即可獲取專屬防偽優惠券！
              </p>
            </div>
          ) : (
            filteredVouchers.map((v) => (
              <VoucherCard key={v.id} voucher={v} onRedeem={onRedeem} showRedeemButton={true} />
            ))
          )}
        </div>

        {/* Footer tip */}
        <div className="p-4 bg-zinc-900/40 border-t border-zinc-900 text-center">
          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500/70" />
            <span>票券流水號由雲端原子微粒生成，具唯一跨裝置防偽性</span>
          </p>
        </div>
      </div>
    </div>
  );
};
