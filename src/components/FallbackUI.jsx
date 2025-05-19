import React from 'react';

function FallbackUI({ message }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Oops! Something went wrong.</h1>
      <p>{message || 'Please try again later.'}</p>
    </div>
  );
}

export default FallbackUI; 