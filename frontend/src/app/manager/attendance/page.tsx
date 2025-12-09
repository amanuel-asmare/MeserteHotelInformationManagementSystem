'use client';
import { Text, Modal } from 'react-native';

import { useState, useEffect } from 'react';

import { format, parseISO, isValid } from 'date-fns';
import { CalendarIcon, UserIcon, EditIcon, HistoryIcon, PlusCircleIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../../../context/LanguageContext'; // ← ADD THIS

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../../components/reportRecep/card';

import { Button } from '../../../../components/ui/receptionistUI/button';
import { Input } from '../../../../components/ui/Input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../../../components/reportRecep/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/receptionistUI/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../../components/ui/receptionistUI/dialog';
import { Label } from '../../../../components/reportRecep/label';
import { Textarea } from '../../../../components/ui/textarea';
import { DatePicker } from '../../../../components/attendance/DataPicker';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AttendanceRecord {
  _id: string;
  user: User;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'present' | 'absent' | 'leave' | 'half-day' | 'pending' | 'approved';
  notes?: string;
  markedBy: User;
  createdAt: string;
  updatedAt: string;
}

interface StaffAttendanceEntry {
  staff: User;
  attendance: AttendanceRecord | null;
}

type AttendanceStatus = 'present' | 'absent' | 'leave' | 'half-day' | 'pending' | 'approved';

const formatTime = (isoString: string | null) => {
  if (!isoString) return '-';
  const date = parseISO(isoString);
  return isValid(date) ? format(date, 'hh:mm a') : '-';
};

const formatDateForDisplay = (isoString: string) => {
  const date = parseISO(isoString);
  return isValid(date) ? format(date, 'PPP') : '-';
};

export default function ManageAttendancePage() {
  const { t } = useLanguage();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceList, setAttendanceList] = useState<StaffAttendanceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState<AttendanceRecord | null>(null);
  const [currentStaffForHistory, setCurrentStaffForHistory] = useState<User | null>(null);
  const [staffHistory, setStaffHistory] = useState<AttendanceRecord[]>([]);
  const [allStaff, setAllStaff] = useState<User[]>([]);

  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editStatus, setEditStatus] = useState<AttendanceStatus>('pending');
  const [editNotes, setEditNotes] = useState('');

  const [createUserId, setCreateUserId] = useState('');
  const [createStatus, setCreateStatus] = useState<AttendanceStatus>('absent');
  const [createCheckIn, setCreateCheckIn] = useState('');
  const [createCheckOut, setCreateCheckOut] = useState('');
  const [createNotes, setCreateNotes] = useState('');
  const [createDate, setCreateDate] = useState<Date>(new Date());

  useEffect(() => {
    fetchAllStaff();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchAllStaff = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`, { withCredentials: true });
      const staffMembers = res.data.filter((u: User) => ['receptionist', 'cashier'].includes(u.role));
      setAllStaff(staffMembers);
    } catch (error) {
      console.error('Failed to fetch all staff:', error);
      toast.error(t('failedLoadStaff') || 'Failed to fetch staff list.');
    }
  };

  const fetchAttendanceForDate = async (date: Date) => {
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const res = await axios.get(`${API_URL}/api/attendance/manager/date/${formattedDate}`, { withCredentials: true });
      setAttendanceList(res.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast.error(t('failedLoadAttendance') || 'Failed to load attendance for this date.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (entry: StaffAttendanceEntry) => {
    if (!entry.attendance) {
      toast.info(t('noRecordUseCreate') || 'No existing record. Use "Mark Attendance" to add a new entry.');
      return;
    }
    setCurrentAttendance(entry.attendance);
    setEditCheckIn(entry.attendance.checkIn ? format(parseISO(entry.attendance.checkIn), "HH:mm") : '');
    setEditCheckOut(entry.attendance.checkOut ? format(parseISO(entry.attendance.checkOut), "HH:mm") : '');
    setEditStatus(entry.attendance.status);
    setEditNotes(entry.attendance.notes || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateAttendance = async () => {
    if (!currentAttendance) return;
    const dateISO = format(parseISO(currentAttendance.date), 'yyyy-MM-dd');
    const updatePayload = {
      checkIn: editCheckIn ? new Date(`${dateISO}T${editCheckIn}:00.000Z`).toISOString() : null,
      checkOut: editCheckOut ? new Date(`${dateISO}T${editCheckOut}:00.000Z`).toISOString() : null,
      status: editStatus,
      notes: editNotes,
    };
    try {
      await axios.put(`${API_URL}/api/attendance/manager/${currentAttendance._id}`, updatePayload, { withCredentials: true });
      toast.success(t('attendanceUpdated') || 'Attendance updated successfully!');
      setIsEditModalOpen(false);
      fetchAttendanceForDate(selectedDate);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('failedUpdate') || 'Failed to update attendance.');
    }
  };

  const handleViewHistoryClick = async (staff: User) => {
    setCurrentStaffForHistory(staff);
    setIsHistoryModalOpen(true);
    try {
      const res = await axios.get(`${API_URL}/api/attendance/manager/history/${staff._id}`, { withCredentials: true });
      setStaffHistory(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('failedLoadHistory') || 'Failed to load staff attendance history.');
      setStaffHistory([]);
    }
  };

  const handleCreateAttendance = async () => {
    if (!createUserId || !createDate || !createStatus) {
      toast.error(t('requiredFields') || 'Staff, date, and status are required to create attendance.');
      return;
    }
    const dateISO = format(createDate, 'yyyy-MM-dd');
    let checkInToSend = null;
    let checkOutToSend = null;

    if (createStatus === 'present' || createStatus === 'half-day') {
      if (createCheckIn) checkInToSend = new Date(`${dateISO}T${createCheckIn}:00.000Z`).toISOString();
      if (createCheckOut) checkOutToSend = new Date(`${dateISO}T${createCheckOut}:00.000Z`).toISOString();
    }

    const payload = {
      userId: createUserId,
      date: dateISO,
      status: createStatus,
      checkIn: checkInToSend,
      checkOut: checkOutToSend,
      notes: createNotes,
    };

    try {
      await axios.post(`${API_URL}/api/attendance/manager`, payload, { withCredentials: true });
      toast.success(t('attendanceCreated') || 'Attendance created successfully!');
      setIsCreateModalOpen(false);
      setCreateUserId('');
      setCreateDate(new Date());
      setCreateStatus('absent');
      setCreateCheckIn('');
      setCreateCheckOut('');
      setCreateNotes('');
      fetchAttendanceForDate(selectedDate);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('failedCreate') || 'Failed to create attendance.');
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'absent': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'leave': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'half-day': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'pending': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
      case 'approved': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900';
      default: return 'text-gray-500 bg-gray-50 dark:text-gray-500 dark:bg-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 md:p-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-amber-500" />
            {t('manageStaffAttendance') || "Manage Staff Attendance"}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
            {t('manageStaffDesc') || "View and manage daily attendance for all staff members (Receptionists, Cashiers)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner">
            <div className="flex items-center gap-3">
              <Label htmlFor="attendanceDate" className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t('selectDate') || "Select Date:"}
              </Label>
              <DatePicker
                date={selectedDate}
                setDate={setSelectedDate}
                disabled={(date) => date > new Date()}
              />
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <PlusCircleIcon size={20} /> {t('markAttendance') || "Mark Attendance"}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
            <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('staffMember') || "Staff Member"}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('role') || "Role"}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('checkIn') || "Check-in"}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('checkOut') || "Check-out"}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('status') || "Status"}
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('actions') || "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {t('loadingAttendance') || "Loading attendance data..."}
                    </TableCell>
                  </TableRow>
                ) : attendanceList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {t('noRecordsForDate') || "No staff attendance records found for this date."}
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceList.map((entry) => (
                    <TableRow key={entry.staff._id}>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <UserIcon size={18} className="text-gray-500 dark:text-gray-400" />
                          {entry.staff.firstName} {entry.staff.lastName}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {entry.staff.role}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatTime(entry.attendance?.checkIn || null)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatTime(entry.attendance?.checkOut || null)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(entry.attendance?.status || 'absent')}`}>
                          {t(entry.attendance?.status || 'absent') || (entry.attendance?.status || 'N/A (Absent)')}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(entry)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
                          >
                            <EditIcon size={16} /> {t('edit') || "Edit"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewHistoryClick(entry.staff)}
                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-600"
                          >
                            <HistoryIcon size={16} /> {t('history') || "History"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <EditIcon size={24} /> {t('editAttendance') || "Edit Attendance"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {t('adjustFor') || "Adjust attendance details for"} {currentAttendance?.user?.firstName} {currentAttendance?.user?.lastName} {t('on') || "on"} {formatDateForDisplay(currentAttendance?.date || '')}.
            </DialogDescription>
          </DialogHeader>
          {currentAttendance && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="editCheckIn" className="mb-1 block text-sm font-medium">{t('checkInTime') || "Check-in Time"}</Label>
                <Input id="editCheckIn" type="time" value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="editCheckOut" className="mb-1 block text-sm font-medium">{t('checkOutTime') || "Check-out Time"}</Label>
                <Input id="editCheckOut" type="time" value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="editStatus" className="mb-1 block text-sm font-medium">{t('status') || "Status"}</Label>
                <Select value={editStatus} onValueChange={(value: AttendanceStatus) => setEditStatus(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('selectStatus') || "Select Status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">{t('present') || "Present"}</SelectItem>
                    <SelectItem value="absent">{t('absent') || "Absent"}</SelectItem>
                    <SelectItem value="leave">{t('onLeave') || "On Leave"}</SelectItem>
                    <SelectItem value="half-day">{t('halfDay') || "Half Day"}</SelectItem>
                    <SelectItem value="pending">{t('pending') || "Pending"}</SelectItem>
                    <SelectItem value="approved">{t('approved') || "Approved"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editNotes" className="mb-1 block text-sm font-medium">{t('notes') || "Notes"}</Label>
                <Textarea
                  id="editNotes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder={t('addNotes') || "Add notes about this attendance record..."}
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>{t('cancel') || "Cancel"}</Button>
            <Button onClick={handleUpdateAttendance}>{t('saveChanges') || "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <PlusCircleIcon size={24} /> {t('markAttendance') || "Mark Staff Attendance"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {t('manuallyMark') || "Manually mark attendance for a staff member, especially for absences or leaves."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 pr-2">
            <div>
              <Label htmlFor="createStaff" className="mb-1 block text-sm font-medium">{t('staffMember') || "Staff Member"}</Label>
              <Select value={createUserId} onValueChange={setCreateUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectStaff') || "Select Staff"} />
                </SelectTrigger>
                <SelectContent>
                  {allStaff.map(staff => (
                    <SelectItem key={staff._id} value={staff._id}>
                      {staff.firstName} {staff.lastName} ({staff.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="createDate" className="mb-1 block text-sm font-medium">{t('date') || "Date"}</Label>
              <DatePicker
                date={createDate}
                setDate={setCreateDate}
                disabled={(date) => date > new Date()}
              />
            </div>
            <div>
              <Label htmlFor="createStatus" className="mb-1 block text-sm font-medium">{t('status') || "Status"}</Label>
              <Select value={createStatus} onValueChange={(value: AttendanceStatus) => setCreateStatus(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('selectStatus') || "Select Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">{t('present') || "Present"}</SelectItem>
                  <SelectItem value="absent">{t('absent') || "Absent"}</SelectItem>
                  <SelectItem value="leave">{t('onLeave') || "On Leave"}</SelectItem>
                  <SelectItem value="half-day">{t('halfDay') || "Half Day"}</SelectItem>
                  <SelectItem value="pending">{t('pending') || "Pending"}</SelectItem>
                  <SelectItem value="approved">{t('approved') || "Approved"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(createStatus === 'present' || createStatus === 'half-day') && (
              <>
                <div>
                  <Label htmlFor="createCheckIn" className="mb-1 block text-sm font-medium">{t('checkInTimeOptional') || "Check-in Time (Optional)"}</Label>
                  <Input id="createCheckIn" type="time" value={createCheckIn} onChange={(e) => setCreateCheckIn(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="createCheckOut" className="mb-1 block text-sm font-medium">{t('checkOutTimeOptional') || "Check-out Time (Optional)"}</Label>
                  <Input id="createCheckOut" type="time" value={createCheckOut} onChange={(e) => setCreateCheckOut(e.target.value)} />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="createNotes" className="mb-1 block text-sm font-medium">{t('notesOptional') || "Notes (Optional)"}</Label>
              <Textarea
                id="createNotes"
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                placeholder={t('addNotesReason') || "Add notes (e.g., reason for absence/leave)..."}
              />
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>{t('cancel') || "Cancel"}</Button>
            <Button onClick={handleCreateAttendance}>{t('createAttendance') || "Create Attendance"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <HistoryIcon size={24} /> {t('attendanceHistoryFor') || "Attendance History for"} {currentStaffForHistory?.firstName} {currentStaffForHistory?.lastName}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {t('completeRecord') || "A complete record of past attendance."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto pr-2">
            {staffHistory.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">{t('noHistory') || "No attendance history available."}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('date') || "Date"}</TableHead>
                    <TableHead>{t('checkIn') || "Check-in"}</TableHead>
                    <TableHead>{t('checkOut') || "Check-out"}</TableHead>
                    <TableHead>{t('status') || "Status"}</TableHead>
                    <TableHead>{t('notes') || "Notes"}</TableHead>
                    <TableHead>{t('markedBy') || "Marked By"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffHistory.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{formatDateForDisplay(record.date)}</TableCell>
                      <TableCell>{formatTime(record.checkIn)}</TableCell>
                      <TableCell>{formatTime(record.checkOut)}</TableCell>
                      <TableCell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(record.status)}`}>
                          {t(record.status) || record.status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{record.notes || '-'}</TableCell>
                      <TableCell>{record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : t('self') || 'Self'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>{t('close') || "Close"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}