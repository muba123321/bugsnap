import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApiKeySetup from './ApiKeySetup'

describe('ApiKeySetup', () => {
  it('renders key input and save button', () => {
    render(<ApiKeySetup onSave={vi.fn()} />)
    expect(screen.getByPlaceholderText(/sk-ant/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('save button is disabled when input is empty', () => {
    render(<ApiKeySetup onSave={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('shows error when key does not start with sk-ant', () => {
    render(<ApiKeySetup onSave={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/sk-ant/i), { target: { value: 'bad-key' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByText(/invalid api key/i)).toBeInTheDocument()
  })

  it('calls onSave with key when key starts with sk-ant', () => {
    const onSave = vi.fn()
    render(<ApiKeySetup onSave={onSave} />)
    fireEvent.change(screen.getByPlaceholderText(/sk-ant/i), { target: { value: 'sk-ant-valid' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onSave).toHaveBeenCalledWith('sk-ant-valid')
  })
})
