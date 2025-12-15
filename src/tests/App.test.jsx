import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('deve renderizar o título', () => {
    render(<App />)
    
    expect(screen.getByText(/React \+ Vite \+ Tailwind/i)).toBeInTheDocument()
  })
})
