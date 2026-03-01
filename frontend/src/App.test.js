import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Editex editor header', () => {
  render(<App />);
  const headerElement = screen.getByRole('banner');
  expect(headerElement).toBeInTheDocument();
  expect(headerElement.textContent).toContain('Editex');
});

test('renders formatting toolbar', () => {
  render(<App />);
  const toolbar = screen.getByRole('toolbar');
  expect(toolbar).toBeInTheDocument();
});

test('renders export PDF button', () => {
  render(<App />);
  const exportBtn = screen.getByText(/Export PDF/i);
  expect(exportBtn).toBeInTheDocument();
});
