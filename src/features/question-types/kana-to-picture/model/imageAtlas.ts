import atlasManifestJson from '../data/image-atlas-manifest.json';
import { QuestionDataError } from './validator';

export type PictureImageRef = {
  atlasId: string;
  symbolId: string;
};

type ImageAtlasBase = {
  id: string;
  src: string;
  symbols: string[];
};

export type SvgImageAtlas = ImageAtlasBase & {
  format: 'svg-symbol';
};

export type RasterGridImageAtlas = ImageAtlasBase & {
  format: 'raster-grid';
  columns: number;
  rows: number;
  cellSize: number;
};

export type ImageAtlas = SvgImageAtlas | RasterGridImageAtlas;

export type ImageAtlasManifest = {
  atlases: ImageAtlas[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

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

  const format = raw.format ?? 'svg-symbol';
  if (format === 'svg-symbol') {
    return {
      id: raw.id,
      src: raw.src,
      symbols,
      format,
    };
  }

  if (
    format !== 'raster-grid' ||
    !isPositiveInteger(raw.columns) ||
    !isPositiveInteger(raw.rows) ||
    !isPositiveInteger(raw.cellSize) ||
    symbols.length > raw.columns * raw.rows
  ) {
    return invalidData();
  }

  return {
    id: raw.id,
    src: raw.src,
    symbols,
    format,
    columns: raw.columns,
    rows: raw.rows,
    cellSize: raw.cellSize,
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
