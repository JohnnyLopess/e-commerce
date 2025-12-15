import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('deve renderizar o título', () => {
    render(<App />)
    
    expect(screen.getByText(/Texto que nao existe/i)).toBeInTheDocument()
  })
})
