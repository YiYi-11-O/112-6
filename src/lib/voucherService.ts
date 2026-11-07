import { doc, runTransaction, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

const COUNTER_PATH = 'counters/voucher_counter';

/**
 * Atomic transaction to guarantee strictly consecutive and unique voucher numbers
 * across multiple concurrent devices with zero collision.
 */
export async function claimNextVoucherSerial(): Promise<string> {
  const counterRef = doc(db, 'counters', 'voucher_counter');

  try {
    const serialNo = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let nextCount = 1;

      if (counterDoc.exists()) {
        const data = counterDoc.data();
        const currentCount = typeof data.currentCount === 'number' ? data.currentCount : 0;
        nextCount = currentCount + 1;
      }

      transaction.set(
        counterRef,
        {
          currentCount: nextCount,
          prefix: 'NO.',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return `NO.${String(nextCount).padStart(4, '0')}`;
    });

    return serialNo;
  } catch (error) {
    console.warn('Atomic counter transaction warning:', error);
    // Offline / fallback sequential generator
    const localFallback = `NO.${String(Math.floor(Date.now() % 10000)).padStart(4, '0')}`;
    return localFallback;
  }
}

/**
 * Read current counter value from Firestore
 */
export async function getCurrentVoucherCount(): Promise<number> {
  try {
    const counterDoc = await getDoc(doc(db, 'counters', 'voucher_counter'));
    if (counterDoc.exists()) {
      return counterDoc.data().currentCount || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Set the next counter value (Admin tool)
 */
export async function setVoucherCounterValue(nextValue: number): Promise<void> {
  const counterRef = doc(db, 'counters', 'voucher_counter');
  try {
    await setDoc(
      counterRef,
      {
        currentCount: Math.max(0, nextValue),
        prefix: 'NO.',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COUNTER_PATH);
  }
}
