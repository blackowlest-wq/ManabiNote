import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { QuestionDataError } from './validator';
import { loadImageAtlasManifest, resolveImageAtlas, type ImageAtlasManifest } from './imageAtlas';

const validManifest: ImageAtlasManifest = {
  atlases: [
    {
      id: 'animals',
      src: '/images/animals.svg',
      format: 'svg-symbol',
      symbols: ['ant', 'dog'],
    },
    {
      id: 'objects',
      src: '/images/objects.svg',
      format: 'svg-symbol',
      symbols: ['umbrella', 'apple'],
    },
  ],
};

describe('loadImageAtlasManifest', () => {
  it('loads a valid atlas manifest', () => {
    const manifest = loadImageAtlasManifest();

    expect(manifest.atlases.length).toBeGreaterThan(0);
    expect(manifest.atlases[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        src: expect.any(String),
        symbols: expect.arrayContaining([expect.any(String)]),
      }),
    );
  });

  it('loads generated raster-grid metadata for every generated atlas', () => {
    const manifest = loadImageAtlasManifest();
    const generatedAtlases = ['animals-01', 'food-01', 'objects-01', 'nature-01'];

    const expectedRows = new Map([
      ['animals-01', 6],
      ['food-01', 5],
      ['objects-01', 8],
      ['nature-01', 5],
    ]);

    for (const atlasId of generatedAtlases) {
      const atlas = manifest.atlases.find((candidate) => candidate.id === atlasId);

      expect(atlas).toEqual(
        expect.objectContaining({
          format: 'raster-grid',
          src: `/images/kana-to-picture/atlases/${atlasId}-v2.webp`,
          columns: 6,
          rows: expectedRows.get(atlasId),
          cellSize: 320,
        }),
      );
    }
  });

  it('rejects raster-grid metadata with an invalid cell size', () => {
    const manifestWithInvalidRasterMetadata = {
      atlases: [
        {
          ...validManifest.atlases[0],
          format: 'raster-grid',
          columns: 2,
          rows: 1,
          cellSize: 0,
        },
      ],
    };

    expect(() => loadImageAtlasManifest(manifestWithInvalidRasterMetadata)).toThrow(QuestionDataError);
  });

  it('does not embed English labels in the picture atlases', () => {
    const manifest = loadImageAtlasManifest();

    for (const atlas of manifest.atlases) {
      const filePath = resolve(process.cwd(), 'public', atlas.src.slice(1));
      expect(readFileSync(filePath, 'utf8')).not.toMatch(/<text\b/i);
    }
  });

  it('rejects duplicate atlas IDs', () => {
    const manifestWithDuplicateAtlasIds = {
      atlases: [
        validManifest.atlases[0],
        { ...validManifest.atlases[1], id: validManifest.atlases[0].id },
      ],
    };

    expect(() => loadImageAtlasManifest(manifestWithDuplicateAtlasIds)).toThrow(QuestionDataError);
  });

  it('rejects duplicate symbols within the same atlas', () => {
    const manifestWithDuplicateSymbols = {
      atlases: [
        {
          ...validManifest.atlases[0],
          symbols: ['ant', 'ant'],
        },
      ],
    };

    expect(() => loadImageAtlasManifest(manifestWithDuplicateSymbols)).toThrow(QuestionDataError);
  });
});

describe('resolveImageAtlas', () => {
  it.each([
    ['unknown atlas', { atlasId: 'missing', symbolId: 'ant' }],
    ['unknown symbol', { atlasId: 'animals', symbolId: 'missing' }],
  ])('rejects %s references', (_, imageRef) => {
    expect(() => resolveImageAtlas(imageRef, validManifest)).toThrow(QuestionDataError);
  });
});
