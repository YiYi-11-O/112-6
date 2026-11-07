import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Calculator,
  Atom,
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  ImageIcon,
  Eye,
  HelpCircle,
} from 'lucide-react';
import { Question, Subject } from '../types';
import { ImageLightbox } from './ImageLightbox';

interface SubjectSelectionViewProps {
  subjects: Subject[];
  questions: Question[];
  answeredQuestions: { [qId: string]: { answeredAt: string; answer: string; isCorrect: boolean } };
  onSelectQuestion: (question: Question, subject: Subject) => void;
  onBackToHome: () => void;
  onOpenWallet?: () => void;
}

export const SubjectSelectionView: React.FC<SubjectSelectionViewProps> = ({
  subjects,
  questions,
  answeredQuestions,
  onSelectQuestion,
  onBackToHome,
  onOpenWallet,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Lightbox for quick question preview from the list
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const renderSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Atom':
        return <Atom className="w-5 h-5 text-sky-400" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-purple-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Calculator':
      default:
        return <Calculator className="w-5 h-5 text-emerald-400" />;
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const subjectQuestions = questions.filter((q) => q.subjectId === selectedSubjectId);

  const handleOpenLightbox = (images: string[], title: string, index: number = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setIsLightboxOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Top Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-md border-b border-zinc-900">
        <button
          type="button"
          onClick={() => {
            if (selectedSubjectId) {
              setSelectedSubjectId(null);
            } else {
              onBackToHome();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{selectedSubjectId ? '切換科目' : '返回首頁'}</span>
        </button>

        <h1 className="text-sm font-bold text-white tracking-wide">
          {selectedSubject ? selectedSubject.name : '選擇挑戰科目'}
        </h1>

        <div className="w-16 flex justify-end">
          {onOpenWallet && (
            <button
              type="button"
              onClick={onOpenWallet}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              錢包
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 space-y-5 max-w-lg mx-auto w-full pb-20">
        {/* 1. Subjects Grid View */}
        {!selectedSubjectId ? (
          <div className="space-y-4">
            <div className="text-left space-y-1">
              <h2 className="text-base font-bold text-white">智慧科目專區</h2>
              <p className="text-xs text-zinc-400">請選取您感興趣的知識領域進行挑戰，每題皆可作答與抽獎</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {subjects.map((sub) => {
                const subQuestions = questions.filter((q) => q.subjectId === sub.id);
                const answeredCount = subQuestions.filter((q) => answeredQuestions[q.id]).length;
                const correctCount = subQuestions.filter(
                  (q) => answeredQuestions[q.id]?.isCorrect
                ).length;
                const isAllDone = subQuestions.length > 0 && correctCount === subQuestions.length;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className="w-full p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950 hover:bg-zinc-900/60 hover:border-emerald-500/40 active:scale-[0.99] transition-all text-left flex items-center justify-between gap-3 shadow-md group"
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:scale-105 transition-transform shrink-0">
                        {renderSubjectIcon(sub.iconName)}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {sub.name}
                          </h3>
                          {isAllDone && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>全部通關</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">{sub.description}</p>
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                          <span>
                            通關進度：{correctCount} / {subQuestions.length} 題
                          </span>
                          <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{
                                width: subQuestions.length
                                  ? `${(correctCount / subQuestions.length) * 100}%`
                                  : '0%',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* 2. Questions List under Selected Subject */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-left space-y-1">
              <div className="flex items-center gap-2">
                {renderSubjectIcon(selectedSubject?.iconName || '')}
                <h2 className="text-sm font-bold text-white">{selectedSubject?.name}</h2>
              </div>
              <p className="text-xs text-zinc-400">{selectedSubject?.description}</p>
            </div>

            {subjectQuestions.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 space-y-2">
                <HelpCircle className="w-10 h-10 mx-auto text-zinc-700" />
                <p className="text-sm font-medium">此科目目前尚未建立題目</p>
                <p className="text-xs">請至後台管理系統新增題目。</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectQuestions.map((q) => {
                  const answerData = answeredQuestions[q.id];
                  const isAnswered = Boolean(answerData);
                  const isCorrect = answerData?.isCorrect;
                  const hasImages = q.imageUrls && q.imageUrls.length > 0;

                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950 text-left space-y-3 transition-all shadow-md hover:border-zinc-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                            第 {q.order} 題
                          </span>
                          <h3 className="text-sm font-bold text-white">{q.title}</h3>
                        </div>

                        {/* Status Badges */}
                        {isAnswered ? (
                          isCorrect ? (
                            <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>已通關</span>
                            </span>
                          ) : (
                            <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/50">
                              <XCircle className="w-3 h-3" />
                              <span>已作答 (未通過)</span>
                            </span>
                          )
                        ) : (
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                            未作答
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {q.prompt}
                      </p>

                      {/* Multiple Images Preview Strip */}
                      {hasImages && (
                        <div className="pt-2 border-t border-zinc-900 flex items-center gap-2 overflow-x-auto pb-1">
                          <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1 shrink-0">
                            <ImageIcon className="w-3 h-3 text-emerald-400" />
                            <span>附圖 ({q.imageUrls.length})：</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {q.imageUrls.map((imgUrl, imgIdx) => (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => handleOpenLightbox(q.imageUrls, q.title, imgIdx)}
                                className="group relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-800 bg-black hover:border-emerald-500 shrink-0 cursor-zoom-in"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`題目縮圖 ${imgIdx + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-2 border-t border-zinc-900 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => onSelectQuestion(q, selectedSubject!)}
                          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isAnswered
                              ? 'bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950'
                          }`}
                        >
                          {isAnswered ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>看詳解</span>
                            </>
                          ) : (
                            <>
                              <span>開始作答</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox for question previews */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        title={lightboxTitle}
      />
    </div>
  );
};
