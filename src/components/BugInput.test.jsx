import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BugInput from './BugInput'

describe('BugInput', () => {
  it('renders textarea and generate button', () => {
    render(<BugInput onGenerate={vi.fn()} loading={false} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('generate button disabled when textarea is empty', () => {
    render(<BugInput onGenerate={vi.fn()} loading={false} />)
    expect(screen.getByRole('button', { name: /generate/i })).toBeDisabled()
  })

  it('generate button enabled when textarea has text', () => {
    render(<BugInput onGenerate={vi.fn()} loading={false} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'login broken' } })
    expect(screen.getByRole('button', { name: /generate/i })).not.toBeDisabled()
  })

  it('calls onGenerate with input text on click', () => {
    const onGenerate = vi.fn()
    render(<BugInput onGenerate={onGenerate} loading={false} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'login broken' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(onGenerate).toHaveBeenCalledWith('login broken')
  })

  it('disables input and button while loading', () => {
    render(<BugInput onGenerate={vi.fn()} loading={true} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
