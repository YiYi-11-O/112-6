/**
 * Core application data types
 */

export interface Subject {
  id: string;
  name: string;
  description: string;
  iconName: string;
  order: number;
  createdAt: string;
}

export interface Question {
  id: string;
  subjectId: string;
  title: string;
  prompt: string;
  imageUrls: string[]; // Supports multiple images!
  explanation: string;
  explanationImageUrls: string[]; // Supports multiple explanation images!
  acceptableAnswers: string[];
  order: number;
  createdAt: string;
}

export type VoucherTheme = 'gold' | 'emerald' | 'purple' | 'coral' | 'blue';
export type VoucherIcon = 'tag' | 'gift' | 'star' | 'trophy' | 'award';

export interface GlobalConfig {
  title: string;
  subtitle: string;
  startButtonText: string;
  footerText: string;
  adminPasswordHash: string;
  voucherTheme: VoucherTheme;
  voucherDiscountTitle: string;
  voucherDiscountBadge: string;
  voucherSubtitle: string;
  voucherNotes: string;
  voucherIcon: VoucherIcon;
  updatedAt: string;
}

export interface Voucher {
  id: string;
  serialNo: string;
  earnedAt: string;
  questionId: string;
  questionTitle: string;
  discountTitle: string;
  discountBadge: string;
  theme: VoucherTheme;
  isRedeemed: boolean;
  redeemedAt?: string;
}

export interface Submission {
  id: string;
  deviceId: string;
  deviceLabel: string;
  questionId: string;
  questionTitle: string;
  subjectId: string;
  subjectName: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswers: string[];
  awardedVoucherNo?: string;
  submittedAt: string;
}

export interface DeviceQuizState {
  deviceId: string;
  answeredQuestionIds: {
    [questionId: string]: {
      answeredAt: string;
      answer: string;
      isCorrect: boolean;
    };
  };
  hasWonVoucher: boolean;
  vouchers: Voucher[];
}
