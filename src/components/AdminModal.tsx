import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Settings,
  Ticket,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Check,
  Upload,
  AlertTriangle,
  History,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { useQuizData } from '../context/QuizDataContext';
import { GlobalConfig, Question, Subject, VoucherIcon, VoucherTheme } from '../types';
import { VoucherCard } from './VoucherCard';
import { getCurrentVoucherCount, setVoucherCounterValue } from '../lib/voucherService';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDeviceQuiz: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onResetDeviceQuiz,
}) => {
  const {
    config,
    subjects,
    questions,
    submissions,
    updateGlobalConfig,
    addSubject,
    updateSubject,
    deleteSubject,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    clearAllSubmissions,
    resetToDefaults,
  } = useQuizData();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  type Tab = 'config' | 'voucher' | 'subjects' | 'questions' | 'submissions' | 'testing';
  const [activeTab, setActiveTab] = useState<Tab>('submissions');

  // Form states
  const [formConfig, setFormConfig] = useState<GlobalConfig>(config);
  const [newPassword, setNewPassword] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Subject Edit state
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [subjectIcon, setSubjectIcon] = useState('Calculator');
  const [subjectOrder, setSubjectOrder] = useState(1);

  // Question Edit state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedSubIdForQuestions, setSelectedSubIdForQuestions] = useState<string>('all');
  const [qSubjectId, setQSubjectId] = useState('');
  const [qTitle, setQTitle] = useState('');
  const [qPrompt, setQPrompt] = useState('');
  const [qImageUrls, setQImageUrls] = useState<string[]>([]);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [qExplanation, setQExplanation] = useState('');
  const [qExplanationImageUrls, setQExplanationImageUrls] = useState<string[]>([]);
  const [newExpImageUrlInput, setNewExpImageUrlInput] = useState('');
  const [qAcceptableAnswers, setQAcceptableAnswers] = useState('');
  const [qOrder, setQOrder] = useState(1);

  // Counter state
  const [cloudCounter, setCloudCounter] = useState<number>(0);
  const [newCounterVal, setNewCounterVal] = useState<string>('1');

  // Submissions search & filter state
  const [submissionFilterSub, setSubmissionFilterSub] = useState<string>('all');
  const [submissionFilterResult, setSubmissionFilterResult] = useState<'all' | 'correct' | 'wrong'>('all');
  const [submissionSearch, setSubmissionSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormConfig(config);
      getCurrentVoucherCount().then((val) => {
        setCloudCounter(val);
        setNewCounterVal(String(val + 1));
      });
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === config.adminPasswordHash || passwordInput === '115394') {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('管理員密碼錯誤，請重新輸入');
    }
  };

  // Save General Config
  const handleSaveConfig = async () => {
    const toUpdate: Partial<GlobalConfig> = { ...formConfig };
    if (newPassword.trim()) {
      toUpdate.adminPasswordHash = newPassword.trim();
    }
    await updateGlobalConfig(toUpdate);
    setNewPassword('');
    setSaveSuccessMsg('全站設定已成功更新！');
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  // Subject Add/Update
  const handleSaveSubject = async () => {
    if (!subjectName.trim()) return;
    if (editingSubject) {
      await updateSubject({
        ...editingSubject,
        name: subjectName.trim(),
        description: subjectDesc.trim(),
        iconName: subjectIcon,
        order: Number(subjectOrder) || 1,
      });
    } else {
      await addSubject({
        name: subjectName.trim(),
        description: subjectDesc.trim(),
        iconName: subjectIcon,
        order: Number(subjectOrder) || (subjects.length + 1),
      });
    }
    setEditingSubject(null);
    setSubjectName('');
    setSubjectDesc('');
    setSubjectOrder(1);
    setSaveSuccessMsg('科目資料已儲存！');
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  // Question Add/Update
  const handleSaveQuestion = async () => {
    if (!qTitle.trim() || !qPrompt.trim() || !qSubjectId) return;
    const answers = qAcceptableAnswers
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingQuestion) {
      await updateQuestion({
        ...editingQuestion,
        subjectId: qSubjectId,
        title: qTitle.trim(),
        prompt: qPrompt.trim(),
        imageUrls: qImageUrls,
        explanation: qExplanation.trim(),
        explanationImageUrls: qExplanationImageUrls,
        acceptableAnswers: answers.length > 0 ? answers : ['無'],
        order: Number(qOrder) || 1,
      });
    } else {
      await addQuestion({
        subjectId: qSubjectId,
        title: qTitle.trim(),
        prompt: qPrompt.trim(),
        imageUrls: qImageUrls,
        explanation: qExplanation.trim(),
        explanationImageUrls: qExplanationImageUrls,
        acceptableAnswers: answers.length > 0 ? answers : ['無'],
        order: Number(qOrder) || (questions.length + 1),
      });
    }

    setEditingQuestion(null);
    setQTitle('');
    setQPrompt('');
    setQImageUrls([]);
    setQExplanation('');
    setQExplanationImageUrls([]);
    setQAcceptableAnswers('');
    setSaveSuccessMsg('題目資料已成功儲存！');
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  // Helper for multiple image uploads (local file -> Base64)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetList: 'question' | 'explanation'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          if (targetList === 'question') {
            setQImageUrls((prev) => [...prev, result]);
          } else {
            setQExplanationImageUrls((prev) => [...prev, result]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    // reset input
    e.target.value = '';
  };

  // Export submissions to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (submissions.length === 0) {
      alert('目前沒有作答記錄可供匯出');
      return;
    }

    const headers = [
      '作答時間',
      '裝置標籤',
      '裝置ID',
      '科目名稱',
      '題目標題',
      '使用者答案',
      '是否答對',
      '正確答案列表',
      '獲取兌換券流水號',
    ];

    const rows = submissions.map((sub) => [
      `"${sub.submittedAt}"`,
      `"${sub.deviceLabel || ''}"`,
      `"${sub.deviceId}"`,
      `"${sub.subjectName}"`,
      `"${sub.questionTitle.replace(/"/g, '""')}"`,
      `"${sub.userAnswer.replace(/"/g, '""')}"`,
      `"${sub.isCorrect ? '答對' : '答錯'}"`,
      `"${sub.correctAnswers.join(' / ').replace(/"/g, '""')}"`,
      `"${sub.awardedVoucherNo || '無'}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `quiz_submissions_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (submissionFilterSub !== 'all' && sub.subjectId !== submissionFilterSub) return false;
    if (submissionFilterResult === 'correct' && !sub.isCorrect) return false;
    if (submissionFilterResult === 'wrong' && sub.isCorrect) return false;
    if (submissionSearch.trim()) {
      const q = submissionSearch.toLowerCase();
      const matchTitle = sub.questionTitle.toLowerCase().includes(q);
      const matchAns = sub.userAnswer.toLowerCase().includes(q);
      const matchDevice = (sub.deviceLabel || '').toLowerCase().includes(q);
      if (!matchTitle && !matchAns && !matchDevice) return false;
    }
    return true;
  });

  const correctCount = submissions.filter((s) => s.isCorrect).length;
  const winRate = submissions.length
    ? ((correctCount / submissions.length) * 100).toFixed(1)
    : '0';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-2xl max-h-[94vh] flex flex-col rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden text-left">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                極黑管理後台
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  即時雲端同步
                </span>
              </h2>
              <p className="text-xs text-zinc-400">全站文案、多圖題庫、作答記錄與原子流水號管理</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉管理後台"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message Banner */}
        {saveSuccessMsg && (
          <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-800/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* 1. Login Gate */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-sm mx-auto w-full my-auto text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">管理員安全身分驗證</h3>
              <p className="text-xs text-zinc-400">請輸入管理密碼以存取後台設定與作答記錄</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="請輸入密碼 (預設: 115394)"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-black border-2 border-zinc-800 focus:border-emerald-500 text-white placeholder-zinc-600 outline-none text-center font-mono text-sm tracking-widest"
                />
                {authError && <p className="text-xs text-rose-400 mt-2">{authError}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs tracking-wider shadow-lg shadow-emerald-950 transition-all"
              >
                解鎖進入後台
              </button>
            </form>
          </div>
        ) : (
          /* 2. Authenticated Dashboard with Tabs */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tabs Bar */}
            <div className="px-4 py-2.5 border-b border-zinc-900 flex items-center gap-1.5 overflow-x-auto bg-black/40 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('submissions')}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'submissions'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <History className="w-4 h-4" />
                <span>作答記錄 ({submissions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('questions')}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'questions'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>題目管理 ({questions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('subjects')}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'subjects'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>科目管理 ({subjects.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('voucher')}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'voucher'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>兌換券風格</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'config'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>全站設定</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('testing')}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeTab === 'testing'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>測試與流水號</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {/* TAB: SUBMISSIONS RECORD (所有使用者作答紀錄) */}
              {activeTab === 'submissions' && (
                <div className="space-y-5">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                      <p className="text-[11px] text-zinc-400 font-medium">總作答筆數</p>
                      <p className="text-xl font-bold font-mono text-white mt-0.5">
                        {submissions.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
                      <p className="text-[11px] text-emerald-400 font-medium">答對獲獎數</p>
                      <p className="text-xl font-bold font-mono text-emerald-300 mt-0.5">
                        {correctCount}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40">
                      <p className="text-[11px] text-rose-400 font-medium">答錯次數</p>
                      <p className="text-xl font-bold font-mono text-rose-300 mt-0.5">
                        {submissions.length - correctCount}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/40">
                      <p className="text-[11px] text-amber-400 font-medium">答對率</p>
                      <p className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                        {winRate}%
                      </p>
                    </div>
                  </div>

                  {/* Filter and Export Action Bar */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={submissionSearch}
                          onChange={(e) => setSubmissionSearch(e.target.value)}
                          placeholder="搜尋題目標題、使用者答案或裝置..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black border border-zinc-800 focus:border-emerald-500 text-xs text-white placeholder-zinc-600 outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleExportCSV}
                          className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>匯出 CSV</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm('確定要清空雲端所有的作答紀錄嗎？')) {
                              await clearAllSubmissions();
                              setSaveSuccessMsg('所有作答紀錄已清空');
                              setTimeout(() => setSaveSuccessMsg(''), 2500);
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-xs font-bold transition-colors shrink-0"
                        >
                          清空紀錄
                        </button>
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-zinc-500 text-[11px]">篩選：</span>
                      <select
                        value={submissionFilterSub}
                        onChange={(e) => setSubmissionFilterSub(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-black border border-zinc-800 text-zinc-300 text-xs outline-none"
                      >
                        <option value="all">全部科目</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center rounded-lg bg-black border border-zinc-800 p-0.5">
                        <button
                          type="button"
                          onClick={() => setSubmissionFilterResult('all')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            submissionFilterResult === 'all'
                              ? 'bg-zinc-800 text-white font-bold'
                              : 'text-zinc-500'
                          }`}
                        >
                          全部結果
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubmissionFilterResult('correct')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            submissionFilterResult === 'correct'
                              ? 'bg-emerald-950 text-emerald-300 font-bold'
                              : 'text-zinc-500'
                          }`}
                        >
                          答對獲獎
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubmissionFilterResult('wrong')}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            submissionFilterResult === 'wrong'
                              ? 'bg-rose-950 text-rose-300 font-bold'
                              : 'text-zinc-500'
                          }`}
                        >
                          答錯
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submissions List */}
                  {filteredSubmissions.length === 0 ? (
                    <div className="py-16 text-center text-zinc-500 space-y-2">
                      <History className="w-10 h-10 mx-auto text-zinc-700" />
                      <p className="text-sm font-medium">目前尚無符合條件的作答紀錄</p>
                      <p className="text-xs">
                        當任何使用者在手機或電腦送出答案後，此處將即時同步呈現！
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2 text-xs hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  sub.isCorrect
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                                    : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                                }`}
                              >
                                {sub.isCorrect ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>答對通關</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3" />
                                    <span>答錯</span>
                                  </>
                                )}
                              </span>

                              <span className="font-mono text-zinc-400 text-[11px]">
                                {new Date(sub.submittedAt).toLocaleString('zh-TW', {
                                  hour12: false,
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </span>
                            </div>

                            {sub.awardedVoucherNo && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-600/40 font-mono font-bold text-[10px]">
                                {sub.awardedVoucherNo}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
                                {sub.subjectName}
                              </span>
                              <span className="font-bold text-white text-xs">
                                {sub.questionTitle}
                              </span>
                            </div>

                            <div className="flex items-baseline justify-between pt-1">
                              <p className="text-zinc-400">
                                使用者作答：
                                <span className="font-bold font-mono text-white ml-1">
                                  {sub.userAnswer}
                                </span>
                              </p>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {sub.deviceLabel} • {sub.deviceId.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: QUESTIONS CRUD (支援圖片放多張!) */}
              {activeTab === 'questions' && (
                <div className="space-y-6">
                  {/* Question Editor Form */}
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>{editingQuestion ? '編輯題目' : '新增題目'}</span>
                      {editingQuestion && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuestion(null);
                            setQTitle('');
                            setQPrompt('');
                            setQImageUrls([]);
                            setQExplanation('');
                            setQExplanationImageUrls([]);
                            setQAcceptableAnswers('');
                          }}
                          className="text-zinc-500 hover:text-zinc-300 text-xs normal-case"
                        >
                          取消編輯
                        </button>
                      )}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-zinc-400 block mb-1">所屬科目</label>
                        <select
                          value={qSubjectId}
                          onChange={(e) => setQSubjectId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                        >
                          <option value="">-- 請選擇科目 --</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1">題目排序權重</label>
                        <input
                          type="number"
                          value={qOrder}
                          onChange={(e) => setQOrder(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="text-zinc-400 block mb-1">題目標題</label>
                      <input
                        type="text"
                        value={qTitle}
                        onChange={(e) => setQTitle(e.target.value)}
                        placeholder="例：正三角形的內角度數"
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="text-xs">
                      <label className="text-zinc-400 block mb-1">題目完整描述</label>
                      <textarea
                        value={qPrompt}
                        onChange={(e) => setQPrompt(e.target.value)}
                        rows={2}
                        placeholder="輸入詳細題目敘述..."
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* MULTIPLE QUESTION IMAGES UPLOAD & MANAGEMENT */}
                    <div className="p-3.5 rounded-xl bg-black border border-zinc-800/80 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <Upload className="w-4 h-4" />
                          <span>題目附圖（可放多張圖片）</span>
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          已加入 {qImageUrls.length} 張圖片
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        {/* File input (multiple) */}
                        <label className="flex-1 py-2 px-3 rounded-xl border border-dashed border-zinc-700 hover:border-emerald-500 bg-zinc-950 flex items-center justify-center gap-2 cursor-pointer text-zinc-400 hover:text-white transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>選擇本機圖片（支援多選）</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileUpload(e, 'question')}
                            className="hidden"
                          />
                        </label>

                        {/* URL input */}
                        <div className="flex-1 flex gap-1.5">
                          <input
                            type="text"
                            value={newImageUrlInput}
                            onChange={(e) => setNewImageUrlInput(e.target.value)}
                            placeholder="貼上圖片 URL 網址"
                            className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newImageUrlInput.trim()) {
                                setQImageUrls((prev) => [...prev, newImageUrlInput.trim()]);
                                setNewImageUrlInput('');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold"
                          >
                            加入
                          </button>
                        </div>
                      </div>

                      {/* Image Preview Grid with Remove buttons */}
                      {qImageUrls.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                          {qImageUrls.map((url, idx) => (
                            <div
                              key={idx}
                              className="group relative h-20 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950"
                            >
                              <img
                                src={url}
                                alt={`附圖 ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setQImageUrls((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-zinc-400">
                                {idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-xs">
                      <label className="text-zinc-400 block mb-1">
                        多元正確答案（以逗號或換行分隔）
                      </label>
                      <input
                        type="text"
                        value={qAcceptableAnswers}
                        onChange={(e) => setQAcceptableAnswers(e.target.value)}
                        placeholder="例：60, 60度, 六十, 六十度"
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="text-xs">
                      <label className="text-zinc-400 block mb-1">題目詳細解析</label>
                      <textarea
                        value={qExplanation}
                        onChange={(e) => setQExplanation(e.target.value)}
                        rows={2}
                        placeholder="答對或答錯時展示的完整解析..."
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* MULTIPLE EXPLANATION IMAGES */}
                    <div className="p-3.5 rounded-xl bg-black border border-zinc-800/80 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400 flex items-center gap-1.5">
                          <Upload className="w-4 h-4" />
                          <span>詳解附圖（亦支援多張圖片）</span>
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          已加入 {qExplanationImageUrls.length} 張圖片
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <label className="flex-1 py-2 px-3 rounded-xl border border-dashed border-zinc-700 hover:border-sky-500 bg-zinc-950 flex items-center justify-center gap-2 cursor-pointer text-zinc-400 hover:text-white transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>選擇詳解圖片（支援多選）</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleFileUpload(e, 'explanation')}
                            className="hidden"
                          />
                        </label>

                        <div className="flex-1 flex gap-1.5">
                          <input
                            type="text"
                            value={newExpImageUrlInput}
                            onChange={(e) => setNewExpImageUrlInput(e.target.value)}
                            placeholder="貼上詳解圖片網址"
                            className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newExpImageUrlInput.trim()) {
                                setQExplanationImageUrls((prev) => [
                                  ...prev,
                                  newExpImageUrlInput.trim(),
                                ]);
                                setNewExpImageUrlInput('');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold"
                          >
                            加入
                          </button>
                        </div>
                      </div>

                      {qExplanationImageUrls.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                          {qExplanationImageUrls.map((url, idx) => (
                            <div
                              key={idx}
                              className="group relative h-20 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950"
                            >
                              <img
                                src={url}
                                alt={`詳解圖 ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setQExplanationImageUrls((prev) =>
                                    prev.filter((_, i) => i !== idx)
                                  )
                                }
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveQuestion}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      {editingQuestion ? '儲存題目修改' : '立即新增此題目'}
                    </button>
                  </div>

                  {/* Filter by Subject */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-400">篩選題目科目：</span>
                    <select
                      value={selectedSubIdForQuestions}
                      onChange={(e) => setSelectedSubIdForQuestions(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-black border border-zinc-800 text-white text-xs outline-none"
                    >
                      <option value="all">全部科目 ({questions.length})</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({questions.filter((q) => q.subjectId === s.id).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-3">
                    {questions
                      .filter(
                        (q) =>
                          selectedSubIdForQuestions === 'all' ||
                          q.subjectId === selectedSubIdForQuestions
                      )
                      .map((q) => {
                        const sub = subjects.find((s) => s.id === q.subjectId);
                        return (
                          <div
                            key={q.id}
                            className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px]">
                                  {sub?.name || '未分類'}
                                </span>
                                <span className="font-bold text-white text-sm">{q.title}</span>
                              </div>
                              <p className="text-zinc-400 line-clamp-1">{q.prompt}</p>
                              <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                                <span>答案：{q.acceptableAnswers.join(' / ')}</span>
                                {q.imageUrls && q.imageUrls.length > 0 && (
                                  <span className="text-emerald-400 font-bold">
                                    含 {q.imageUrls.length} 張附圖
                                  </span>
                                )}
                                {q.explanationImageUrls && q.explanationImageUrls.length > 0 && (
                                  <span className="text-sky-400 font-bold">
                                    含 {q.explanationImageUrls.length} 張詳解圖
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingQuestion(q);
                                  setQSubjectId(q.subjectId);
                                  setQTitle(q.title);
                                  setQPrompt(q.prompt);
                                  setQImageUrls(q.imageUrls || []);
                                  setQExplanation(q.explanation || '');
                                  setQExplanationImageUrls(q.explanationImageUrls || []);
                                  setQAcceptableAnswers(q.acceptableAnswers.join(', '));
                                  setQOrder(q.order);
                                }}
                                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`確定要刪除「${q.title}」嗎？`)) {
                                    await deleteQuestion(q.id);
                                  }
                                }}
                                className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* TAB: SUBJECTS CRUD */}
              {activeTab === 'subjects' && (
                <div className="space-y-6">
                  {/* Subject Editor */}
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>{editingSubject ? '編輯科目' : '新增科目'}</span>
                      {editingSubject && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSubject(null);
                            setSubjectName('');
                            setSubjectDesc('');
                          }}
                          className="text-zinc-500 hover:text-zinc-300 text-xs normal-case"
                        >
                          取消編輯
                        </button>
                      )}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-zinc-400 block mb-1">科目名稱</label>
                        <input
                          type="text"
                          value={subjectName}
                          onChange={(e) => setSubjectName(e.target.value)}
                          placeholder="例：生活美語"
                          className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1">圖示類型</label>
                        <select
                          value={subjectIcon}
                          onChange={(e) => setSubjectIcon(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                        >
                          <option value="Calculator">Calculator (計算機 / 數學)</option>
                          <option value="Atom">Atom (原子 / 自然天文)</option>
                          <option value="BookOpen">BookOpen (書本 / 文史詩詞)</option>
                          <option value="Sparkles">Sparkles (星芒 / 綜合趣味)</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="text-zinc-400 block mb-1">簡短介紹</label>
                      <input
                        type="text"
                        value={subjectDesc}
                        onChange={(e) => setSubjectDesc(e.target.value)}
                        placeholder="說明該科目重點..."
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSubject}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      {editingSubject ? '儲存科目修改' : '立即新增科目'}
                    </button>
                  </div>

                  {/* Subjects List */}
                  <div className="space-y-3">
                    {subjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                          <p className="text-zinc-400">{sub.description}</p>
                          <p className="text-[11px] text-zinc-500">
                            題目數量：{questions.filter((q) => q.subjectId === sub.id).length} 題
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSubject(sub);
                              setSubjectName(sub.name);
                              setSubjectDesc(sub.description);
                              setSubjectIcon(sub.iconName);
                              setSubjectOrder(sub.order);
                            }}
                            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  `確定要刪除「${sub.name}」及其所屬的所有題目嗎？`
                                )
                              ) {
                                await deleteSubject(sub.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: VOUCHER STYLE DESIGN */}
              {activeTab === 'voucher' && (
                <div className="space-y-6">
                  {/* Live Preview */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      即時效果回饋預覽
                    </p>
                    <VoucherCard
                      voucher={{
                        id: 'preview_1',
                        serialNo: 'NO.0001',
                        earnedAt: new Date().toISOString(),
                        questionId: 'preview',
                        questionTitle: '正三角形的內角度數',
                        discountTitle: formConfig.voucherDiscountTitle,
                        discountBadge: formConfig.voucherDiscountBadge,
                        theme: formConfig.voucherTheme,
                        isRedeemed: false,
                      }}
                      showRedeemButton={true}
                    />
                  </div>

                  {/* Style Settings */}
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4 text-xs">
                    <div>
                      <label className="text-zinc-400 block mb-1">票券色彩主題風格</label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {(['gold', 'emerald', 'purple', 'coral', 'blue'] as VoucherTheme[]).map(
                          (theme) => (
                            <button
                              key={theme}
                              type="button"
                              onClick={() => setFormConfig({ ...formConfig, voucherTheme: theme })}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                                formConfig.voucherTheme === theme
                                  ? 'border-emerald-500 bg-emerald-950/60 text-white'
                                  : 'border-zinc-800 bg-black text-zinc-400 hover:text-white'
                              }`}
                            >
                              {theme}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-400 block mb-1">折扣標籤 (Badge)</label>
                        <input
                          type="text"
                          value={formConfig.voucherDiscountBadge}
                          onChange={(e) =>
                            setFormConfig({ ...formConfig, voucherDiscountBadge: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1">票券大標題</label>
                        <input
                          type="text"
                          value={formConfig.voucherDiscountTitle}
                          onChange={(e) =>
                            setFormConfig({ ...formConfig, voucherDiscountTitle: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">票券底部備註</label>
                      <input
                        type="text"
                        value={formConfig.voucherNotes}
                        onChange={(e) =>
                          setFormConfig({ ...formConfig, voucherNotes: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveConfig}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      儲存兌換券風格設定
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: GENERAL CONFIG */}
              {activeTab === 'config' && (
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">首頁頂部大標題</label>
                    <input
                      type="text"
                      value={formConfig.title}
                      onChange={(e) => setFormConfig({ ...formConfig, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">首頁副標題</label>
                    <input
                      type="text"
                      value={formConfig.subtitle}
                      onChange={(e) => setFormConfig({ ...formConfig, subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-zinc-400 block mb-1">開始按鈕文字</label>
                      <input
                        type="text"
                        value={formConfig.startButtonText}
                        onChange={(e) =>
                          setFormConfig({ ...formConfig, startButtonText: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">修改管理員登錄密碼</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="留空表示不變更密碼"
                        className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">頁尾版權文字</label>
                    <input
                      type="text"
                      value={formConfig.footerText}
                      onChange={(e) => setFormConfig({ ...formConfig, footerText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    儲存全站設定
                  </button>
                </div>
              )}

              {/* TAB: TESTING & ATOMIC COUNTER */}
              {activeTab === 'testing' && (
                <div className="space-y-4 text-xs">
                  {/* Atomic Counter Management */}
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-amber-400" />
                      <span>全域原子流水號管理</span>
                    </h4>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      目前雲端原子計數器數值為：
                      <span className="font-mono font-bold text-emerald-400 text-sm ml-1">
                        {cloudCounter}
                      </span>{' '}
                      （下一張發放號碼為 NO.
                      {String(cloudCounter + 1).padStart(4, '0')}）
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        value={newCounterVal}
                        onChange={(e) => setNewCounterVal(e.target.value)}
                        className="w-32 px-3 py-2 rounded-xl bg-black border border-zinc-800 text-white font-mono text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const val = parseInt(newCounterVal, 10);
                          if (!isNaN(val)) {
                            await setVoucherCounterValue(val);
                            setCloudCounter(val);
                            setSaveSuccessMsg(`流水號已手動更新為 ${val}`);
                            setTimeout(() => setSaveSuccessMsg(''), 2500);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold"
                      >
                        手動更新計數值
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm('確定要將雲端流水號歸零重設嗎？')) {
                            await setVoucherCounterValue(0);
                            setCloudCounter(0);
                            setNewCounterVal('1');
                            setSaveSuccessMsg('流水號已歸零');
                            setTimeout(() => setSaveSuccessMsg(''), 2500);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/40 text-xs font-bold"
                      >
                        一鍵歸零
                      </button>
                    </div>
                  </div>

                  {/* Reset Local Device Test */}
                  <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                      <span>本機測試作答重設</span>
                    </h4>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      清空目前本機的已回答題目記錄與已領取的優惠券，方便您在同一台裝置上反覆測試答題與通關領券流程。
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onResetDeviceQuiz();
                        setSaveSuccessMsg('本機答題與通關狀態已成功重置！');
                        setTimeout(() => setSaveSuccessMsg(''), 2500);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      一鍵重設本機作答與通關狀態
                    </button>
                  </div>

                  {/* Restore Defaults */}
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                    <h4 className="font-bold text-rose-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>還原初始預設題庫</span>
                    </h4>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      將雲端資料庫還原為官方預設的 4 大科目、6 道精選題目（含多圖示例與幾何詳解圖）以及初始全站設定。
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          window.confirm('確定要還原為初始題庫與預設設定嗎？此操作將覆蓋現有題目。')
                        ) {
                          await resetToDefaults();
                          setSaveSuccessMsg('已成功還原為初始題庫！');
                          setTimeout(() => setSaveSuccessMsg(''), 2500);
                        }
                      }}
                      className="py-2.5 px-4 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-white font-bold text-xs"
                    >
                      還原為初始題庫與預設設定
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
