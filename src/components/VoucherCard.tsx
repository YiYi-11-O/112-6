import React, { useState } from 'react';
import {
  Tag,
  Gift,
  Star,
  Trophy,
  Award,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Voucher, VoucherIcon, VoucherTheme } from '../types';

interface VoucherCardProps {
  voucher: Voucher;
  onRedeem?: (voucherId: string) => void;
  showRedeemButton?: boolean;
}

const themeStyles: Record<
  VoucherTheme,
  {
    border: string;
    badgeBg: string;
    badgeText: string;
    accentText: string;
    glow: string;
    bgGradient: string;
    serialBg: string;
  }
> = {
  gold: {
    border: 'border-amber-500/50',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    badgeText: 'text-amber-300',
    accentText: 'text-amber-400',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.18)]',
    bgGradient: 'from-amber-950/30 via-zinc-950 to-black',
    serialBg: 'bg-amber-950/60 text-amber-200 border-amber-600/40',
  },
  emerald: {
    border: 'border-emerald-500/50',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    badgeText: 'text-emerald-300',
    accentText: 'text-emerald-400',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.18)]',
    bgGradient: 'from-emerald-950/30 via-zinc-950 to-black',
    serialBg: 'bg-emerald-950/60 text-emerald-200 border-emerald-600/40',
  },
  purple: {
    border: 'border-purple-500/50',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    badgeText: 'text-purple-300',
    accentText: 'text-purple-400',
    glow: 'shadow-[0_0_30px_rgba(168,85,247,0.18)]',
    bgGradient: 'from-purple-950/30 via-zinc-950 to-black',
    serialBg: 'bg-purple-950/60 text-purple-200 border-purple-600/40',
  },
  coral: {
    border: 'border-rose-500/50',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    badgeText: 'text-rose-300',
    accentText: 'text-rose-400',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.18)]',
    bgGradient: 'from-rose-950/30 via-zinc-950 to-black',
    serialBg: 'bg-rose-950/60 text-rose-200 border-rose-600/40',
  },
  blue: {
    border: 'border-sky-500/50',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    badgeText: 'text-sky-300',
    accentText: 'text-sky-400',
    glow: 'shadow-[0_0_30px_rgba(14,165,233,0.18)]',
    bgGradient: 'from-sky-950/30 via-zinc-950 to-black',
    serialBg: 'bg-sky-950/60 text-sky-200 border-sky-600/40',
  },
};

export const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  onRedeem,
  showRedeemButton = true,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const theme = themeStyles[voucher.theme] || themeStyles.gold;

  const renderIcon = (iconName?: VoucherIcon) => {
    switch (iconName) {
      case 'gift':
        return <Gift className="w-6 h-6" />;
      case 'star':
        return <Star className="w-6 h-6" />;
      case 'award':
        return <Award className="w-6 h-6" />;
      case 'tag':
        return <Tag className="w-6 h-6" />;
      case 'trophy':
      default:
        return <Trophy className="w-6 h-6" />;
    }
  };

  const handleConfirmRedeem = () => {
    setShowConfirmModal(false);
    if (onRedeem) {
      onRedeem(voucher.id);
    }
  };

  return (
    <div className="relative w-full">
      {/* Outer Card */}
      <div
        className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.bgGradient} ${theme.glow} p-5 transition-all text-left`}
      >
        {/* Subtle decorative circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/[0.03] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/[0.03] pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              官方正品兌換憑證
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-900/90 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>數位防偽認證</span>
          </div>
        </div>

        {/* Voucher Content */}
        <div className="my-4 flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold uppercase border ${theme.badgeBg}`}
            >
              {voucher.discountBadge}
            </span>
            <h3 className="text-lg font-bold text-white tracking-wide">
              {voucher.discountTitle}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              通關題目：{voucher.questionTitle}
            </p>
          </div>

          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-900/90 border border-zinc-800 ${theme.accentText} shadow-inner`}
          >
            {renderIcon('trophy')}
          </div>
        </div>

        {/* Perforated ticket divider line */}
        <div className="relative my-3 -mx-5 flex items-center">
          <div className="w-4 h-8 bg-black rounded-r-full border-r border-t border-b border-zinc-800" />
          <div className="flex-1 border-t-2 border-dashed border-zinc-800/90 mx-2" />
          <div className="w-4 h-8 bg-black rounded-l-full border-l border-t border-b border-zinc-800" />
        </div>

        {/* Footer Area: Serial and Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-0.5">
            <p className="text-[10px] text-zinc-500">獲得時間</p>
            <p className="text-xs text-zinc-300 font-mono">
              {new Date(voucher.earnedAt).toLocaleString('zh-TW', {
                hour12: false,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Atomic Unique Serial Number Badge */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div
              className={`px-3 py-1 rounded-lg border font-mono font-bold text-sm tracking-wider shadow-sm ${theme.serialBg}`}
            >
              {voucher.serialNo}
            </div>
          </div>
        </div>

        {/* Redeemed Stamp or Action Button */}
        <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center justify-between">
          {voucher.isRedeemed ? (
            <div className="w-full py-2.5 px-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center gap-2 text-zinc-500 font-medium text-xs">
              <CheckCircle2 className="w-4 h-4 text-zinc-600" />
              <span>已核銷完成（作廢不可再使用）</span>
            </div>
          ) : (
            showRedeemButton && (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
              >
                <span>立即現場核銷使用</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">確認現場核銷此券？</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                核銷前請確認店員已檢視此券（流水號：{voucher.serialNo}
                ）。一旦按下確認核銷，本張兌換券將立即失效且無法復原。
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold"
              >
                取消返回
              </button>
              <button
                type="button"
                onClick={handleConfirmRedeem}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-950"
              >
                確定核銷
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
