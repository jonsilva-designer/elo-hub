import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  it('desabilitado mostra o cursor de bloqueio (sem pointer-events-none)', () => {
    render(<Input aria-label="x" disabled />)
    const classes = screen.getByLabelText('x').className
    expect(classes).toContain('disabled:cursor-not-allowed')
    expect(classes).not.toContain('pointer-events-none')
  })
})
