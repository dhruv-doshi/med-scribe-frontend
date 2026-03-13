import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (classname utility)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('handles undefined and null gracefully', () => {
    expect(cn('foo', undefined, null as unknown as string, 'bar')).toBe('foo bar')
  })

  it('returns empty string with no args', () => {
    expect(cn()).toBe('')
  })
})
