import atlasManifestJson from '../data/image-atlas-manifest.json';
import { QuestionDataError } from './validator';

export type PictureImageRef = {
  atlasId: string;
  symbolId: string;
};

export type ImageAtlas = {
  id: string;
  src: string;
  symbols: string[];
};

export type ImageAtlasManifest = {
  atlases: ImageAtlas[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const invalidData = (): never => {
  throw new QuestionDataError();
};

const validateAtlas = (raw: unknown): ImageAtlas => {
  if (
    !isRecord(raw) ||
    !isNonEmptyString(raw.id) ||
    !isNonEmptyString(raw.src) ||
    !Array.isArray(raw.symbols) ||
    raw.symbols.length === 0 ||
    raw.symbols.some((symbol) => !isNonEmptyString(symbol))
  ) {
    return invalidData();
  }

  const symbols = raw.symbols;
  if (new Set(symbols).size !== symbols.length) {
    return invalidData();
  }

  return {
    id: raw.id,
    src: raw.src,
    symbols,
  };
};

export const loadImageAtlasManifest = (raw: unknown = atlasManifestJson): ImageAtlasManifest => {
  if (!isRecord(raw) || !Array.isArray(raw.atlases) || raw.atlases.length === 0) {
    return invalidData();
  }

  const atlases = raw.atlases.map(validateAtlas);
  const atlasIds = atlases.map((atlas) => atlas.id);
  if (new Set(atlasIds).size !== atlasIds.length) {
    return invalidData();
  }

  return { atlases };
};

export const resolveImageAtlas = (
  ref: PictureImageRef,
  manifest: ImageAtlasManifest = loadImageAtlasManifest(),
): ImageAtlas => {
  const atlasById = new Map(manifest.atlases.map((atlas) => [atlas.id, atlas]));
  const atlas = atlasById.get(ref.atlasId);

  if (!atlas || !atlas.symbols.includes(ref.symbolId)) {
    return invalidData();
  }

  return atlas;
};

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const resolvePictureImageSrc = (
  ref: PictureImageRef,
  manifest: ImageAtlasManifest = loadImageAtlasManifest(),
): string => {
  const atlas = resolveImageAtlas(ref, manifest);
  const atlasLabel = escapeXml(atlas.id);
  const symbolLabel = escapeXml(ref.symbolId);
  const atlasSrcLabel = escapeXml(atlas.src);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${symbolLabel}"><rect width="160" height="160" rx="24" fill="#F5F3FF"/><rect x="12" y="12" width="136" height="136" rx="20" fill="#DDD6FE" stroke="#8B5CF6" stroke-width="4"/><text x="80" y="74" text-anchor="middle" font-size="18" font-family="sans-serif" fill="#4C1D95">${symbolLabel}</text><text x="80" y="104" text-anchor="middle" font-size="10" font-family="sans-serif" fill="#6D28D9">${atlasLabel}</text><text x="80" y="122" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#7C3AED">${atlasSrcLabel}</text></svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
