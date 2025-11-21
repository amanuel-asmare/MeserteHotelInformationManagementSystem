import React from 'react';
import StaffAttendancePage from '@/app/(staff-roles)/attendance/attendanceManagement';
import './styles.css';

function ReceptionAttendanceManagement() {
  const title = "Reception Attendance Management";

  return (
    <div>
      <div className="lift-up-text-container">
        <h2 className="lift-up-text">
          {title.split('').map((char, index) => (
            <span
              key={index}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h2>
      </div>
      <div>
        <StaffAttendancePage />
      </div>
    </div>
  );
}

export default ReceptionAttendanceManagement;