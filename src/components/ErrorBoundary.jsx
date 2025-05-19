'use client';
import React, { useState, useEffect } from 'react';

function ErrorBoundary({ children }) {
  // const [hasError, setHasError] = useState(false);

  // useEffect(() => {
  //   const handleError = (error) => {
  //     console.error('ErrorBoundary caught an error', error);
  //     setHasError(true);
  //   };

  //   window.addEventListener('error', handleError);

  //   return () => {
  //     window.removeEventListener('error', handleError);
  //   };
  // }, []);

  // if (hasError) {
  //   return <h1>Something went wrong.</h1>;
  // }

  return children;
}

export default ErrorBoundary; 