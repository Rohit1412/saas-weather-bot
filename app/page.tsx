"use client";

import SaasWeatherBot from '../components/SaasWeatherBot';

export default function Home() {
  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .floating-element {
          position: absolute;
          animation: float 10s ease-in-out infinite;
        }
        body {
          background-color: #111827;
        }
      `}</style>
      <main>
        <SaasWeatherBot />
      </main>
    </>
  )
}
