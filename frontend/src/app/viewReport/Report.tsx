'use client';
import { Modal } from 'react-native';

import { useState, useEffect, useMemo, useCallback } from 'react';

import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  FileBarChart,
  CalendarDays,
  UserRound,
  ChevronLeft,
  ChevronRight,
  Hotel,
  DollarSign,
  Users
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import ReportViewModal from '../../../components/reportRecep/ReportViewModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext'; // Import Hook

interface ReportHistoryItem {
  _id: string;
  reportType: 'Daily' | 'Occupancy' | 'Revenue' | 'Guest' | 'Comprehensive Cashier';
  reportData: any;
  generatedBy: { _id: string; firstName: string; lastName: string; role: string; };
  note?: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:5000';
const REPORTS_PER_PAGE = 5;

type ActiveTab = 'receptionist' | 'cashier';

export default function ManagerReportsPage() {
  const { t, language } = useLanguage(); // Use Hook
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Define snapshot types inside component to access `t`
  const snapshotReportTypes = [
    { name: 'Daily', label: t('daily'), icon: CalendarDays, description: t('dailyDesc'), endpoint: 'daily' },
    { name: 'Occupancy', label: t('occupancy'), icon: Hotel, description: t('occupancyDesc'), endpoint: 'occupancy' },
    { name: 'Revenue', label: t('revenue'), icon: DollarSign, description: t('revenueDesc'), endpoint: 'revenue' },
    { name: 'Guest', label: t('guest'), icon: Users, description: t('guestDesc'), endpoint: 'guests' },
  ];

  const [activeTab, setActiveTab] = useState<ActiveTab>('receptionist');
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [snapshotLoading, setSnapshotLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportHistoryItem | null>(null);
  const [showRoyalLoading, setShowRoyalLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowRoyalLoading(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || !['manager', 'admin'].includes(user.role))) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchReportsHistory = useCallback(async (category: ActiveTab) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ReportHistoryItem[]>(`${API_URL}/api/reports/history`, {
        params: { category },
        withCredentials: true,
      });
      setReports(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reports history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !showRoyalLoading) {
      fetchReportsHistory(activeTab);
    }
  }, [activeTab, user, showRoyalLoading, fetchReportsHistory]);

  const handleGenerateSnapshot = async (reportEndpoint: string, reportType: string) => {
    setSnapshotLoading(reportType);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API_URL}/api/reports/${reportEndpoint}`, {
        params: { date: today, startDate: today, endDate: today },
        withCredentials: true,
      });

      const snapshotReport: ReportHistoryItem = {
        _id: `snapshot-${Date.now()}`,
        reportType: reportType as any,
        reportData: response.data,
        generatedBy: {
          _id: user?._id || 'system',
          firstName: user?.firstName || 'System',
          lastName: user?.lastName || '',
          role: user?.role || 'manager'
        },
        createdAt: new Date().toISOString(),
        note: t('snapshotNote')
      };

      setSelectedReport(snapshotReport);
      setIsModalOpen(true);
    } catch (err: any) {
      alert(`Failed to generate ${reportType} report snapshot.`);
    } finally {
      setSnapshotLoading(null);
    }
  };

  const handleViewReport = (report: ReportHistoryItem) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // ROYAL LOADING SCREEN
  if (showRoyalLoading || authLoading || !user) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-amber-950 via-black to-amber-900 flex items-center justify-center overflow-hidden z-50">
        {/* ... (Existing Animation Code) ... */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2.2 }} className="relative z-10 text-center px-8">
          {/* ... (Logo Animation) ... */}
          <motion.div
            animate={{ rotateY: [0, 360], scale: [1, 1.3, 1] }}
            transition={{ rotateY: { duration: 32, repeat: Infinity, ease: "linear" }, scale: { duration: 15, repeat: Infinity } }}
            className="relative mx-auto w-[420px] h-[420px] mb-20 perspective-1000"
            style={{ transformStyle: "preserve-3d" }}
          >
             <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-700 shadow-2xl ring-20 ring-yellow-400/70 blur-xl" />
             <div className="absolute inset-16 rounded-full bg-gradient-to-tr from-amber-950 to-black flex items-center justify-center shadow-inner">
               <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="text-10xl font-black text-yellow-400 tracking-widest drop-shadow-2xl" style={{ textShadow: "0 0 140px rgba(251,191,36,1)" }}>MH</motion.div>
             </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 4.8, duration: 2.2 }} className="text-7xl md:text-9xl font-black text-amber-300 tracking-widest mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t('royalInsights')}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 6.2, duration: 2.8 }} className="text-4xl text-amber-100 font-light tracking-widest mb-28">
            {t('dataMeetsMajesty')}
          </motion.p>
          
          <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 4.5, repeat: Infinity }} className="text-center mt-20 text-5xl font-medium text-amber-200 tracking-widest">
              {t('loadingAnalytics')}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white flex items-center">
            <FileBarChart className="mr-3 text-amber-500" size={36} />
            {t('reportingHub')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10">{t('reportingDesc')}</p>
        </motion.div>

        {/* Snapshots */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('todaysSnapshots')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {snapshotReportTypes.map(rt => (
              <motion.div
                key={rt.name}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
                whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)" }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <rt.icon className="text-amber-500" size={24} />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{rt.label}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{rt.description}</p>
                </div>
                <Button
                  onClick={() => handleGenerateSnapshot(rt.endpoint, rt.name)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={!!snapshotLoading}
                >
                  {snapshotLoading === rt.name ? t('generating') : t('generateView')}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* History */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">{t('reportHistory')}</h2>
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('receptionist')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'receptionist' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {t('receptionistReports')}
              </button>
              <button
                onClick={() => setActiveTab('cashier')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'cashier' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {t('cashierReports')}
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {error && <div className="p-4 mb-4 text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</div>}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {loading ? (
                  <div className="text-center p-12 text-gray-500">{t('loadingReports')}</div>
                ) : (
                  <ReportList reports={reports} onViewReport={handleViewReport} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      {selectedReport && (
        <ReportViewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          report={selectedReport}
        />
      )}
    </>
  );
}

// Reusable Report List Component
interface ReportListProps {
  reports: ReportHistoryItem[];
  onViewReport: (report: ReportHistoryItem) => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, onViewReport }) => {
  const { t, language } = useLanguage(); // Use Hook
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(reports.length / REPORTS_PER_PAGE);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
    return reports.slice(startIndex, startIndex + REPORTS_PER_PAGE);
  }, [reports, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [reports]);

  // Translate report types for display
  const getTranslatedType = (type: string) => {
      // Map the string from DB to the translation key
      if (type === 'Daily') return t('daily');
      if (type === 'Occupancy') return t('occupancy');
      if (type === 'Revenue') return t('revenue');
      if (type === 'Guest') return t('guest');
      if (type === 'Comprehensive Cashier') return t('comprehensiveCashier');
      return type; // Fallback
  }

  // Translate the word "Report" itself based on language context
  const reportWord = language === 'am' ? 'ሪፖርት' : 'Report';

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
        {paginatedReports.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedReports.map((report) => (
              <motion.div
                key={report._id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-4 flex-1 mb-3 sm:mb-0">
                  <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-xl">
                    <FileBarChart className="text-amber-600 dark:text-amber-400" size={24} />
                  </div>
                  <div>
                    {/* Fixed: Translated Type + Translated "Report" Word */}
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                        {getTranslatedType(report.reportType)} {reportWord}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <UserRound size={12} /> {report.generatedBy.firstName} {report.generatedBy.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} /> {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {report.note && <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">Note: "{report.note}"</p>}
                  </div>
                </div>
                <Button onClick={() => onViewReport(report)} className="px-4 py-2 text-sm w-full sm:w-auto">
                  {t('viewDetails')}
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 text-gray-500 dark:text-gray-400">
            <p>{t('noReportsFound')}</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline" className="px-3 py-2">
            <ChevronLeft size={18} />
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
          <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline" className="px-3 py-2">
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};
/*'use client';

import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  FileBarChart, 
  CalendarDays, 
  UserRound, 
  ChevronLeft, 
  ChevronRight, 
  Hotel, 
  TrendingUp, 
  Users, 
  DollarSign 
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import ReportViewModal from '../../../components/reportRecep/ReportViewModal'; // Adjusted path to match common structures
import { motion, AnimatePresence } from 'framer-motion';

// Define the structure for a saved report
interface ReportHistoryItem {
  _id: string;
  reportType: 'Daily' | 'Occupancy' | 'Revenue' | 'Guest';
  reportData: any;
  generatedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  note?: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const REPORTS_PER_PAGE = 5; // Reduced for better pagination demonstration

// Helper array for "Today's Snapshots" feature
const reportTypes = [
  { name: 'Daily', icon: CalendarDays, description: "Today's performance snapshot.", endpoint: 'daily' },
  { name: 'Occupancy', icon: Hotel, description: "Today's room occupancy.", endpoint: 'occupancy' },
  { name: 'Revenue', icon: DollarSign, description: "Today's total revenue.", endpoint: 'revenue' },
  { name: 'Guest', icon: Users, description: "Today's guest activity.", endpoint: 'guests' },
];

export default function ManagerReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // States remain the same
  const [reports, setReports] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [snapshotLoading, setSnapshotLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportHistoryItem | null>(null);
  const [filter, setFilter] = useState<'All' | ReportHistoryItem['reportType']>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Data fetching and handling logic remains the same
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'manager' && user.role !== 'admin'))) {
      router.push('/');
    } else if (user) {
      fetchReportsHistory();
    }
  }, [user, authLoading, router]);

  const fetchReportsHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ReportHistoryItem[]>(`${API_URL}/api/reports/history`, { withCredentials: true });
      setReports(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reports history.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSnapshot = async (reportEndpoint: string, reportType: ReportHistoryItem['reportType']) => {
    setSnapshotLoading(reportType);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API_URL}/api/reports/${reportEndpoint}`, {
        params: { date: today, startDate: today, endDate: today },
        withCredentials: true,
      });
      const snapshotReport: ReportHistoryItem = {
        _id: `snapshot-${Date.now()}`,
        reportType: reportType,
        reportData: response.data,
        generatedBy: { _id: user?._id || 'N/A', firstName: user?.firstName || 'System', lastName: user?.lastName || 'Generated', role: user?.role || 'manager' },
        createdAt: new Date().toISOString(),
        note: "This is a live snapshot generated for today. It has not been saved."
      };
      setSelectedReport(snapshotReport);
      setIsModalOpen(true);
    } catch (err: any) {
      alert(`Failed to generate ${reportType} report snapshot.`);
    } finally {
      setSnapshotLoading(null);
    }
  };

  const filteredReports = useMemo(() => {
    if (filter === 'All') return reports;
    return reports.filter((report) => report.reportType === filter);
  }, [reports, filter]);

  const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
    return filteredReports.slice(startIndex, startIndex + REPORTS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewReport = (report: ReportHistoryItem) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };
  
  // --- NEW: ADVANCED PAGINATION LOGIC ---
  const paginationItems = useMemo(() => {
    const items = [];
    // Sibling count: how many pages to show on each side of the current page
    const siblingCount = 1; 
    // Total page numbers to show: 1 (first) + 1 (last) + current + siblings + 2 ellipses
    const totalPageNumbers = siblingCount * 2 + 5; 

    if (totalPages <= totalPageNumbers) {
      // If there are few pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

      items.push(1); // Always show the first page

      if (shouldShowLeftDots) {
        items.push('...');
      }

      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i > 1 && i < totalPages) {
          items.push(i);
        }
      }

      if (shouldShowRightDots) {
        items.push('...');
      }
      
      items.push(totalPages); // Always show the last page
    }
    return items;
  }, [currentPage, totalPages]);


  if (authLoading || (!user && !authLoading) || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading Report Center...</div>;
  }

  return (
    <>
      <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white flex items-center">
            <FileBarChart className="mr-3 text-amber-500" size={36} />
            Reporting Hub
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10">Generate live snapshots or browse the complete report history.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Today's Snapshots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {reportTypes.map(rt => (
              <motion.div key={rt.name} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between" whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)" }}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <rt.icon className="text-amber-500" size={24} />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{rt.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{rt.description}</p>
                </div>
                <Button onClick={() => handleGenerateSnapshot(rt.endpoint, rt.name as ReportHistoryItem['reportType'])} className="w-full bg-amber-500 hover:bg-amber-600 text-white" loading={snapshotLoading === rt.name} disabled={!!snapshotLoading}>
                  {snapshotLoading === rt.name ? 'Generating...' : 'Generate & View'}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Report History</h2>
            <div className="flex flex-wrap gap-2 mb-6">
                {(['All', 'Daily', 'Occupancy', 'Revenue', 'Guest'] as const).map(f => (
                    <Button key={f} onClick={() => handleFilterChange(f)} variant={filter === f ? 'solid' : 'outline'} className={`px-4 py-2 text-sm rounded-full ${filter === f ? 'bg-amber-600 text-white border-amber-600' : 'bg-white dark:bg-gray-800'}`}>
                        {f}
                    </Button>
                ))}
            </div>

            {error && <div className="p-4 mb-4 text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</div>}

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700">
                <AnimatePresence>
                    {paginatedReports.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedReports.map((report) => (
                                <motion.div key={report._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <div className="flex items-center gap-4 flex-1 mb-3 sm:mb-0">
                                        <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-xl"><FileBarChart className="text-amber-600 dark:text-amber-400" size={24}/></div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{report.reportType} Report</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                <span className="flex items-center gap-1"><UserRound size={12} /> {report.generatedBy.firstName} {report.generatedBy.lastName}</span>
                                                <span className="flex items-center gap-1"><CalendarDays size={12} /> {new Date(report.createdAt).toLocaleString()}</span>
                                            </div>
                                            {report.note && <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic">Note: "{report.note}"</p>}
                                        </div>
                                    </div>
                                    <Button onClick={() => handleViewReport(report)} className="px-4 py-2 text-sm w-full sm:w-auto">View Details</Button>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-12 text-gray-500 dark:text-gray-400"><p>No reports found for the selected filter.</p></div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- NEW, ENHANCED PAGINATION CONTROLS --- /}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                    <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline" className="px-3 py-2">
                        <ChevronLeft size={18} />
                    </Button>
                    {paginationItems.map((item, index) =>
                        typeof item === 'number' ? (
                            <Button
                                key={index}
                                onClick={() => handlePageChange(item)}
                                variant={currentPage === item ? 'solid' : 'outline'}
                                className={`w-10 h-10 rounded-full ${currentPage === item ? 'bg-amber-600 text-white' : 'bg-white dark:bg-gray-800'}`}
                            >
                                {item}
                            </Button>
                        ) : (
                            <span key={index} className="px-2 text-gray-500">...</span>
                        )
                    )}
                    <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline" className="px-3 py-2">
                        <ChevronRight size={18} />
                    </Button>
                </div>
            )}
        </motion.div>
      </div>

      {selectedReport && (
        <ReportViewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          report={selectedReport}
        />
      )}
    </>
  );
}*/