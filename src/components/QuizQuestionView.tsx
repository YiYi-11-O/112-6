import React, { useState } from 'react';
import {
  ArrowLeft,
  Send,
  HelpCircle,
  Eye,
  CheckCircle2,
  Trophy,
  ImageIcon,
} from 'lucide-react';
import { Question, Subject, Voucher } from '../types';
import { checkAnswerMatch, getDeviceLabel } from '../lib/quizHelper';
import { claimNextVoucherSerial } from '../lib/voucherService';
import { useQuizData } from '../context/QuizDataContext';
import { ImageLightbox } from './ImageLightbox';
import { QuizResultModal } from './QuizResultModal';

interface QuizQuestionViewProps {
  question: Question;
  subject: Subject;
  deviceId: string;
  isAnswered: boolean;
  hasWonOverall: boolean;
  savedAnswerData?: { answeredAt: string; answer: string; isCorrect: boolean };
  onBack: () => void;
  onAnswerRecorded: (questionId: string, answer: string, isCorrect: boolean) => void;
  onVoucherAwarded: (voucher: Voucher) => void;
  onViewWallet?: () => void;
  onRedeemVoucher?: (voucherId: string) => void;
}

export const QuizQuestionView: React.FC<QuizQuestionViewProps> = ({
  question,
  subject,
  deviceId,
  isAnswered,
  hasWonOverall,
  savedAnswerData,
  onBack,
  onAnswerRecorded,
  onVoucherAwarded,
  onViewWallet,
  onRedeemVoucher,
}) => {
  const { config, recordSubmission } = useQuizData();
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultModalState, setResultModalState] = useState<{
    isOpen: boolean;
    isCorrect: boolean;
    voucher: Voucher | null;
  }>({
    isOpen: false,
    isCorrect: false,
    voucher: null,
  });

  // Lightbox state for multiple question images
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Directly view explanation modal if already answered or completed
  const [showExplanationOnly, setShowExplanationOnly] = useState(false);

  const openLightbox = (images: string[], index: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isSubmitting || isAnswered || hasWonOverall) return;

    setIsSubmitting(true);
    const isCorrect = checkAnswerMatch(userAnswer, question.acceptableAnswers);
    let awardedVoucher: Voucher | null = null;
    let awardedSerialNo: string | undefined = undefined;

    try {
      if (isCorrect) {
        // Atomic transaction guarantees unique serial number across devices
        const serialNo = await claimNextVoucherSerial();
        awardedSerialNo = serialNo;
        awardedVoucher = {
          id: 'vouch_' + Date.now().toString(36),
          serialNo,
          earnedAt: new Date().toISOString(),
          questionId: question.id,
          questionTitle: question.title,
          discountTitle: config.voucherDiscountTitle,
          discountBadge: config.voucherDiscountBadge,
          theme: config.voucherTheme,
          isRedeemed: false,
        };
        onVoucherAwarded(awardedVoucher);
      }

      // Record to device state
      onAnswerRecorded(question.id, userAnswer, isCorrect);

      // Record to Firestore submissions collection for admin records!
      await recordSubmission({
        deviceId,
        deviceLabel: getDeviceLabel(),
        questionId: question.id,
        questionTitle: question.title,
        subjectId: subject.id,
        subjectName: subject.name,
        userAnswer: userAnswer.trim(),
        isCorrect,
        correctAnswers: question.acceptableAnswers,
        awardedVoucherNo: awardedSerialNo,
        submittedAt: new Date().toISOString(),
      });

      // Show result modal
      setResultModalState({
        isOpen: true,
        isCorrect,
        voucher: awardedVoucher,
      });
    } catch (err) {
      console.error('Submit question error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-md border-b border-zinc-900">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回題目列表</span>
        </button>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400">
          {subject.name}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 space-y-5 max-w-lg mx-auto w-full pb-20">
        {/* Overall Won Notification Banner */}
        {hasWonOverall && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-950 to-amber-950/30 border border-amber-500/40 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-300">您已通關獲獎！</p>
                <p className="text-[11px] text-zinc-400">
                  全站切換為觀摩學習模式，可自由查閱所有題目的詳解
                </p>
              </div>
            </div>
            {onViewWallet && (
              <button
                type="button"
                onClick={onViewWallet}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold shrink-0"
              >
                看錢包
              </button>
            )}
          </div>
        )}

        {/* Question Header Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 space-y-4 text-left shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
              第 {question.order} 題
            </span>

            {isAnswered && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>已完成作答</span>
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-white tracking-wide">
            {question.title}
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            {question.prompt}
          </p>

          {/* Multiple Question Images Preview */}
          {question.imageUrls && question.imageUrls.length > 0 && (
            <div className="pt-2 space-y-2 border-t border-zinc-900">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>題目附圖（共 {question.imageUrls.length} 張，點選可放大檢視）</span>
                </span>
              </div>

              {/* Grid / Gallery */}
              <div
                className={`grid gap-2.5 ${
                  question.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                }`}
              >
                {question.imageUrls.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openLightbox(question.imageUrls, idx)}
                    className="group relative h-40 sm:h-48 rounded-xl overflow-hidden border border-zinc-800 bg-black hover:border-emerald-500/70 transition-all cursor-zoom-in"
                  >
                    <img
                      src={imgUrl}
                      alt={`題目附圖 ${idx + 1}`}
                      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-zinc-800 text-[10px] font-mono text-zinc-300">
                      附圖 {idx + 1}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      點選放大
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Answer Interactive Area */}
        {!isAnswered && !hasWonOverall ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <label
                htmlFor="user-answer-input"
                className="text-xs font-bold text-zinc-300 flex items-center gap-1.5"
              >
                <span>請輸入您的答案：</span>
                <span className="text-[11px] font-normal text-zinc-500">
                  （支援多種表達方式，自動忽略大小寫與空格）
                </span>
              </label>

              <div className="relative">
                <input
                  id="user-answer-input"
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="在此輸入答案，例：60、水星、100..."
                  autoComplete="off"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3.5 rounded-2xl bg-zinc-950 border-2 border-zinc-800 focus:border-emerald-500 text-white placeholder-zinc-600 outline-none font-medium text-sm transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!userAnswer.trim() || isSubmitting}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all ${
                !userAnswer.trim() || isSubmitting
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white shadow-xl shadow-emerald-950/60'
              }`}
            >
              {isSubmitting ? (
                <span>核驗答案中...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>確認送出答案並抽獎</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Already answered or won overall: Show review explanation button */
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5 space-y-4 text-left">
            <div className="space-y-1">
              <p className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {hasWonOverall && !isAnswered
                    ? '已獲獎狀態（免再作答）'
                    : '本機已作答此題目'}
                </span>
              </p>
              {savedAnswerData && (
                <p className="text-xs text-zinc-400">
                  先前提交答案：
                  <span className="font-mono text-white font-bold ml-1">
                    {savedAnswerData.answer || '（未記錄）'}
                  </span>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                      savedAnswerData.isCorrect
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                        : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                    }`}
                  >
                    {savedAnswerData.isCorrect ? '答對' : '答錯'}
                  </span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowExplanationOnly(true)}
              className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>閱讀本題詳細解析與觀念</span>
            </button>
          </div>
        )}

        {/* Security / System rule badge */}
        <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900 text-center">
          <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
            <span>通關獲獎流水號由 Firebase 原子計數器遞增生成，每台裝置限領乙張</span>
          </p>
        </div>
      </div>

      {/* Result Modal when submitting */}
      <QuizResultModal
        isOpen={resultModalState.isOpen}
        isCorrect={resultModalState.isCorrect}
        question={question}
        userAnswer={userAnswer}
        voucher={resultModalState.voucher}
        onClose={() => {
          setResultModalState((prev) => ({ ...prev, isOpen: false }));
          onBack();
        }}
        onViewWallet={onViewWallet}
        onRedeemVoucher={onRedeemVoucher}
      />

      {/* Review Explanation Modal when clicking '閱讀本題詳細解析' */}
      {showExplanationOnly && (
        <QuizResultModal
          isOpen={true}
          isCorrect={savedAnswerData?.isCorrect ?? true}
          question={question}
          userAnswer={savedAnswerData?.answer ?? ''}
          voucher={null}
          onClose={() => setShowExplanationOnly(false)}
          onViewWallet={onViewWallet}
        />
      )}

      {/* Lightbox for question images */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={question.title}
      />
    </div>
  );
};
