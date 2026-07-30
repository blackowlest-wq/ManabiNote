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
      symbols: ['ant', 'dog'],
    },
    {
      id: 'objects',
      src: '/images/objects.svg',
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
