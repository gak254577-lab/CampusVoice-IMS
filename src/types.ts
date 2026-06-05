/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: 'student' | 'admin';
  rollNumber?: string;
  branch?: string;
  year?: string;
  hostelBlock?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface StatusHistoryLog {
  status: 'Submitted' | 'In Review' | 'Resolved' | 'Rejected' | 'Escalated';
  updatedBy: string;
  updatedAt: number; // timestamp
  changeSummary: string;
}

export interface ComplaintTicket {
  id: string; // Firestore document ID
  ticketId: string; // format CV-2026-XXXXX
  studentId: string;
  studentEmail: string;
  studentName?: string; // added back if not anonymous
  studentPhoto?: string; // added back if not anonymous
  isAnonymous: boolean;
  category: 'Hostel' | 'Classroom' | 'Assignment' | 'Canteen' | 'WiFi' | 'Library' | 'Administration' | 'Other';
  title: string;
  description: string;
  fileURL?: string; // photo data URL or standard base64 URL
  severity: 'Urgent' | 'Normal' | 'Low';
  aiSummary: string;
  suggestedAction: string;
  status: 'Submitted' | 'In Review' | 'Resolved' | 'Rejected' | 'Escalated';
  assignedTo?: string; // admin email or name
  adminNote?: string;
  escalated: boolean;
  createdAt: number;
  updatedAt: number;
  statusHistory: StatusHistoryLog[];
}

export interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  ticketId?: string;
  duration?: number;
}

export interface PushNotificationMessage {
  id: string;
  title: string;
  body: string;
  ticketId?: string;
  createdAt: number;
  read: boolean;
}
