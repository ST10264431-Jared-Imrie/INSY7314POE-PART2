import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './FreelancerDashboard.css';

const EMPTY_GIG_FORM = { title: '', description: '', price: '' };

const FreelancerDashboard = () => {
  const { user } = useAuth();

  // ── My Gigs state ──
  const [gigs, setGigs] = useState([]);
  const [gigsLoading, setGigsLoading] = useState(true);
  const [gigsError, setGigsError] = useState('');

  // ── Create Gig form ──
  const [createForm, setCreateForm] = useState(EMPTY_GIG_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [createFeedback, setCreateFeedback] = useState({ type: '', msg: '' });
  const [createLoading, setCreateLoading] = useState(false);

  // ── Edit Gig state ──
  const [editingGigId, setEditingGigId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_GIG_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [editFeedback, setEditFeedback] = useState({ type: '', msg: '' });
  const [editLoading, setEditLoading] = useState(false);

  // ── Bookings on my gigs ──
  const [gigBookings, setGigBookings] = useState([]);
  const [gigBookingsLoading, setGigBookingsLoading] = useState(true);
  const [gigBookingsError, setGigBookingsError] = useState('');

  // ── Earnings ──
  const [earnings, setEarnings] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState('');

  const fetchMyGigs = useCallback(async () => {
    setGigsLoading(true);
    setGigsError('');
    try {
      const res = await axiosInstance.get('/api/gigs/my');
      setGigs(res.data?.data || []);
    } catch (err) {
      setGigsError(err.response?.data?.message || 'Failed to load your gigs.');
    } finally {
      setGigsLoading(false);
    }
  }, []);

  const fetchGigBookings = useCallback(async () => {
    setGigBookingsLoading(true);
    setGigBookingsError('');
    try {
      const res = await axiosInstance.get('/api/bookings/my-gigs');
      setGigBookings(res.data?.data || []);
    } catch (err) {
      setGigBookingsError(
        err.response?.data?.message || 'Failed to load bookings on your gigs.'
      );
    } finally {
      setGigBookingsLoading(false);
    }
  }, []);

  const fetchEarnings = useCallback(async () => {
    setEarningsLoading(true);
    setEarningsError('');
    try {
      const res = await axiosInstance.get('/api/bookings/earnings');
      setEarnings(
        res.data?.data || {
          totalEarnings: 0,
          totalBookings: 0,
          completedBookings: 0,
          pendingEarnings: 0,
        }
      );
    } catch (err) {
      setEarningsError(
        err.response?.data?.message || 'Failed to load earnings.'
      );
    } finally {
      setEarningsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyGigs();
    fetchGigBookings();
    fetchEarnings();
  }, [fetchMyGigs, fetchGigBookings, fetchEarnings]);

  // ── Create gig helpers ──
  const validateGigForm = (form) => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (!form.price) {
      errs.price = 'Price is required.';
    } else if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      errs.price = 'Price must be a positive number.';
    }
    return errs;
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    if (createErrors[name])
      setCreateErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateFeedback({ type: '', msg: '' });
    const errs = validateGigForm(createForm);
    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      return;
    }
    setCreateLoading(true);
    try {
      await axiosInstance.post('/api/gigs', {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        price: Number(createForm.price),
      });
      setCreateFeedback({ type: 'success', msg: 'Gig created successfully!' });
      setCreateForm(EMPTY_GIG_FORM);
      fetchMyGigs();
    } catch (err) {
      setCreateFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to create gig.',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Edit gig helpers ──
  const startEdit = (gig) => {
    setEditingGigId(gig._id);
    setEditForm({
      title: gig.title,
      description: gig.description,
      price: String(gig.price),
    });
    setEditErrors({});
    setEditFeedback({ type: '', msg: '' });
  };

  const cancelEdit = () => {
    setEditingGigId(null);
    setEditForm(EMPTY_GIG_FORM);
    setEditErrors({});
    setEditFeedback({ type: '', msg: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditFeedback({ type: '', msg: '' });
    const errs = validateGigForm(editForm);
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }
    setEditLoading(true);
    try {
      await axiosInstance.put(`/api/gigs/${editingGigId}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        price: Number(editForm.price),
      });
      setEditFeedback({ type: 'success', msg: 'Gig updated!' });
      setEditingGigId(null);
      fetchMyGigs();
    } catch (err) {
      setEditFeedback({
        type: 'error',
        msg: err.response?.data?.message || 'Failed to update gig.',
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (gigId, gigTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${gigTitle}"? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await axiosInstance.delete(`/api/gigs/${gigId}`);
      fetchMyGigs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete gig.');
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
    <div className="freelancer-dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome, <span className="dashboard-title__name">{user?.name}</span>!
        </h1>
        <p className="dashboard-subtitle">Manage your gigs and track earnings.</p>
      </header>

      {/* ── Earnings summary ── */}
      <section className="dashboard-section">
        <h2 className="section-title">Earnings</h2>
        {earningsLoading && <p className="loading-text">Loading earnings…</p>}
        {earningsError && (
          <div className="alert alert--error" role="alert">{earningsError}</div>
        )}
        {!earningsLoading && !earningsError && earnings && (
          <div className="earnings-card">
            <div className="earnings-card__main">
              <span className="earnings-card__label">Total Earnings</span>
              <span className="earnings-card__amount">
                {formatCurrency(earnings.totalEarnings || 0)}
              </span>
            </div>
            <div className="earnings-card__stats">
              <span>{earnings.totalBookings || 0} bookings</span>
              <span>{earnings.completedBookings || 0} completed</span>
              <span>{formatCurrency(earnings.pendingEarnings || 0)} pending</span>
              <span>{earnings.cancelledBookings || 0} cancelled</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Create Gig ── */}
      <section className="dashboard-section">
        <h2 className="section-title">Create a New Gig</h2>
        {createFeedback.msg && (
          <div
            className={`alert ${
              createFeedback.type === 'success' ? 'alert--success' : 'alert--error'
            }`}
            role={createFeedback.type === 'success' ? 'status' : 'alert'}
          >
            {createFeedback.msg}
          </div>
        )}
        <form className="gig-form" onSubmit={handleCreateSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="create-title" className="form-label">Title</label>
            <input
              id="create-title"
              type="text"
              name="title"
              className={`form-input ${createErrors.title ? 'form-input--error' : ''}`}
              value={createForm.title}
              onChange={handleCreateChange}
              placeholder="e.g. Professional Logo Design"
            />
            {createErrors.title && (
              <span className="form-error">{createErrors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="create-description" className="form-label">
              Description
            </label>
            <textarea
              id="create-description"
              name="description"
              className={`form-input form-textarea ${
                createErrors.description ? 'form-input--error' : ''
              }`}
              value={createForm.description}
              onChange={handleCreateChange}
              placeholder="Describe what you'll deliver…"
              rows={3}
            />
            {createErrors.description && (
              <span className="form-error">{createErrors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="create-price" className="form-label">
              Price (ZAR)
            </label>
            <input
              id="create-price"
              type="number"
              name="price"
              className={`form-input ${createErrors.price ? 'form-input--error' : ''}`}
              value={createForm.price}
              onChange={handleCreateChange}
              placeholder="e.g. 500"
              min="0"
              step="0.01"
            />
            {createErrors.price && (
              <span className="form-error">{createErrors.price}</span>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={createLoading}>
            {createLoading ? 'Creating…' : 'Create Gig'}
          </button>
        </form>
      </section>

      {/* ── My Gigs table ── */}
      <section className="dashboard-section">
        <h2 className="section-title">My Gigs</h2>

        {editFeedback.msg && (
          <div
            className={`alert ${
              editFeedback.type === 'success' ? 'alert--success' : 'alert--error'
            }`}
            role={editFeedback.type === 'success' ? 'status' : 'alert'}
          >
            {editFeedback.msg}
          </div>
        )}

        {gigsLoading && <p className="loading-text">Loading your gigs…</p>}
        {gigsError && (
          <div className="alert alert--error" role="alert">{gigsError}</div>
        )}
        {!gigsLoading && !gigsError && gigs.length === 0 && (
          <p className="empty-text">You haven't created any gigs yet.</p>
        )}

        {!gigsLoading && !gigsError && gigs.length > 0 && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {gigs.map((gig) =>
                  editingGigId === gig._id ? (
                    <tr key={gig._id} className="edit-row">
                      <td colSpan={4}>
                        <form
                          className="inline-edit-form"
                          onSubmit={handleEditSubmit}
                          noValidate
                        >
                          <div className="inline-edit-fields">
                            <div className="form-group">
                              <input
                                type="text"
                                name="title"
                                className={`form-input ${
                                  editErrors.title ? 'form-input--error' : ''
                                }`}
                                value={editForm.title}
                                onChange={handleEditChange}
                                placeholder="Title"
                              />
                              {editErrors.title && (
                                <span className="form-error">{editErrors.title}</span>
                              )}
                            </div>
                            <div className="form-group">
                              <textarea
                                name="description"
                                className={`form-input form-textarea ${
                                  editErrors.description ? 'form-input--error' : ''
                                }`}
                                value={editForm.description}
                                onChange={handleEditChange}
                                placeholder="Description"
                                rows={2}
                              />
                              {editErrors.description && (
                                <span className="form-error">
                                  {editErrors.description}
                                </span>
                              )}
                            </div>
                            <div className="form-group">
                              <input
                                type="number"
                                name="price"
                                className={`form-input ${
                                  editErrors.price ? 'form-input--error' : ''
                                }`}
                                value={editForm.price}
                                onChange={handleEditChange}
                                placeholder="Price"
                                min="0"
                                step="0.01"
                              />
                              {editErrors.price && (
                                <span className="form-error">{editErrors.price}</span>
                              )}
                            </div>
                          </div>
                          <div className="inline-edit-actions">
                            <button
                              type="submit"
                              className="btn-sm btn-sm--success"
                              disabled={editLoading}
                            >
                              {editLoading ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              type="button"
                              className="btn-sm btn-sm--secondary"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={gig._id}>
                      <td>{gig.title}</td>
                      <td className="td-description">
                        {gig.description?.slice(0, 80)}
                        {gig.description?.length > 80 ? '…' : ''}
                      </td>
                      <td>{formatCurrency(gig.price)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-sm btn-sm--primary"
                            onClick={() => startEdit(gig)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-sm btn-sm--danger"
                            onClick={() => handleDelete(gig._id, gig.title)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Bookings on my gigs ── */}
      <section className="dashboard-section">
        <h2 className="section-title">Bookings on My Gigs</h2>
        {gigBookingsLoading && (
          <p className="loading-text">Loading bookings…</p>
        )}
        {gigBookingsError && (
          <div className="alert alert--error" role="alert">
            {gigBookingsError}
          </div>
        )}
        {!gigBookingsLoading && !gigBookingsError && gigBookings.length === 0 && (
          <p className="empty-text">No bookings on your gigs yet.</p>
        )}
        {!gigBookingsLoading && !gigBookingsError && gigBookings.length > 0 && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Gig Title</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {gigBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.gig?.title || booking.gigTitle || '—'}</td>
                    <td>
                      {booking.client?.name || booking.clientName || '—'}
                    </td>
                    <td>{formatCurrency(booking.amount || booking.price || 0)}</td>
                    <td>
                      <span
                        className={`status-badge status-badge--${
                          booking.status || 'pending'
                        }`}
                      >
                        {booking.status || 'pending'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`pay-badge pay-badge--${
                          booking.paymentStatus || 'paid'
                        }`}
                      >
                        {booking.paymentStatus || 'paid'}
                      </span>
                    </td>
                    <td>
                      {booking.createdAt ? formatDate(booking.createdAt) : '—'}
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

export default FreelancerDashboard;
