import { describe, expect, it } from 'vitest'
import { getStrokeRow, STROKE_KANA, STROKE_ROWS } from './kanaRows'

describe('STROKE_ROWS', () => {
  it('lists the basic hiragana rows in practice order', () => {
    expect(STROKE_ROWS.map((row) => row.id)).toEqual(['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa', 'n'])
    expect(STROKE_ROWS.map((row) => row.label)).toEqual(['あ行', 'か行', 'さ行', 'た行', 'な行', 'は行', 'ま行', 'や行', 'ら行', 'わ行', 'ん'])
  })

  it('contains all 46 basic hiragana once and returns rows by id', () => {
    expect(STROKE_KANA).toHaveLength(46)
    expect(new Set(STROKE_KANA).size).toBe(46)
    expect(getStrokeRow('ka').kana).toEqual(['か', 'き', 'く', 'け', 'こ'])
    expect(getStrokeRow('ya').kana).toEqual(['や', 'ゆ', 'よ'])
  })
})
