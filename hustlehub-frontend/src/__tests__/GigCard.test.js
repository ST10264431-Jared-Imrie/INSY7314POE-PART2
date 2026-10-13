/* eslint-disable */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GigCard from '../components/GigCard';

const sampleGig = {
  _id: 'gig-001',
  title: 'Professional Logo Design',
  description:
    'I will design a professional logo for your business that stands out from the crowd.',
  price: 1500,
  freelancer: { name: 'Bob Smith' },
};

describe('GigCard component', () => {
  // Test 1: renders gig title, description, and price
  test('renders gig title, description, and formatted price', () => {
    render(<GigCard gig={sampleGig} onBook={jest.fn()} isClient={false} />);

    expect(
      screen.getByText('Professional Logo Design')
    ).toBeInTheDocument();

    // Description text is present (may be truncated)
    expect(
      screen.getByText(/i will design a professional logo/i)
    ).toBeInTheDocument();

    // Price should be formatted as currency (ZAR)
    const priceEl = screen.getByText(/1\s*[,.]?\s*500/);
    expect(priceEl).toBeInTheDocument();
  });

  // Test 2: Book button NOT shown when isClient=false
  test('does NOT show Book button when isClient is false', () => {
    render(<GigCard gig={sampleGig} onBook={jest.fn()} isClient={false} />);
    expect(screen.queryByRole('button', { name: /book now/i })).not.toBeInTheDocument();
  });

  // Test 3: Book button IS shown when isClient=true
  test('shows Book button when isClient is true', () => {
    render(<GigCard gig={sampleGig} onBook={jest.fn()} isClient={true} />);
    expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
  });

  // Test 4: calls onBook with the gig id when Book button is clicked
  test('calls onBook with the gig _id when Book button is clicked', () => {
    const mockOnBook = jest.fn();
    render(<GigCard gig={sampleGig} onBook={mockOnBook} isClient={true} />);

    const bookBtn = screen.getByRole('button', { name: /book now/i });
    fireEvent.click(bookBtn);

    expect(mockOnBook).toHaveBeenCalledTimes(1);
    expect(mockOnBook).toHaveBeenCalledWith('gig-001');
  });
});
