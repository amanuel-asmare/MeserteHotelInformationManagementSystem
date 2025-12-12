'use client';

import React, { useState } from 'react';
import AddGuestModal from './modals/AddGuestModal';

function AddGuest() {
  // 1. Add state to control the modal
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Optional: Add a button to actually open the modal */}
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-amber-600 text-white rounded-lg mb-4"
      >
        Add Guest
      </button>

      {/* 2. Pass the required 'open' and 'onClose' props */}
      <AddGuestModal 
        open={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </div>
  );
}

export default AddGuest;/*import React from 'react'
import AddGuestModal from './modals/AddGuestModal'
function AddGuest() {
  return (
    <div><AddGuestModal/></div>
  )
}

export default AddGuest*/