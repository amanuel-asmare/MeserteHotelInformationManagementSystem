'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Users, CalendarCheck2 } from 'lucide-react';

interface ReportHistoryItem {
  _id: string;
  // ✅ FIX #1: Add 'Comprehensive Cashier' to the list of accepted report types.
  reportType: 'Daily' | 'Occupancy' | 'Revenue' | 'Guest' | 'Comprehensive Cashier';
  reportData: any;
  generatedBy: { _id: string; firstName: string; lastName: string; role: string; };
  note?: string;
  createdAt: string;
}

interface ReportViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportHistoryItem;
}

const ReportViewModal: React.FC<ReportViewModalProps> = ({ isOpen, onClose, report }) => {
  if (!isOpen) return null;

  const renderReportData = (data: any, type: string) => {
    switch (type) {
      case 'Daily':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Report Date:</strong> {data.reportDate}</p>
            <p><strong>Total Revenue Today:</strong> ETB {data.totalRevenueToday?.toLocaleString()}</p>
            <p><strong>Occupancy Rate:</strong> {data.occupancyRate}</p>
            <p><strong>New Check-ins:</strong> {data.newCheckIns}</p>
            <p><strong>New Check-outs:</strong> {data.newCheckOuts}</p>
            <p><strong>New Bookings Today:</strong> {data.newBookingsToday}</p>
            <p><strong>Available Rooms:</strong> {data.availableRooms}</p>
            <p><strong>Occupied Rooms:</strong> {data.occupiedRooms}</p>
            <p><strong>Total Rooms:</strong> {data.totalRooms}</p>
          </div>
        );
      case 'Occupancy':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Date Range:</strong> {data.startDate} to {data.endDate}</p>
            <p><strong>Occupancy Rate:</strong> {data.occupancyRate}</p>
            <p><strong>Total Rooms:</strong> {data.totalRooms}</p>
            <p><strong>Occupied Rooms:</strong> {data.occupiedRooms}</p>
            <p><strong>Available Rooms:</strong> {data.availableRooms}</p>
          </div>
        );
      case 'Revenue':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Date Range:</strong> {data.startDate} to {data.endDate}</p>
            <p><strong>Total Overall Revenue:</strong> ETB {data.totalOverallRevenue?.toLocaleString()}</p>
            <p><strong>Food & Beverage Revenue:</strong> ETB {data.foodBeverageRevenue?.toLocaleString()}</p>
            <p><strong>Room Booking Revenue:</strong> ETB {data.roomBookingRevenue?.toLocaleString()}</p>
            <p><strong>Average Order Value:</strong> ETB {data.averageOrderValue?.toLocaleString()}</p>
            <p><strong>Number of Orders:</strong> {data.numberOfOrders}</p>
          </div>
        );
      case 'Guest':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Historical Report Range</p>
              <div className="flex items-center justify-center space-x-4">
                <p className="text-md font-semibold text-gray-800 dark:text-white">{data.startDate} to {data.endDate}</p>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-200 border-l pl-4">
                  <CalendarCheck2 size={18} className="mr-2 text-indigo-500"/>
                  <span className="font-bold mr-1">{data.newGuestsInDateRange}</span> guests in this period
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md flex items-start space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                  <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">New Guests (Last 7 Days)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.newGuestsInLast7Days}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Registered Guests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalRegisteredGuests}</p>
                </div>
              </div>
            </div>
            {data.recentGuestSignups && data.recentGuestSignups.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Most Recent Guest Signups</h4>
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {data.recentGuestSignups.map((guest: any) => (
                        <tr key={guest._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{`${guest.firstName} ${guest.lastName}`}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{guest.email}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{guest.phone || 'N/A'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{guest.registeredOn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      
      // ✅ FIX #2: Add a new case to handle the 'Comprehensive Cashier' report type.
      case 'Comprehensive Cashier':
        return (
          <div className="space-y-6">
            {/* Summary Section */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">ETB {data.summary?.totalRevenue}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Occupancy</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{data.summary?.avgOccupancy}%</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">New Bookings</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{data.summary?.newBookings}</p>
                </div>
                 <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Guests</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{data.summary?.totalGuests}</p>
                </div>
              </div>
            </div>

            {/* Revenue Breakdown Section */}
            <div>
               <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Revenue Breakdown</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Room Revenue</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">ETB {data.revenueBreakdown?.roomRevenue}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Food & Order Revenue</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">ETB {data.revenueBreakdown?.orderRevenue}</p>
                  </div>
               </div>
            </div>

            {/* Top Menu Items Section */}
            {data.topMenuItems && data.topMenuItems.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Top Menu Items Sold</h4>
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity Sold</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {data.topMenuItems.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.quantitySold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-x-auto text-sm">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {report.reportType} Report Details
            </h2>
            <div className="mb-4 space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Generated By:</strong> {report.generatedBy.firstName} {report.generatedBy.lastName} ({report.generatedBy.role})</p>
              <p><strong>Generated On:</strong> {new Date(report.createdAt).toLocaleString()}</p>
              {report.note && <p className="p-2 bg-yellow-50 dark:bg-yellow-800/20 rounded-md"><strong>Note:</strong> {report.note}</p>}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Report Data:</h3>
              {renderReportData(report.reportData, report.reportType)}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportViewModal;/*'use client';
//`frontend/src/components/ui/ReportViewModal.tsx` (NEW FILE)**




import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ReportHistoryItem {
  _id: string;
  reportType: 'Daily' | 'Occupancy' | 'Revenue' | 'Guest';
  reportData: any; // The actual report data
  generatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  note?: string;
  createdAt: string;
}

interface ReportViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportHistoryItem;
}

const ReportViewModal: React.FC<ReportViewModalProps> = ({ isOpen, onClose, report }) => {
  if (!isOpen) return null;

  const renderReportData = (data: any, type: string) => {
    // This is a basic rendering. You might want to create more specific components
    // for each report type to display them nicely.
    switch (type) {
      case 'Daily':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Report Date:</strong> {data.reportDate}</p>
            <p><strong>Total Revenue Today:</strong> ETB {data.totalRevenueToday?.toLocaleString()}</p>
            <p><strong>Occupancy Rate:</strong> {data.occupancyRate}</p>
            <p><strong>New Check-ins:</strong> {data.newCheckIns}</p>
            <p><strong>New Check-outs:</strong> {data.newCheckOuts}</p>
            <p><strong>New Bookings Today:</strong> {data.newBookingsToday}</p>
            <p><strong>Available Rooms:</strong> {data.availableRooms}</p>
            <p><strong>Occupied Rooms:</strong> {data.occupiedRooms}</p>
            <p><strong>Total Rooms:</strong> {data.totalRooms}</p>
          </div>
        );
      case 'Occupancy':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Date Range:</strong> {data.startDate} to {data.endDate}</p>
            <p><strong>Occupancy Rate:</strong> {data.occupancyRate}</p>
            <p><strong>Total Rooms:</strong> {data.totalRooms}</p>
            <p><strong>Occupied Rooms:</strong> {data.occupiedRooms}</p>
            <p><strong>Available Rooms:</strong> {data.availableRooms}</p>
          </div>
        );
      case 'Revenue':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Date Range:</strong> {data.startDate} to {data.endDate}</p>
            <p><strong>Total Overall Revenue:</strong> ETB {data.totalOverallRevenue?.toLocaleString()}</p>
            <p><strong>Food & Beverage Revenue:</strong> ETB {data.foodBeverageRevenue?.toLocaleString()}</p>
            <p><strong>Room Booking Revenue:</strong> ETB {data.roomBookingRevenue?.toLocaleString()}</p>
            <p><strong>Average Order Value:</strong> ETB {data.averageOrderValue?.toLocaleString()}</p>
            <p><strong>Number of Orders:</strong> {data.numberOfOrders}</p>
          </div>
        );
      case 'Guest':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <p><strong>Date Range:</strong> {data.startDate} to {data.endDate}</p>
              <p><strong>New Guests Registered:</strong> {data.newGuestsRegistered}</p>
              <p><strong>Total Registered Guests:</strong> {data.totalRegisteredGuests}</p>
            </div>
            {data.recentGuestSignups && data.recentGuestSignups.length > 0 && (
              <>
                <h4 className="text-lg font-semibold mt-4 mb-2">Recent Guest Signups:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b-2 border-gray-200 dark:border-gray-600 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                        <th className="px-4 py-2 border-b-2 border-gray-200 dark:border-gray-600 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                        <th className="px-4 py-2 border-b-2 border-gray-200 dark:border-gray-600 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Phone</th>
                        <th className="px-4 py-2 border-b-2 border-gray-200 dark:border-gray-600 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Registered On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentGuestSignups.map((guest: any) => (
                        <tr key={guest.id}>
                          {/* === THE FIX IS APPLIED ON THIS LINE === /}
                          <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200">{`${guest.firstName} ${guest.lastName}`}</td>
                          <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200">{guest.email}</td>
                          <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200">{guest.phone || 'N/A'}</td>
                          <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-200">{guest.registeredOn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );
      default:
        return <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-x-auto text-sm">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {report.reportType} Report Details
            </h2>
            <div className="mb-4 space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong>Generated By:</strong> {report.generatedBy.firstName} {report.generatedBy.lastName} ({report.generatedBy.role})</p>
              <p><strong>Generated On:</strong> {new Date(report.createdAt).toLocaleString()}</p>
              {report.note && <p><strong>Note:</strong> {report.note}</p>}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Report Data:</h3>
              {renderReportData(report.reportData, report.reportType)}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportViewModal;*/