import type { HistoryRecord } from './historyTypes';

const HISTORY_KEY = 'manabinote.history.v1';
const MAX_HISTORY_RECORDS = 50;

export type StorageWriteResult = { ok: true } | { ok: false; reason: 'unavailable' | 'quota' };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isHistoryAnswer = (value: unknown): boolean =>
  isRecord(value) &&
  value.questionType === 'kana-to-picture' &&
  isNonEmptyString(value.questionId) &&
  isNonEmptyString(value.kana) &&
  isNonEmptyString(value.selectedChoiceId) &&
  isNonEmptyString(value.correctChoiceId) &&
  typeof value.isCorrect === 'boolean';

const isHistoryRecord = (value: unknown): value is HistoryRecord =>
  isRecord(value) &&
  isNonEmptyString(value.id) &&
  value.questionType === 'kana-to-picture' &&
  isNonEmptyString(value.startedAt) &&
  typeof value.score === 'number' &&
  Number.isInteger(value.score) &&
  value.score >= 0 &&
  typeof value.total === 'number' &&
  Number.isInteger(value.total) &&
  value.total > 0 &&
  value.score <= value.total &&
  Array.isArray(value.answers) &&
  value.answers.every(isHistoryAnswer);

const getDefaultStorage = (): Storage | undefined => {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
};

const parseHistory = (saved: string | null): HistoryRecord[] => {
  if (saved === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.every(isHistoryRecord) ? parsed : [];
  } catch {
    return [];
  }
};

const isQuotaError = (error: unknown): boolean => {
  if (!isRecord(error)) {
    return false;
  }

  return error.name === 'QuotaExceededError' || error.code === 22 || error.code === 1014;
};

export const loadHistory = (storage: Storage = getDefaultStorage() as Storage): HistoryRecord[] => {
  if (!storage) {
    return [];
  }

  try {
    return parseHistory(storage.getItem(HISTORY_KEY));
  } catch {
    return [];
  }
};

export const appendHistory = (
  record: HistoryRecord,
  storage: Storage = getDefaultStorage() as Storage,
): StorageWriteResult => {
  if (!storage || !isHistoryRecord(record)) {
    return { ok: false, reason: 'unavailable' };
  }

  try {
    const history = parseHistory(storage.getItem(HISTORY_KEY));
    storage.setItem(HISTORY_KEY, JSON.stringify([record, ...history].slice(0, MAX_HISTORY_RECORDS)));
    return { ok: true };
  } catch (error) {
    return isQuotaError(error) ? { ok: false, reason: 'quota' } : { ok: false, reason: 'unavailable' };
  }
};
