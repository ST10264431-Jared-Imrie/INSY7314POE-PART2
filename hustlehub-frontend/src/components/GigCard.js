import React from 'react';
import './GigCard.css';

/**
 * GigCard
 * Props:
 *  - gig: { _id, title, description, price, freelancer: { name } }
 *  - onBook: (gigId) => void
 *  - isClient: boolean
 */
const GigCard = ({ gig, onBook, isClient }) => {
  const truncate = (text, maxLen = 100) => {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  return (
    <div className="gig-card">
      <div className="gig-card__header">
        <h3 className="gig-card__title">{gig.title}</h3>
        <span className="gig-card__price">{formatCurrency(gig.price)}</span>
      </div>
      <p className="gig-card__description">{truncate(gig.description)}</p>
      <div className="gig-card__footer">
        <span className="gig-card__freelancer">
          By{' '}
          <strong>
            {gig.freelancer?.name || gig.freelancerName || 'Unknown'}
          </strong>
        </span>
        {isClient && (
          <button
            className="gig-card__book-btn"
            onClick={() => onBook(gig._id)}
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
};

export default GigCard;
