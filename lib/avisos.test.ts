import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'
import { avisarSalvo } from './avisos'

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))

describe('avisarSalvo', () => {
  it('chama toast.success com "Salvo" por padrão', () => {
    avisarSalvo()
    expect(toast.success).toHaveBeenCalledWith('Salvo')
  })
})
