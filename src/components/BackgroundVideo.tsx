import { useRef } from 'react';

interface BackgroundVideoProps {
  flipped?: boolean;
}

export default function BackgroundVideo({ flipped = false }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mp4Source = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260514_102933_4e8f73b5-775a-4179-b2fb-472f59063dcd.mp4";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        src={mp4Source}
        className={`absolute top-1/2 left-1/2 min-w-full min-h-full object-cover -translate-x-1/2 -translate-y-1/2 blur-md scale-105 ${flipped ? 'scale-y-[-1]' : ''}`}
      />
      <div className={`absolute inset-0 ${flipped ? 'bg-black/70' : 'bg-black/50'}`} />
      {!flipped && <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg to-transparent" />}
    </div>
  );
}
