import React, { useState } from 'react';
import {
  Lock,
  Ticket,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { QuizDataProvider, useQuizData } from './context/QuizDataContext';
import { useDeviceQuizState } from './hooks/useDeviceQuizState';
import { Question, Subject, Voucher } from './types';
import { SubjectSelectionView } from './components/SubjectSelectionView';
import { QuizQuestionView } from './components/QuizQuestionView';
import { WalletModal } from './components/WalletModal';
import { AdminModal } from './components/AdminModal';

function QuizAppContent() {
  const { config, subjects, questions } = useQuizData();
  const {
    deviceId,
    answeredQuestions,
    vouchers,
    recordAnswer,
    awardVoucher,
    redeemVoucher,
    resetDeviceState,
    isQuestionAnswered,
  } = useDeviceQuizState();

  // Navigation states
  type View = 'home' | 'subjects' | 'quiz';
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Modals
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const activeVouchersCount = vouchers.filter((v) => !v.isRedeemed).length;

  const handleStartGame = () => {
    setCurrentView('subjects');
  };

  const handleSelectQuestion = (q: Question, sub: Subject) => {
    setSelectedQuestion(q);
    setSelectedSubject(sub);
    setCurrentView('quiz');
  };

  const handleVoucherAwarded = (v: Voucher) => {
    awardVoucher(v);
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-start selection:bg-emerald-500 selection:text-black">
      {/* Centered Mobile-First Container (~430px on desktop) */}
      <div className="w-full max-w-[430px] min-h-screen bg-black border-x border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col justify-between">
        {/* VIEW: HOME PAGE */}
        {currentView === 'home' && (
          <div className="flex-1 flex flex-col justify-between p-5 space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-400">
                  OLED 純黑特設版
                </span>
              </div>

              {/* Wallet Entry Button */}
              <button
                type="button"
                onClick={() => setIsWalletOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-amber-400 font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>我的兌換券</span>
                {activeVouchersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
                    {activeVouchersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Wallet Quick Status Banner if user has earned vouchers */}
            {vouchers.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-950 to-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-3 text-left shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">
                      已獲得 {vouchers.length} 張專屬防偽券
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      可繼續挑戰其他科目題目，領取更多優惠！
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWalletOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shrink-0 transition-colors"
                >
                  查看票券
                </button>
              </div>
            )}

            {/* Hero Branding */}
            <div className="space-y-3 text-center pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-emerald-400 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>全領域智慧闖關挑戰</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {config.title}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
                {config.subtitle}
              </p>
            </div>

            {/* Official Certification / Rules Specification Card */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-4 space-y-3 text-left shadow-lg">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>正式測驗與防偽發券規範</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">VERIFIED</span>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-400">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-200 font-semibold">智慧多圖題庫：</span>
                    題目附圖支援多張高解析展示與燈箱全螢幕放大檢視。
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Hash className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-200 font-semibold">雲端原子唯一流水號：</span>
                    通關發放之優惠券採用 Firebase 原子鎖遞增，保證跨裝置流水號連續不重複。
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-200 font-semibold">同一題不可重複作答：</span>
                    每道題目每台裝置只能作答一次，送出後即鎖定為已作答（可查閱詳解）；各科目其他題目仍可繼續作答並領取兌換券。
                  </div>
                </div>
              </div>
            </div>

            {/* Realtime Live Stats Bar */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900">
                <p className="text-zinc-500 text-[10px]">上線科目數</p>
                <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                  {subjects.length} 大領域
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900">
                <p className="text-zinc-500 text-[10px]">題庫總題數</p>
                <p className="text-base font-bold font-mono text-amber-400 mt-0.5">
                  {questions.length} 道精選題
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white font-extrabold text-sm tracking-wider shadow-xl shadow-emerald-950/70 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{config.startButtonText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {vouchers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsWalletOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold transition-colors"
                >
                  查看已獲得的兌換券 ({vouchers.length})
                </button>
              )}
            </div>

            {/* Footer with Discreet Subtle Lock Button on Bottom Right */}
            <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-600">
              <span className="truncate max-w-[280px]">{config.footerText}</span>

              {/* Discreet subtle lock button */}
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                title="管理員入口"
                aria-label="管理員登入"
                className="p-1.5 rounded-lg text-zinc-700 hover:text-zinc-400 hover:bg-zinc-900/60 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW: SUBJECT SELECTION */}
        {currentView === 'subjects' && (
          <SubjectSelectionView
            subjects={subjects}
            questions={questions}
            answeredQuestions={answeredQuestions}
            onSelectQuestion={handleSelectQuestion}
            onBackToHome={() => setCurrentView('home')}
            onOpenWallet={() => setIsWalletOpen(true)}
          />
        )}

        {/* VIEW: QUIZ QUESTION */}
        {currentView === 'quiz' && selectedQuestion && selectedSubject && (
          <QuizQuestionView
            question={selectedQuestion}
            subject={selectedSubject}
            deviceId={deviceId}
            isAnswered={isQuestionAnswered(selectedQuestion.id)}
            savedAnswerData={answeredQuestions[selectedQuestion.id]}
            onBack={() => setCurrentView('subjects')}
            onAnswerRecorded={recordAnswer}
            onVoucherAwarded={handleVoucherAwarded}
            onViewWallet={() => setIsWalletOpen(true)}
            onRedeemVoucher={redeemVoucher}
          />
        )}

        {/* WALLET MODAL */}
        <WalletModal
          isOpen={isWalletOpen}
          onClose={() => setIsWalletOpen(false)}
          vouchers={vouchers}
          onRedeem={redeemVoucher}
        />

        {/* ADMIN MODAL */}
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onResetDeviceQuiz={resetDeviceState}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QuizDataProvider>
      <QuizAppContent />
    </QuizDataProvider>
  );
}
