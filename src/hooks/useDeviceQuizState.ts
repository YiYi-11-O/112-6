import { useState, useEffect, useCallback } from 'react';
import { DeviceQuizState, Voucher } from '../types';
import { getOrCreateDeviceId } from '../lib/quizHelper';

const STORAGE_KEY = 'quiz_device_state_v2';

export function useDeviceQuizState() {
  const [state, setState] = useState<DeviceQuizState>(() => {
    const deviceId = getOrCreateDeviceId();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          deviceId,
          answeredQuestionIds: parsed.answeredQuestionIds || {},
          hasWonVoucher: Boolean(parsed.hasWonVoucher),
          vouchers: Array.isArray(parsed.vouchers) ? parsed.vouchers : [],
        };
      }
    } catch (e) {
      console.error('Failed reading device quiz state from localStorage', e);
    }
    return {
      deviceId,
      answeredQuestionIds: {},
      hasWonVoucher: false,
      vouchers: [],
    };
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed writing device quiz state to localStorage', e);
    }
  }, [state]);

  // Record an answer attempt on this device
  const recordAnswer = useCallback((questionId: string, answer: string, isCorrect: boolean) => {
    setState((prev) => {
      if (prev.answeredQuestionIds[questionId]) return prev; // already answered
      return {
        ...prev,
        answeredQuestionIds: {
          ...prev.answeredQuestionIds,
          [questionId]: {
            answeredAt: new Date().toISOString(),
            answer,
            isCorrect,
          },
        },
      };
    });
  }, []);

  // Award a voucher to this device
  const awardVoucher = useCallback((voucher: Voucher) => {
    setState((prev) => ({
      ...prev,
      hasWonVoucher: true,
      vouchers: [voucher, ...prev.vouchers],
    }));
  }, []);

  // Redeem a voucher in wallet
  const redeemVoucher = useCallback((voucherId: string) => {
    setState((prev) => ({
      ...prev,
      vouchers: prev.vouchers.map((v) =>
        v.id === voucherId
          ? { ...v, isRedeemed: true, redeemedAt: new Date().toISOString() }
          : v
      ),
    }));
  }, []);

  // Reset local device answered state (Admin testing tool)
  const resetDeviceState = useCallback(() => {
    const newState: DeviceQuizState = {
      deviceId: getOrCreateDeviceId(),
      answeredQuestionIds: {},
      hasWonVoucher: false,
      vouchers: [],
    };
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Failed clearing device quiz state', e);
    }
  }, []);

  // Check if a question is answered on this device
  const isQuestionAnswered = useCallback(
    (questionId: string): boolean => {
      return Boolean(state.answeredQuestionIds[questionId]);
    },
    [state.answeredQuestionIds]
  );

  return {
    state,
    deviceId: state.deviceId,
    answeredQuestions: state.answeredQuestionIds,
    hasWonVoucher: state.hasWonVoucher,
    vouchers: state.vouchers,
    recordAnswer,
    awardVoucher,
    redeemVoucher,
    resetDeviceState,
    isQuestionAnswered,
  };
}
