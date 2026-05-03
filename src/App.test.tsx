import { describe, it, expect } from 'vitest'
import { render, screen } from './test/test-utils'
import App from './App'

describe('App', () => {
  it('renders the app heading', () => {
    render(<App />)
    expect(screen.getByText('Job Hunt Tracker')).toBeInTheDocument()
  })
})
