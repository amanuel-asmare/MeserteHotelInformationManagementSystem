'use client';

// Removed Navbar and Sidebar imports as they are handled by the main layout.
// Removed useState as local state for layout components is no longer needed here.

import ManagerStaffClient from './ManagerStaffClient';

// This component now acts as a clean container for your page's client-side logic.
// The main layout (`/manager/layout.tsx`) will wrap this component and provide the Navbar, Sidebar, and Footer.
export default function ClientWrapper() {
  return (
    // The parent layout already provides the main tag and padding,
    // so we can often just return the specific client component directly.
    // A fragment <> is used to avoid adding an unnecessary div.
    <>
      <ManagerStaffClient />
    </>
  );
}