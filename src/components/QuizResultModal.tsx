import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowRight,
  ImageIcon,
} from 'lucide-react';
import { Question, Voucher } from '../types';
import { VoucherCard } from './VoucherCard';
import { ImageLightbox } from './ImageLightbox';

interface QuizResultModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  question: Question;
  userAnswer: string;
  voucher?: Voucher | null;
  onClose: () => void;
  onViewWallet?: () => void;
  onRedeemVoucher?: (voucherId: string) => void;
}

export const QuizResultModal: React.FC<QuizResultModalProps> = ({
  isOpen,
  isCorrect,
  question,
  userAnswer,
  voucher,
  onClose,
  onViewWallet,
  onRedeemVoucher,
}) => {
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (isOpen && isCorrect) {
      // Trigger festive confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'],
      });
    }
  }, [isOpen, isCorrect]);

  if (!isOpen) return null;

  const openLightbox = (images: string[], index: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div className="relative w-full max-w-md max-h-[92vh] flex flex-col rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className={`p-5 border-b ${
              isCorrect
                ? 'bg-gradient-to-r from-emerald-950/70 via-zinc-950 to-amber-950/60 border-emerald-900/40'
                : 'bg-gradient-to-r from-rose-950/70 via-zinc-950 to-zinc-900 border-rose-900/40'
            } flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  isCorrect
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isCorrect ? '答對了！恭喜通關獲獎' : '很可惜，回答錯誤'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isCorrect ? '專屬防偽兌換券已匯入您的錢包' : '詳細解析已為您備妥，請查閱學習'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="關閉彈窗"
              className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* If Correct & Voucher exists: Show voucher */}
            {isCorrect && voucher && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <span>獲頒專屬防偽兌換券</span>
                </p>
                <VoucherCard
                  voucher={voucher}
                  onRedeem={onRedeemVoucher}
                  showRedeemButton={false}
                />
              </div>
            )}

            {/* If Incorrect: Show your answer vs acceptable answers */}
            {!isCorrect && (
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <span className="text-zinc-500 font-medium">您的回答：</span>
                  <span className="text-rose-400 font-semibold font-mono bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
                    {userAnswer || '（未填寫）'}
                  </span>
                </div>
                <div className="flex items-start justify-between border-t border-zinc-800/80 pt-2">
                  <span className="text-zinc-500 font-medium">正確答案為：</span>
                  <span className="text-emerald-400 font-semibold">
                    {question.acceptableAnswers.join(' / ')}
                  </span>
                </div>
              </div>
            )}

            {/* Explanation Section */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>題目詳細解析</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                {question.explanation || '本題無額外文字解析。'}
              </p>

              {/* Explanation Images if any (Multiple supported!) */}
              {question.explanationImageUrls && question.explanationImageUrls.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-zinc-800/60">
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>詳解附圖（點選可放大檢視）：</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {question.explanationImageUrls.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => openLightbox(question.explanationImageUrls, idx)}
                        className="group relative h-28 rounded-xl overflow-hidden border border-zinc-800 bg-black hover:border-emerald-500/70 transition-all"
                      >
                        <img
                          src={img}
                          alt={`詳解附圖 ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                          點選放大
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="p-4 bg-zinc-900/60 border-t border-zinc-900 flex items-center gap-3">
            {isCorrect && onViewWallet && (
              <button
                type="button"
                onClick={onViewWallet}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>查看我的錢包</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isCorrect
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-950/60'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
              }`}
            >
              <span>{isCorrect ? '確認返回題目清單' : '知道了，返回清單'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox for explanation images */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title="詳解附圖放大檢視"
      />
    </>
  );
};
