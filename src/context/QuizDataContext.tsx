import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { GlobalConfig, Question, Subject, Submission } from '../types';
import { DEFAULT_CONFIG, DEFAULT_QUESTIONS, DEFAULT_SUBJECTS } from '../lib/defaultData';

interface QuizDataContextType {
  config: GlobalConfig;
  subjects: Subject[];
  questions: Question[];
  submissions: Submission[];
  isLoading: boolean;
  isOnline: boolean;
  updateGlobalConfig: (newConfig: Partial<GlobalConfig>) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => Promise<string>;
  updateSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (subjectId: string) => Promise<void>;
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => Promise<string>;
  updateQuestion: (question: Question) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  recordSubmission: (submission: Omit<Submission, 'id'>) => Promise<void>;
  clearAllSubmissions: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const QuizDataContext = createContext<QuizDataContextType | null>(null);

export const QuizDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  // 1. Listen to Global Settings
  useEffect(() => {
    const configDocRef = doc(db, 'settings', 'global_config');
    const unsubscribe = onSnapshot(
      configDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setConfig({ ...DEFAULT_CONFIG, ...(snapshot.data() as GlobalConfig) });
        } else {
          // Initialize default config in Firestore
          setDoc(configDocRef, DEFAULT_CONFIG).catch((err) =>
            console.warn('Init config warning:', err)
          );
        }
        setIsOnline(true);
      },
      (error) => {
        console.warn('Settings snapshot offline fallback', error);
        setIsOnline(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Listen to Subjects
  useEffect(() => {
    const subjectsColRef = collection(db, 'subjects');
    const unsubscribe = onSnapshot(
      subjectsColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Subject[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Subject, 'id'>) });
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          setSubjects(list);
        } else {
          // Initialize default subjects in Firestore
          const batch = writeBatch(db);
          DEFAULT_SUBJECTS.forEach((sub) => {
            const ref = doc(db, 'subjects', sub.id);
            batch.set(ref, sub);
          });
          batch.commit().catch((err) => console.warn('Init subjects batch warning:', err));
          setSubjects(DEFAULT_SUBJECTS);
        }
      },
      (error) => {
        console.warn('Subjects snapshot offline fallback', error);
        setSubjects(DEFAULT_SUBJECTS);
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. Listen to Questions
  useEffect(() => {
    const questionsColRef = collection(db, 'questions');
    const unsubscribe = onSnapshot(
      questionsColRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Question[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              subjectId: data.subjectId || '',
              title: data.title || '',
              prompt: data.prompt || '',
              imageUrls: Array.isArray(data.imageUrls)
                ? data.imageUrls
                : data.imageUrl
                ? [data.imageUrl]
                : [],
              explanation: data.explanation || '',
              explanationImageUrls: Array.isArray(data.explanationImageUrls)
                ? data.explanationImageUrls
                : data.explanationImageUrl
                ? [data.explanationImageUrl]
                : [],
              acceptableAnswers: Array.isArray(data.acceptableAnswers)
                ? data.acceptableAnswers
                : [],
              order: data.order || 1,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          setQuestions(list);
        } else {
          // Initialize default questions in Firestore
          const batch = writeBatch(db);
          DEFAULT_QUESTIONS.forEach((q) => {
            const ref = doc(db, 'questions', q.id);
            batch.set(ref, q);
          });
          batch.commit().catch((err) => console.warn('Init questions batch warning:', err));
          setQuestions(DEFAULT_QUESTIONS);
        }
        setIsLoading(false);
      },
      (error) => {
        console.warn('Questions snapshot offline fallback', error);
        setQuestions(DEFAULT_QUESTIONS);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 4. Listen to Submissions (All Users' Answer Records across all devices!)
  useEffect(() => {
    const submissionsColRef = collection(db, 'submissions');
    const q = query(submissionsColRef, orderBy('submittedAt', 'desc'), limit(300));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Submission[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Submission, 'id'>) });
        });
        setSubmissions(list);
      },
      (error) => {
        console.warn('Submissions snapshot notice:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Update Config
  const updateGlobalConfig = useCallback(async (newConfig: Partial<GlobalConfig>) => {
    try {
      const configDocRef = doc(db, 'settings', 'global_config');
      const updated = {
        ...newConfig,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(configDocRef, updated, { merge: true });
      setConfig((prev) => ({ ...prev, ...updated }));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/global_config');
    }
  }, []);

  // Subjects CRUD
  const addSubject = useCallback(async (subjectData: Omit<Subject, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const newId = 'sub_' + Date.now().toString(36);
      const subject: Subject = {
        ...subjectData,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'subjects', newId), subject);
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'subjects');
    }
  }, []);

  const updateSubject = useCallback(async (subject: Subject): Promise<void> => {
    try {
      await setDoc(doc(db, 'subjects', subject.id), subject, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `subjects/${subject.id}`);
    }
  }, []);

  const deleteSubject = useCallback(async (subjectId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'subjects', subjectId));
      // Also delete questions under this subject
      const questionsToDelete = questions.filter((q) => q.subjectId === subjectId);
      const batch = writeBatch(db);
      questionsToDelete.forEach((q) => {
        batch.delete(doc(db, 'questions', q.id));
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `subjects/${subjectId}`);
    }
  }, [questions]);

  // Questions CRUD
  const addQuestion = useCallback(async (questionData: Omit<Question, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const newId = 'q_' + Date.now().toString(36);
      const question: Question = {
        ...questionData,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'questions', newId), question);
      return newId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'questions');
    }
  }, []);

  const updateQuestion = useCallback(async (question: Question): Promise<void> => {
    try {
      await setDoc(doc(db, 'questions', question.id), question, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `questions/${question.id}`);
    }
  }, []);

  const deleteQuestion = useCallback(async (questionId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'questions', questionId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `questions/${questionId}`);
    }
  }, []);

  // Record Answer Submission from any user or device
  const recordSubmission = useCallback(async (submissionData: Omit<Submission, 'id'>): Promise<void> => {
    try {
      await addDoc(collection(db, 'submissions'), submissionData);
    } catch (error) {
      console.warn('Record submission error:', error);
    }
  }, []);

  // Clear all submissions records (Admin tool)
  const clearAllSubmissions = useCallback(async (): Promise<void> => {
    try {
      const snapshot = await getDocs(collection(db, 'submissions'));
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      setSubmissions([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'submissions');
    }
  }, []);

  // Reset to default data
  const resetToDefaults = useCallback(async (): Promise<void> => {
    try {
      const batch = writeBatch(db);

      // Reset config
      batch.set(doc(db, 'settings', 'global_config'), DEFAULT_CONFIG);

      // Clean existing subjects & add defaults
      const curSubjects = await getDocs(collection(db, 'subjects'));
      curSubjects.forEach((d) => batch.delete(d.ref));
      DEFAULT_SUBJECTS.forEach((sub) => {
        batch.set(doc(db, 'subjects', sub.id), sub);
      });

      // Clean existing questions & add defaults
      const curQuestions = await getDocs(collection(db, 'questions'));
      curQuestions.forEach((d) => batch.delete(d.ref));
      DEFAULT_QUESTIONS.forEach((q) => {
        batch.set(doc(db, 'questions', q.id), q);
      });

      // Reset counter to 0
      batch.set(doc(db, 'counters', 'voucher_counter'), {
        currentCount: 0,
        prefix: 'NO.',
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();
      setConfig(DEFAULT_CONFIG);
      setSubjects(DEFAULT_SUBJECTS);
      setQuestions(DEFAULT_QUESTIONS);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reset_database');
    }
  }, []);

  return (
    <QuizDataContext.Provider
      value={{
        config,
        subjects,
        questions,
        submissions,
        isLoading,
        isOnline,
        updateGlobalConfig,
        addSubject,
        updateSubject,
        deleteSubject,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        recordSubmission,
        clearAllSubmissions,
        resetToDefaults,
      }}
    >
      {children}
    </QuizDataContext.Provider>
  );
};

export function useQuizData(): QuizDataContextType {
  const context = useContext(QuizDataContext);
  if (!context) {
    throw new Error('useQuizData must be used within a QuizDataProvider');
  }
  return context;
}
