import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import GigCard from '../components/GigCard';
import { useAuth } from '../context/AuthContext';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const { user } = useAuth();

  const [gigs, setGigs] = useState([]);
  const [gigsLoading, setGigsLoading] = useState(true);
  const [gigsError, setGigsError] = useState('');

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');

  const [bookingFeedback, setBookingFeedback] = useState({ type: '', msg: '' });

  const fetchGigs = useCallback(async () => {
    setGigsLoading(true);
    setGigsError('');
    try {
      const response = await axiosInstance.get('/api/gigs');
      setGigs(response.data?.data || []);
    } catch (err) {
      setGigsError(
        err.response?.data?.message || 'Failed to load gigs. Please try again.'
      );
    } finally {
      setGigsLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    setBookingsError('');
    try {
      const response = await axiosInstance.get('/api/bookings/my');
      setBookings(response.data?.data || []);
    } catch (err) {
      setBookingsError(
        err.response?.data?.message || 'Failed to load bookings.'
      );
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGigs();
    fetchBookings();
  }, [fetchGigs, fetchBookings]);

  const handleBook = async (gigId) => {
    setBookingFeedback({ type: '', msg: '' });
    try {
      await axiosInstance.post('/api/bookings', { gigId });
      setBookingFeedback({
        type: 'success',
        msg: 'Gig booked successfully!',
      });
      fetchBookings();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Booking failed. Please try again.';
      setBookingFeedback({ type: 'error', msg: message });
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="client-dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome, <span className="dashboard-title__name">{user?.name}</span>!
        </h1>
        <p className="dashboard-subtitle">Find and book freelance gigs below.</p>
      </header>

      {/* ── Available Gigs ── */}
      <section className="dashboard-section">
        <h2 className="section-title">Available Gigs</h2>

        {bookingFeedback.msg && (
          <div
            className={`alert ${
              bookingFeedback.type === 'success' ? 'alert--success' : 'alert--error'
            }`}
            role={bookingFeedback.type === 'success' ? 'status' : 'alert'}
          >
            {bookingFeedback.msg}
          </div>
        )}

        {gigsLoading && <p className="loading-text">Loading gigs…</p>}
        {gigsError && (
          <div className="alert alert--error" role="alert">{gigsError}</div>
        )}

        {!gigsLoading && !gigsError && gigs.length === 0 && (
          <p className="empty-text">No gigs available at the moment.</p>
        )}

        {!gigsLoading && !gigsError && gigs.length > 0 && (
          <div className="gigs-grid">
            {gigs.map((gig) => (
              <GigCard
                key={gig._id}
                gig={gig}
                onBook={handleBook}
                isClient={true}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── My Bookings ── */}
      <section className="dashboard-section">
        <h2 className="section-title">My Bookings</h2>

        {bookingsLoading && <p className="loading-text">Loading bookings…</p>}
        {bookingsError && (
          <div className="alert alert--error" role="alert">{bookingsError}</div>
        )}

        {!bookingsLoading && !bookingsError && bookings.length === 0 && (
          <p className="empty-text">You have no bookings yet.</p>
        )}

        {!bookingsLoading && !bookingsError && bookings.length > 0 && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Gig Title</th>
                  <th>Freelancer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.gig?.title || booking.gigTitle || '—'}</td>
                    <td>
                      {booking.freelancer?.name ||
                        booking.freelancerName ||
                        '—'}
                    </td>
                    <td>{formatCurrency(booking.amount || booking.price || 0)}</td>
                    <td>
                      <span
                        className={`status-badge status-badge--${booking.status || 'pending'}`}
                      >
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`pay-badge pay-badge--${booking.paymentStatus || 'paid'}`}
                      >
                        {booking.paymentStatus || 'paid'}
                      </span>
                    </td>
                    <td>
                      {booking.createdAt
                        ? formatDate(booking.createdAt)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ClientDashboard;
