import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App', () => {
  it('deve renderizar o estado de carregamento inicial', () => {
    render(<App />)
    
    expect(screen.getByText(/Carregando.../i)).toBeInTheDocument()
  })
})
