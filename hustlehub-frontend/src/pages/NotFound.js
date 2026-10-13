import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          fontSize: '6rem',
          fontWeight: '800',
          color: '#4f46e5',
          margin: '0 0 0.25rem',
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#111827',
          margin: '0 0 0.75rem',
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          color: '#6b7280',
          fontSize: '0.95rem',
          maxWidth: '360px',
          margin: '0 0 2rem',
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: '0.65rem 1.5rem',
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '0.95rem',
          transition: 'background 0.2s',
        }}
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
