// src/components/LoadingSpinner.jsx
"use client";

import { Player } from '@lottiefiles/react-lottie-player';

export default function LoadingSpinner() {
  return <Player autoplay loop src="/animations/loaderSpinner.json" style={{ width: '100px', height: '100px' }} />;
}