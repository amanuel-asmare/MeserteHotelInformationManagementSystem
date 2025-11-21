// src/app/customer/bookings/page.tsx
'use client';

// Import the component that contains all the page logic and UI
import CustomerBookingClient from './CustomerBookingClient';

// The page component now simply returns the client component.
// The layout (Navbar, Sidebar, etc.) is automatically added by `src/app/customer/layout.tsx`.
export default function BookingsPage() {
  return <CustomerBookingClient />;
}