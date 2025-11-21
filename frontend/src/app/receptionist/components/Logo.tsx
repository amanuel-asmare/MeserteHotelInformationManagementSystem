'use client'; 
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
function Logo() {
  return (
    <div>   {/* Logo - Adjusted Size and better positioning to prevent covering */}
                <Link  className="flex items-center space-x-2">
                    <Image
                        src="/MHIMS_LOGO.png" // Path to your public folder image
                        alt="Meseret Hotel Logo"
                        width={100} // Adjusted width to better fit and avoid overlap
                        height={100} // Adjusted height
                        className="rounded-lg shadow-md flex-shrink-0" // flex-shrink-0 to prevent shrinking
                    /></div>
  )
}

export default Logo