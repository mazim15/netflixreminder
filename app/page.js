"use client";

import NetflixRenewalTracker from '@/components/NetflixRenewalTracker';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Netflix Account Manager
        </h1>
        <NetflixRenewalTracker />
      </div>
    </main>
  );
}