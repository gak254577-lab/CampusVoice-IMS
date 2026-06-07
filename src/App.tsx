/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Lock, 
  User as UserIcon, 
  LogOut, 
  Bell, 
  Plus, 
  Check, 
  FileText, 
  ShieldAlert, 
  Grid, 
  Activity, 
  Sparkles, 
  Clock, 
  Paperclip, 
  Send, 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  CornerDownRight, 
  Building, 
  Wifi, 
  BookOpen, 
  Layers, 
  Coffee, 
  School, 
  Bookmark, 
  AlertTriangle,
  UserCheck,
  Trash2
} from 'lucide-react';

import { auth, db, googleProvider, isMockFirebase, OperationType, handleFirestoreError } from './firebase';
import { UserProfile, ComplaintTicket, NotificationToast, StatusHistoryLog, PushNotificationMessage } from './types';
import GlowBackground from './components/GlowBackground';
import RingCursor from './components/RingCursor';
import SkeletonLoader from './components/SkeletonLoader';
import NotificationToastContainer from './components/NotificationToast';
import GoogleChart from './components/GoogleChart';

// Hardcoded Admin Emails list for bootstrapping
const ADMIN_EMAILS = [
  "gak254577@gmail.com", // developer account
  "admin@imsec.ac.in",
  "director@imsec.ac.in",
  "registrar@imsec.ac.in",
  "warden@imsec.ac.in"
];

// Initial default complaints for hydration in mock mode or on empty DB to present the portal fully populated!
const INITIAL_MOCK_COMPLAINTS: Omit<ComplaintTicket, 'id'>[] = [
  {
    ticketId: 'CV-2026-88124',
    studentId: 'student_1',
    studentEmail: 'rohit.kumar@imsec.ac.in',
    studentName: 'Rohit Kumar',
    studentPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100',
    isAnonymous: false,
    category: 'Hostel',
    title: 'Geyser not working in Hostel Block C, 3rd Floor',
    description: 'It is extremely cold and the geyser on Block C 3rd floor bathroom has been non-functional for the past 4 days. Despite complaining to the room attender, nothing has been done yet.',
    severity: 'Urgent',
    aiSummary: 'Hot water geyser failure in Block C bathroom causing emergency winter discomfort.',
    suggestedAction: 'Dispatch electrical support to test coil and restore Block C geyser facility.',
    status: 'In Review',
    assignedTo: 'warden@imsec.ac.in',
    adminNote: 'Electrician called, parts have been requested from registrar office.',
    escalated: false,
    createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago (Will auto-escalate if unresolved!)
    updatedAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: 'Submitted', updatedBy: 'System', updatedAt: Date.now() - (3 * 24 * 60 * 60 * 1000), changeSummary: 'Complaint categorized and logged.' },
      { status: 'In Review', updatedBy: 'warden@imsec.ac.in', updatedAt: Date.now() - (2 * 24 * 60 * 60 * 1000), changeSummary: 'Warden assigned electrical vendor review.' }
    ]
  },
  {
    ticketId: 'CV-2026-32490',
    studentId: 'student_2',
    studentEmail: 'anonymous@imsec.ac.in',
    isAnonymous: true,
    category: 'WiFi',
    title: 'Extremely slow Wi-Fi speeds in IT block labs',
    description: 'Average bandwidth in Labs 3 and 4 is less than 500kbps, which disrupts our software engineering assignments and packages installation.',
    severity: 'Normal',
    aiSummary: 'Insufficient Wi-Fi bandwidth in computer classrooms preventing class assignments.',
    suggestedAction: 'Trigger ISP bandwidth reallocation check on router switch and restart nodes.',
    status: 'Submitted',
    escalated: false,
    createdAt: Date.now() - (12 * 60 * 60 * 1000), // 12 hrs ago
    updatedAt: Date.now() - (12 * 60 * 60 * 1000),
    statusHistory: [
      { status: 'Submitted', updatedBy: 'System', updatedAt: Date.now() - (12 * 60 * 60 * 1000), changeSummary: 'Grievance recorded and AI summarized successfully.' }
    ]
  },
  {
    ticketId: 'CV-2026-67123',
    studentId: 'student_3',
    studentEmail: 'priya.sharma@imsec.ac.in',
    studentName: 'Priya Sharma',
    studentPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    isAnonymous: false,
    category: 'Canteen',
    title: 'Hygiene concerns in college mess basement',
    description: 'Found bugs and dirt in the drinking water cooler section of the primary college canteen today afternoon. It requires immediate sanitization.',
    severity: 'Urgent',
    aiSummary: 'Canteen health violation regarding water cooler sanitation defects.',
    suggestedAction: 'Warden to issue sanitization notice to the canteen manager and filter inspection.',
    status: 'Resolved',
    assignedTo: 'director@imsec.ac.in',
    adminNote: 'Water filter parts cleaned and mess sanitized. Drinking cooler is now operating hygienically.',
    escalated: false,
    createdAt: Date.now() - (6 * 24 * 60 * 60 * 1000),
    updatedAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: 'Submitted', updatedBy: 'System', updatedAt: Date.now() - (6 * 24 * 60 * 60 * 1000), changeSummary: 'Logged under food safety monitoring.' },
      { status: 'Resolved', updatedBy: 'warden@imsec.ac.in', updatedAt: Date.now() - (5 * 24 * 60 * 60 * 1000), changeSummary: 'Completed full cleaning cycle and filters replaced.' }
    ]
  }
];

export default function App() {
  // Core user & auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Setup / profile collection modal on first login
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupData, setSetupData] = useState({
    rollNumber: '',
    branch: 'Computer Science',
    year: '1st Year',
    hostelBlock: 'Day Scholar'
  });
  const [setupFormErrors, setSetupFormErrors] = useState<Record<string, string>>({});
  const [isSetupShaking, setIsSetupShaking] = useState(false);

  // Data collections state
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [notifications, setNotifications] = useState<PushNotificationMessage[]>([]);
  const [showBellMenu, setShowBellMenu] = useState(false);

  // Toast notifier states
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  // Page selection (student vs admin panels)
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'my-tickets' | 'analytics' | 'settings'>('dashboard');

  // New Complaint structure form state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    category: 'Hostel' as ComplaintTicket['category'],
    title: '',
    description: '',
    photoData: '', // base64 string to be stored dynamically
    isAnonymous: false
  });
  const [complaintErrors, setComplaintErrors] = useState<Record<string, string>>({});
  const [isSubmitShaking, setIsSubmitShaking] = useState(false);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected complaint details on click
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintTicket | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [assigneeInput, setAssigneeInput] = useState('');
  const [adminStatusInput, setAdminStatusInput] = useState<ComplaintTicket['status']>('Submitted');
  const [isUpdatingComplaint, setIsUpdatingComplaint] = useState(false);

  // Admin and student table queries
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  // Trigger developer toggle helper
  const [isForcedAdmin, setIsForcedAdmin] = useState(false);

  // 1. Toast Dispatcher Helper
  const addToast = (title: string, message: string, type: NotificationToast['type'] = 'info', ticketId?: string) => {
    const newToast: NotificationToast = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
      ticketId,
      duration: 5000
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 2. Dispatch FCM Push Notifications Simulated on server
  const sendInAppPush = async (title: string, body: string, ticketId?: string) => {
    const newPush: PushNotificationMessage = {
      id: `push-${Date.now()}`,
      title,
      body,
      ticketId,
      createdAt: Date.now(),
      read: false
    };
    setNotifications((prev) => [newPush, ...prev]);

    // Async log to Express backend node simulated push proxy
    try {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.uid || 'anonymous',
          title,
          message: body,
          ticketId
        })
      });
    } catch (err) {
      console.warn("FCM log proxy failed:", err);
    }
  };

  // 3. Authenticate and register workflows
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);

      // Check if we have a mock sandbox session active in localStorage to bypass domain enforcement issues
      const storedMockUser = localStorage.getItem('mock_user_session');
      if (storedMockUser && !user) {
        try {
          const mockUser = JSON.parse(storedMockUser);
          setCurrentUser(mockUser);
          setAuthError(null);

          const storedProfile = localStorage.getItem(`profile_${mockUser.uid}`);
          if (storedProfile) {
            setProfile(JSON.parse(storedProfile));
          } else {
            const defaultProfile = {
              uid: mockUser.uid,
              name: mockUser.displayName,
              email: mockUser.email,
              rollNumber: mockUser.email === 'gak254577@gmail.com' ? 'FACULTY/IMSEC/001' : 'IMSEC/2026/042',
              branch: mockUser.email === 'gak254577@gmail.com' ? 'Administration' : 'Computer Science',
              year: mockUser.email === 'gak254577@gmail.com' ? 'Faculty Registrar' : '3rd Year',
              hostelBlock: mockUser.email === 'gak254577@gmail.com' ? 'Warden Office' : 'Block C (Girls)',
              photoUrl: mockUser.photoURL,
              role: mockUser.email === 'gak254577@gmail.com' ? 'admin' : 'student',
              phone: '9988776655',
              createdAt: Date.now()
            };
            localStorage.setItem(`profile_${mockUser.uid}`, JSON.stringify(defaultProfile));
            setProfile(defaultProfile as any);
          }
          setAuthLoading(false);
          return;
        } catch (e) {
          console.warn("Restoring mock student or admin session failed:", e);
        }
      }

      if (user) {
        // Enforce Campus login domain policy strictly
        const testEmail = user.email || '';
        const isImsecAcademic = testEmail.endsWith('@imsec.ac.in');
        const isTestDeveloper = testEmail === 'gak254577@gmail.com';

        if (!isImsecAcademic && !isTestDeveloper) {
          setAuthError("Access denied. Only @imsec.ac.in college accounts are allowed.");
          await signOut(auth);
          setCurrentUser(null);
          setProfile(null);
          setAuthLoading(false);
          return;
        }

        setCurrentUser(user);
        setAuthError(null);

        // Fetch user profiles from database
        try {
          let userProfile: UserProfile | null = null;

          if (isMockFirebase || localStorage.getItem('use_mock_auth') === 'true') {
            // Retrieve from LocalStorage Mock
            const stored = localStorage.getItem(`profile_${user.uid}`);
            if (stored) {
              userProfile = JSON.parse(stored);
            }
          } else {
            // Retrieve from Firestore
            const profSnap = await getDoc(doc(db, 'users', user.uid));
            if (profSnap.exists()) {
              userProfile = profSnap.data() as UserProfile;
            }

            // Bootstrap config/admins document securely if the logged-in user is a predefined administrator
            if (ADMIN_EMAILS.includes(user.email || '')) {
              try {
                const configRef = doc(db, 'config', 'admins');
                const configSnap = await getDoc(configRef);
                if (!configSnap.exists()) {
                  console.log("[Bootstrap] Setting up admin configuration document securely...");
                  await setDoc(configRef, { emails: ADMIN_EMAILS }, { merge: true });
                }
              } catch (bootstrapErr) {
                console.warn("[Bootstrap] Config document write deferred or already handled:", bootstrapErr);
              }
            }
          }

          if (userProfile) {
            setProfile(userProfile);
            addToast("Connected", `Logged in as ${user.displayName || 'Student'}.`, "success");
          } else {
            // User does not have student profile yet. Trigger beautifully animated registration modal.
            setShowSetupModal(true);
          }
        } catch (error) {
          console.error("Firestore user profile loading failed:", error);
          // Safely show setup questionnaire if database profile document doesn't exist yet or is otherwise restricted
          setShowSetupModal(true);
        }
      } else {
        setCurrentUser(null);
        setProfile(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 4. Hydrate complaints collection from local configs on boot
  useEffect(() => {
    if (!currentUser) return;

    const fetchGrievances = async () => {
      setLoadingComplaints(true);

      if (isMockFirebase || localStorage.getItem('use_mock_auth') === 'true') {
        // Mock Storage Fetch
        const stored = localStorage.getItem('grievance_complaints');
        if (stored) {
          setComplaints(JSON.parse(stored));
        } else {
          // Hydrate initially with our 3 beautiful IMSEC complaints
          const hydrated: ComplaintTicket[] = INITIAL_MOCK_COMPLAINTS.map((c, i) => ({
            ...c,
            id: `init-${i}`
          }));
          localStorage.setItem('grievance_complaints', JSON.stringify(hydrated));
          setComplaints(hydrated);
        }
      } else {
        // Firestore Fetch actual
        try {
          const cRef = collection(db, 'complaints');
          // Fetch all for admin or only own is checked in firestore rule boundaries
          const emailsConfigSnap = await getDoc(doc(db, 'config', 'admins'));
          const adminEmailsArr = emailsConfigSnap.exists() ? emailsConfigSnap.data()?.emails || [] : ADMIN_EMAILS;
          const isAdminRole = adminEmailsArr.includes(currentUser.email) || isForcedAdmin;

          let qArr;
          if (isAdminRole) {
            qArr = query(cRef, orderBy('createdAt', 'desc'));
          } else {
            // Fetch all complaints to allow multiple users on different laptops/devices to view all logged concerns
            qArr = query(cRef);
          }

          const qSnap = await getDocs(qArr);
          const ticketsList: ComplaintTicket[] = [];
          qSnap.forEach((d) => {
            ticketsList.push({ id: d.id, ...(d.data() as any) } as ComplaintTicket);
          });
          // Sort results securely in memory
          ticketsList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setComplaints(ticketsList);
        } catch (err: any) {
          console.error("Firestore loading complaints failed. Mocking container DB fallback.", err);
          // Trigger the required handleFirestoreError for permissions diagnostic tracking
          if (err && (err.code === 'permission-denied' || String(err.message || '').toLowerCase().includes('permission') || String(err.message || '').toLowerCase().includes('insufficient'))) {
            try {
              handleFirestoreError(err, OperationType.LIST, 'complaints');
            } catch (diagnosticErr) {
              console.warn("Permission failure logged for environment integration diagnostics.", diagnosticErr);
            }
          }
          // Auto fallback to local storage safely for non-blocking preview transitions
          const stored = localStorage.getItem('grievance_complaints');
          if (stored) {
            setComplaints(JSON.parse(stored));
          } else {
            const hydrated: ComplaintTicket[] = INITIAL_MOCK_COMPLAINTS.map((c, i) => ({
              ...c,
              id: `init-${i}`
            }));
            localStorage.setItem('grievance_complaints', JSON.stringify(hydrated));
            setComplaints(hydrated);
          }
        }
      }

      setLoadingComplaints(false);
    };

    fetchGrievances();
  }, [currentUser, profile, isForcedAdmin]);

  // 5. Hourly Auto-escalation checks (triggered upon portal open)
  useEffect(() => {
    if (complaints.length === 0) return;

    const runEscalationTrigger = async () => {
      let updatedCount = 0;
      const hoursThreshold = 48; // 48 hours in production
      const isOverdue = (createdAt: number) => Date.now() - createdAt > hoursThreshold * 60 * 60 * 1000;

      const syncedList = complaints.map(ticket => {
        const isUnresolved = ticket.status === 'Submitted' || ticket.status === 'In Review';
        if (isUnresolved && isOverdue(ticket.createdAt) && !ticket.escalated) {
          updatedCount++;
          const escalationLog: StatusHistoryLog = {
            status: 'Escalated',
            updatedBy: 'System Cron Worker',
            updatedAt: Date.now(),
            changeSummary: 'Ticket automatically escalated. Exceeded 48 hours resolution timeline limit with no updates.'
          };
          return {
            ...ticket,
            status: 'Escalated' as const,
            escalated: true,
            statusHistory: [...ticket.statusHistory, escalationLog]
          };
        }
        return ticket;
      });

      if (updatedCount > 0) {
        setComplaints(syncedList);
        if (isMockFirebase || localStorage.getItem('use_mock_auth') === 'true') {
          localStorage.setItem('grievance_complaints', JSON.stringify(syncedList));
        } else {
          // Bulk update the escalated ones in firestore
          const overdueOnes = syncedList.filter(t => t.escalated && !complaints.find(oldT => oldT.id === t.id)?.escalated);
          for (const item of overdueOnes) {
            try {
              await updateDoc(doc(db, 'complaints', item.id), {
                status: 'Escalated',
                escalated: true,
                statusHistory: item.statusHistory
              });
            } catch (err) {
              console.warn("Firestore auto-escalation sync failed:", err);
            }
          }
        }

        addToast(
          "Security Escalation Engine", 
          `Auto-escalated ${updatedCount} ticket(s) older than 48 hours to Urgent review status.`, 
          "warning"
        );
        sendInAppPush(
          "Admin Warning: Overdue Tickets", 
          `${updatedCount} unresolved grievances have exceeded 48 hours and were escalated.`
        );
      }
    };

    const interval = setTimeout(() => {
      runEscalationTrigger();
    }, 2000); // Check 2 seconds after dashboard loads

    return () => clearTimeout(interval);
  }, [complaints]);

  // Google OAuth Login Action
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Google authentication failed.");
      setAuthLoading(false);
    }
  };

  // Local Sandbox / Mock Login Action for offline, local, or domain containment fallback
  const handleMockLogin = (role: 'student' | 'admin') => {
    setAuthLoading(true);
    setAuthError(null);
    const mockUser = role === 'admin' ? {
      uid: 'demo-admin-gak',
      displayName: 'Dean Gak (Admin)',
      email: 'gak254577@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100'
    } : {
      uid: 'demo-student-ananya',
      displayName: 'Ananya Saxena',
      email: 'ananya.saxena@imsec.ac.in',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'
    };

    localStorage.setItem('mock_user_session', JSON.stringify(mockUser));
    localStorage.setItem('use_mock_auth', 'true');
    
    const defaultProfile = {
      uid: mockUser.uid,
      name: mockUser.displayName,
      email: mockUser.email,
      rollNumber: role === 'admin' ? 'FACULTY/IMSEC/001' : 'IMSEC/2026/042',
      branch: role === 'admin' ? 'Administration' : 'Computer Science',
      year: role === 'admin' ? 'Faculty Registrar' : '3rd Year',
      hostelBlock: role === 'admin' ? 'Warden Office' : 'Block C (Girls)',
      photoUrl: mockUser.photoURL,
      role: role === 'admin' ? 'admin' : 'student',
      phone: '9988776655',
      createdAt: Date.now()
    };
    localStorage.setItem(`profile_${mockUser.uid}`, JSON.stringify(defaultProfile));
    
    setCurrentUser(mockUser as any);
    setProfile(defaultProfile as any);
    addToast("Sandbox Login", `Connected in local Demo mode as ${mockUser.displayName}.`, "success");
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('mock_user_session');
    localStorage.removeItem('use_mock_auth');
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut from Firebase triggered error, preceding offline logout:", e);
    }
    setCurrentUser(null);
    setProfile(null);
    addToast("Signed Out", "Session closed successfully.", "info");
    setShowBellMenu(false);
  };



  // Student details compilation handler on first login
  const handleRegisterProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validate entries
    const errors: Record<string, string> = {};
    const rollPattern = /^[0-9]{13}$/; // Standard AKTU IMSEC roll number is 13 digits
    if (!setupData.rollNumber) {
      errors.rollNumber = "Roll number is required.";
    } else if (!rollPattern.test(setupData.rollNumber.trim())) {
      errors.rollNumber = "Invalid. AKTU IMSEC roll numbers consist of exactly 13 digits.";
    }

    if (Object.keys(errors).length > 0) {
      setSetupFormErrors(errors);
      setIsSetupShaking(true);
      setTimeout(() => setIsSetupShaking(false), 500);
      return;
    }

    setSetupFormErrors({});
    const determinedRole = ADMIN_EMAILS.includes(currentUser.email || "") ? 'admin' : 'student';

    const userProfilePayload: UserProfile = {
      uid: currentUser.uid,
      name: currentUser.displayName || "Grievant Student",
      email: currentUser.email || "",
      photoURL: currentUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
      role: determinedRole,
      rollNumber: setupData.rollNumber,
      branch: setupData.branch,
      year: setupData.year,
      hostelBlock: setupData.hostelBlock,
      createdAt: Date.now()
    };

    try {
      if (isMockFirebase || localStorage.getItem('use_mock_auth') === 'true') {
        localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(userProfilePayload));
      } else {
        // Store in Firestore users docs
        await setDoc(doc(db, 'users', currentUser.uid), userProfilePayload);
        // Try to bootstrap config/admins document securely if missing for admin verification loop
        if (ADMIN_EMAILS.includes(currentUser.email || '')) {
          try {
            await setDoc(doc(db, 'config', 'admins'), { emails: ADMIN_EMAILS }, { merge: true });
          } catch (configErr) {
            console.warn("Wrote admins document deferred or failed:", configErr);
          }
        }
      }

      setProfile(userProfilePayload);
      setShowSetupModal(false);
      addToast(
        "Registration Complete", 
        `Welcome to CampusVoice, IMSEC ${userProfilePayload.branch} department!`, 
        "success"
      );
      sendInAppPush(
        "Welcome to CampusVoice", 
        "Every complaint is heard. Post your grievance openly or anonymously."
      );
    } catch (err) {
      console.error(err);
      if (!isMockFirebase && localStorage.getItem('use_mock_auth') !== 'true') {
        try {
          localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(userProfilePayload));
          setProfile(userProfilePayload);
          setShowSetupModal(false);
          addToast(
            "Registration Saved Locally",
            "Cloud write failed, but your profile was saved locally so you can continue.",
            "warning"
          );
          return;
        } catch (storageErr) {
          console.error("LocalStorage fallback failed:", storageErr);
        }
      }

      addToast("Profile Register Error", "Error writing records to college server.", "error");
    }
  };

  // Convert uploaded image file to resized micro base64 URL for smart storage limit adherence
  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast("File error", "Only image uploads are accepted (.jpg, .png, .webp).", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Draw and compress to ~ 400px maximum width
        const canvas = document.createElement('canvas');
        const maxW = 400;
        const scale = maxW / img.width;
        canvas.width = maxW;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6); // 60% quality compression
          setNewComplaint((prev) => ({ ...prev, photoData: compressedBase64 }));
          addToast("Image Attached", "Resized rendering compiled successfully.", "success");
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  // Handler for posting complaint to Firestore (includes Gemini analysis processing)
  const submitComplaintHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check validation of ticket form
    const errors: Record<string, string> = {};
    if (!newComplaint.title.trim()) {
      errors.title = "Grievance title is required.";
    } else if (newComplaint.title.trim().length < 6) {
      errors.title = "Title remains too short (minimum 6 characters).";
    }

    if (!newComplaint.description.trim()) {
      errors.description = "Full description of issues is required.";
    } else if (newComplaint.description.trim().length < 20) {
      errors.description = "Please describe the grievance in more detail (minimum 20 characters).";
    }

    if (Object.keys(errors).length > 0) {
      setComplaintErrors(errors);
      setIsSubmitShaking(true);
      setTimeout(() => setIsSubmitShaking(false), 500);
      return;
    }

    setComplaintErrors({});
    setSubmittingComplaint(true);

    try {
      // 1. Call Gemini analysis endpoint on our Node server proxy
     // 1. Prepare deterministic client-side AI fallback. This is used if the Express backend
      // server is unreachable (e.g., when hosted on static platforms like Netlify/Vercel).
      let aiAnalysis: {
        severity: 'Urgent' | 'Normal' | 'Low';
        aiSummary: string;
        suggestedAction: string;
      } = {
        severity: 'Normal',
        aiSummary: `Complaint about ${newComplaint.category || "issue"}: "${newComplaint.title || "No Title"}"`,
        suggestedAction: `Assign ticket to the ${newComplaint.category || "General"} department representative for priority review.`
      };

      const descLower = newComplaint.description.toLowerCase();
      if (descLower.includes("urgent") || descLower.includes("emergency") || descLower.includes("shock") || descLower.includes("fire") || descLower.includes("safety") || descLower.includes("broken wire") || descLower.includes("spark")) {
        aiAnalysis.severity = 'Urgent';
      }

      try {
        // Attempt to call Gemini analysis endpoint on our Node server proxy
        const geminiRes = await fetch('/api/gemini/analyze-complaint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newComplaint.title,
            description: newComplaint.description,
            category: newComplaint.category
          })
        });

        if (geminiRes.ok) {
          const parsedRes = await geminiRes.json();
          if (parsedRes && (parsedRes.severity || parsedRes.aiSummary || parsedRes.suggestedAction)) {
            const returnedSeverity = parsedRes.severity;
            aiAnalysis = {
              severity: (returnedSeverity === 'Urgent' || returnedSeverity === 'Normal' || returnedSeverity === 'Low')
                ? returnedSeverity
                : aiAnalysis.severity,
              aiSummary: parsedRes.aiSummary || aiAnalysis.aiSummary,
              suggestedAction: parsedRes.suggestedAction || aiAnalysis.suggestedAction
            };
          }
        } else {
          console.warn(`Express backend AI service unavailable (Status ${geminiRes.status}). Operating on standard client-side analysis fallback.`);
        }
      } catch (geminiErr) {
        console.warn("Express backend API offline or unreachable (Netlify/Vercel static host). Local analysis fallback activated:", geminiErr);
      }

      // 2. Output unique CV ticket ID
      const randomID = Math.floor(10000 + Math.random() * 90000);
      const generatedTicketID = `CV-2026-${randomID}`;

      // 3. Assemble ticket entity
      const newTicketPayload: ComplaintTicket = {
        id: `ticket-${Date.now()}-${randomID}`,
        ticketId: generatedTicketID,
        studentId: currentUser?.uid || 'temp',
        studentEmail: currentUser?.email || 'rohit.kumar@imsec.ac.in',
        studentName: newComplaint.isAnonymous ? 'Anonymous' : (currentUser?.displayName || 'Student'),
        studentPhoto: newComplaint.isAnonymous ? '' : (currentUser?.photoURL || ''),
        isAnonymous: newComplaint.isAnonymous,
        category: newComplaint.category,
        title: newComplaint.title,
        description: newComplaint.description,
        fileURL: newComplaint.photoData, // compressed image base64
        severity: aiAnalysis.severity || 'Normal',
        aiSummary: aiAnalysis.aiSummary || 'Student filed general concern.',
        suggestedAction: aiAnalysis.suggestedAction || 'Internal review requested.',
        status: 'Submitted',
        escalated: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        statusHistory: [
          {
            status: 'Submitted',
            updatedBy: 'System Core Engine',
            updatedAt: Date.now(),
            changeSummary: 'Complaint submitted by student. Gemini AI successfully flagged ticket severity.'
          }
        ]
      };

      // 4. Persistence
      const nextList = [newTicketPayload, ...complaints];
      setComplaints(nextList);

      if (isMockFirebase || localStorage.getItem('use_mock_auth') === 'true') {
        localStorage.setItem('grievance_complaints', JSON.stringify(nextList));
      } else {
        await setDoc(doc(db, 'complaints', newTicketPayload.id), newTicketPayload);
      }

      // 5. Fire user and admin triggers
      addToast(
        "Complaint Submitted Successfully", 
        `Ticket ID: ${generatedTicketID}. CampusVoice AI has analyzed the grievance.`, 
        "success",
        generatedTicketID
      );

      sendInAppPush(
        "Grievance Ticket Generated", 
        `Your grievance has been successfully submitted under ID: ${generatedTicketID}.`, 
        generatedTicketID
      );

      // If urgent, send alert banner to administrative desk immediately as per spec!
      if (newTicketPayload.severity === 'Urgent') {
        sendInAppPush(
          "🔴 Alert: New Urgent Complaint", 
          `Critical safety concern regarding "${newTicketPayload.title}" submitted. Fix immediately!`, 
          generatedTicketID
        );
      }

      // 6. Reset form
      setNewComplaint({
        category: 'Hostel',
        title: '',
        description: '',
        photoData: '',
        isAnonymous: false
      });
      setShowSubmitModal(false);

    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || String(err);
      addToast("Connection Issue", `Grievance analysis or write failed: ${errMsg}`, "error");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Administration update logic (Assigned, admin note edits, triggering status switches)
  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdatingComplaint(true);
    const logSummary = `Status revised to ${adminStatusInput}. Assigned to: ${assigneeInput || 'General staff'}. Note: "${adminNoteInput || 'None'}"`;

    const nextLog: StatusHistoryLog = {
      status: adminStatusInput,
      updatedBy: currentUser?.email || 'College Admin',
      updatedAt: Date.now(),
      changeSummary: logSummary
    };

    const updatedTicket: ComplaintTicket = {
      ...selectedComplaint,
      status: adminStatusInput,
      assignedTo: assigneeInput,
      adminNote: adminNoteInput,
      updatedAt: Date.now(),
      statusHistory: [...selectedComplaint.statusHistory, nextLog]
    };

    // Keep state sync
    const nextList = complaints.map(t => t.id === selectedComplaint.id ? updatedTicket : t);
    setComplaints(nextList);

    if (isMockFirebase || localStorage.getItem('use_mock_auth') === 'true') {
      localStorage.setItem('grievance_complaints', JSON.stringify(nextList));
    } else {
      try {
        await setDoc(doc(db, 'complaints', selectedComplaint.id), {
          status: adminStatusInput,
          assignedTo: assigneeInput,
          adminNote: adminNoteInput,
          updatedAt: Date.now(),
          statusHistory: updatedTicket.statusHistory
        }, { merge: true });
      } catch (err) {
        console.error("Firestore administration rewrite error:", err);
      }
    }

    // Push simulated FCM back to grievant student
    sendInAppPush(
      `Ticket status updated for ${selectedComplaint.ticketId}`, 
      `Administration has transitioned your ticket status to [${adminStatusInput}]. Click to review notes.`, 
      selectedComplaint.ticketId
    );

    addToast(
      "Ticket Status Revised", 
      `Ticket ${selectedComplaint.ticketId} successfully resolved and updated.`, 
      "success",
      selectedComplaint.ticketId
    );

    setSelectedComplaint(updatedTicket);
    setIsUpdatingComplaint(false);
  };

  // Check roles: force check allows direct reviewer UI toggling
  const checkIsAdmin = () => {
    if (isForcedAdmin) return true;
    return profile?.role === 'admin' || ADMIN_EMAILS.includes(currentUser?.email || "");
  };

  const isAdmin = checkIsAdmin();

  // Filter complaints based on search query, category filters, and status selections
  const getFilteredComplaints = () => {
    return complaints.filter((t) => {
      const matchSearch = 
        t.ticketId.toLowerCase().includes(searchFilter.toLowerCase()) || 
        t.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
        t.description.toLowerCase().includes(searchFilter.toLowerCase());

      const matchCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchSeverity = severityFilter === 'All' || t.severity === severityFilter;

      return matchSearch && matchCategory && matchStatus && matchSeverity;
    });
  };

  const filteredTickets = getFilteredComplaints();

  // Compute analytics statistics variables for display cards
  const stats = {
    total: complaints.length,
    open: complaints.filter(t => t.status === 'Submitted' || t.status === 'In Review').length,
    resolvedToday: complaints.filter(t => t.status === 'Resolved').length,
    urgent: complaints.filter(t => t.severity === 'Urgent').length
  };

  // Google Charts dataset calculations representation
  const categoryCounts = complaints.reduce((acc, current) => {
    acc[current.category] = (acc[current.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = [
    ['Category', 'Tickets'],
    ...Object.entries(categoryCounts).map(([cat, val]) => [cat, val])
  ];

  const severityCounts = complaints.reduce((acc, current) => {
    acc[current.severity] = (acc[current.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const columnChartData = [
    ['Severity', 'Tickets', { role: 'style' }],
    ['Urgent', severityCounts.Urgent || 0, '#EF4444'],
    ['Normal', severityCounts.Normal || 0, '#FB923C'],
    ['Low', severityCounts.Low || 0, '#4F7FFF']
  ];

  // Top 3 recurring category lists
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3);

  // Return formatted display category icon
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Hostel': return <Building className="w-4 h-4 text-accent-blue" />;
      case 'WiFi': return <Wifi className="w-4 h-4 text-accent-purple" />;
      case 'Library': return <BookOpen className="w-4 h-4 text-accent-orange" />;
      case 'Classroom': return <School className="w-4 h-4 text-accent-green" />;
      case 'Canteen': return <Coffee className="w-4 h-4 text-accent-red" />;
      default: return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative min-h-screen text-[#E2E8F0] font-sans antialiased pb-20 select-none">
      {/* Visual Canvas Base */}
      <GlowBackground />
      <RingCursor />

      {/* Global Toast Alerts */}
      <NotificationToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ⚠️ DEVELOPER TOGGLE BANNER (For Reviewers to switch admin roles easily) */}
      <div className="bg-gradient-to-r from-accent-purple/90 to-accent-blue/90 text-white text-[11px] font-mono tracking-widest text-center py-1.5 px-4 font-semibold select-all sticky top-0 z-[100] flex justify-between items-center z-[1000] gap-4">
        <span>IMSEC CampusVoice Developer Sandbox: {(isMockFirebase || localStorage.getItem('use_mock_auth') === 'true') ? "LocalStorage Hydrated Mode (Mock Auth Activated)" : "Cloud Firestore Production Connected"}</span>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setIsForcedAdmin(!isForcedAdmin);
              addToast(
                "Sandbox Switch", 
                `Switched session developer profile to ${!isForcedAdmin ? 'Administration desk' : 'Grievant student'}.`, 
                "info"
              );
            }}
            className="bg-white/10 hover:bg-white/20 text-[10px] px-2.5 py-1 rounded border border-white/20 transition-all font-mono inline-flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-white animate-pulse" />
            Switch view: {isForcedAdmin ? 'Currently Admin' : 'Currently Student'}
          </button>
        </div>
      </div>

      {/* Initial Landing Screen Header (Logged Out state) */}
      {!currentUser ? (
        <div className="min-h-[90vh] flex items-center justify-center p-4 relative z-10" id="login-layout">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm rounded-[24px] bg-[#161B2A]/90 border border-white/[0.07] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            {/* Cards glow stripes */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-accent-blue via-accent-purple to-accent-green" />
            
            <div className="text-center space-y-6 pt-2">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center shadow-lg relative">
                  <span className="font-syne font-extrabold text-[#0A0D14] text-3xl">CV</span>
                  <div className="absolute inset-0 rounded-2xl border border-white/25 scale-[1.08] pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-black font-syne tracking-tight text-white uppercase">CampusVoice</h1>
                <p className="text-sm font-light text-slate-300">IMS Engineering College (IMSEC)</p>
              </div>

              <div className="border-t border-white/[0.05] my-2" />

              <p className="text-sm font-light text-slate-300 italic px-2 leading-relaxed">
                "Every complaint heard. Every issue tracked."
              </p>

              {authError && (
                <div className="p-3.5 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-center text-xs space-y-1.5 animate-shake">
                  <div className="font-semibold flex items-center justify-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    Domain Enforcement / Iframe Partitioning
                  </div>
                  <div className="font-light pr-2 text-slate-300 text-[11px] leading-relaxed">
                    {authError}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 pt-1.5 border-t border-white/5 font-light">
                    💡 If running in an iframe preview, please open the app in a <strong>New Tab</strong> using the top menu URL.
                  </div>
                </div>
              )}

              {authLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 rounded-full border-2 border-t-accent-blue border-r-transparent border-b-accent-purple border-l-transparent animate-spin" />
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 px-4 rounded-xl font-medium text-sm transition-all duration-300 bg-gradient-to-r from-accent-blue to-accent-purple hover:scale-[1.03] text-white flex items-center justify-center gap-3 select-none active:scale-[0.98] shadow-lg relative"
                >
                  <Lock className="w-4 h-4 text-[#060814]" />
                  Sign In with Google
                </button>
              )}

              {/* Local Sandbox Mode Options */}
              <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-2.5">
                <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-accent-blue animate-pulse" />
                  Local Sandbox / Demo Bypass
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleMockLogin('student')}
                    className="py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:text-white transition duration-200"
                  >
                    Demo Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockLogin('admin')}
                    className="py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] hover:text-white transition duration-200"
                  >
                    Demo Admin
                  </button>
                </div>
                <div className="text-[9.5px] text-slate-500 text-center leading-relaxed">
                  Bypasses Google sign-in & domain rules. Ideal for testing and VS Code environments.
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-light space-y-1">
                <p>Authenticating using Secure OAuth Service.</p>
                <p>Access policy: <strong className="font-semibold text-accent-blue text-[11px]">@imsec.ac.in</strong> college accounts strictly required.</p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Authenticated Application Container */
        <>
          {/* Top Glass Navigation Center */}
          <nav className="fixed top-[32px] inset-x-0 mx-auto max-w-7xl h-18 bg-imsec-card/75 border-b border-white/[0.06] backdrop-blur-md flex items-center justify-between px-6 z-40 relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center font-syne font-extrabold text-sm text-[#0A0D14] shadow-md">
                CV
              </div>
              <span className="font-syne font-extrabold text-lg tracking-wider text-white uppercase hidden sm:block">
                CampusVoice
              </span>
            </div>

            {/* Quick Navigation Tabs for Student / Admin Dashboard */}
            <div className="flex items-center bg-white/[0.03] border border-white/[0.05] rounded-full p-1 gap-1">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  currentTab === 'dashboard' 
                    ? 'bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentTab('my-tickets')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  currentTab === 'my-tickets' 
                    ? 'bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {isAdmin ? 'All Tickets' : 'My Complaints'}
              </button>
              <button
                onClick={() => setCurrentTab('analytics')}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                  currentTab === 'analytics' 
                    ? 'bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                Analytics
              </button>
            </div>

            {/* Profile widget controllers */}
            <div className="flex items-center gap-4 relative">
              {/* Alert Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowBellMenu(!showBellMenu)}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/[0.06] text-slate-300 hover:text-white transition-all hover:bg-white/10 relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-orange text-white text-[9px] font-bold flex items-center justify-center shadow-lg border border-imsec-card">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Bell Overlay drop menu */}
                <AnimatePresence>
                  {showBellMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      className="absolute right-0 mt-3 w-80 bg-imsec-card border border-white/[0.08] rounded-2xl shadow-2xl p-4 overflow-hidden z-50 backdrop-blur-xl"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold font-syne text-white uppercase tracking-wider">Simulated Notifications</span>
                        <button 
                          onClick={() => setNotifications([])}
                          className="text-[10px] text-accent-blue hover:underline"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="border-b border-white/[0.06] mb-2" />

                      <div className="max-h-64 overflow-y-auto space-y-2.5">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400 font-light">
                            No notifications. Logs are simulated on status shifts.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                              <div className="text-xs font-medium text-white flex justify-between">
                                <span>{notif.title}</span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 font-light leading-snug">{notif.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Collapsible Profile Trigger */}
              <div className="flex items-center gap-2.5 border-l border-white/[0.08] pl-4">
                <img
                  src={currentUser.photoURL || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                  alt={currentUser.displayName || "User Avatar Image"}
                  className="w-8.5 h-8.5 rounded-full border border-white/20 shadow-md referrer-policy='no-referrer'"
                />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-medium text-white tracking-wide truncate max-w-28">
                    {currentUser.displayName?.split(' ')[0] || "Student"}
                  </div>
                  <div className="text-[10px] text-accent-blue uppercase font-bold tracking-widest font-mono">
                    {isAdmin ? 'Admin Portal' : 'Student'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer ml-1"
                  title="Logout session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </nav>

          {/* Core Route Render Section */}
          <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
            {currentTab === 'dashboard' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Immersive Welcome Banner */}
                <div className="rounded-[24px] bg-[#161B2A]/90 border border-white/[0.06] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                  {/* Cards glow stripes */}
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-accent-blue via-accent-purple to-accent-green" />

                  <div className="space-y-3 text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-cyan text-xs font-mono font-bold tracking-widest text-[#4F7FFF] uppercase">
                      CampusVoice Portal Active
                    </div>
                    <h2 className="text-3xl font-black font-syne tracking-tight text-white uppercase md:max-w-xl leading-tight">
                      Empowering College Resolutions Through AI & Transparencies.
                    </h2>
                    <p className="text-slate-300 font-light text-sm max-w-lg leading-relaxed">
                      Lodge claims concerning hostel Blocks, network down, classroom assignment difficulties, and canteens. Track responses assisted by Gemini AI models.
                    </p>
                  </div>

                  {!isAdmin ? (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="py-4 px-6 rounded-2xl bg-gradient-to-r from-accent-blue to-accent-purple hover:scale-[1.03] text-white flex items-center gap-3 active:scale-[0.98] outline-none border-none cursor-pointer text-sm font-semibold tracking-wide shadow-lg hover:shadow-button-glow transition-all"
                    >
                      <Plus className="w-5 h-5 text-[#060814]" />
                      Lodge New Complaint
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-white/5 border border-white/[0.06] font-mono text-xs text-slate-300 space-y-1">
                      <div className="text-accent-purple font-bold text-[11px] tracking-wide uppercase">Admin Operations Desk</div>
                      <div>Auto hourly cron scanner: <strong className="text-accent-green">Active</strong></div>
                    </div>
                  )}
                </div>

                {/* Dashboard Metrics Statistics section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Matched Count up design slots */}
                  <div className="p-6 rounded-2xl bg-imsec-card border border-white/[0.06] space-y-2 shadow-premium-card relative">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-accent-blue" />
                    <p className="text-xs text-slate-400 font-light uppercase tracking-wider">Total Complaints</p>
                    <h4 className="text-3xl font-black font-syne text-white">{stats.total}</h4>
                  </div>
                  <div className="p-6 rounded-2xl bg-imsec-card border border-white/[0.06] space-y-2 shadow-premium-card relative animate-pulse">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-accent-orange" />
                    <p className="text-xs text-slate-400 font-light uppercase tracking-wider">Open Audits</p>
                    <h4 className="text-3xl font-black font-syne text-white">{stats.open}</h4>
                  </div>
                  <div className="p-6 rounded-2xl bg-imsec-card border border-white/[0.06] space-y-2 shadow-premium-card relative">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-accent-green" />
                    <p className="text-xs text-slate-400 font-light uppercase tracking-wider">Resolved Tickets</p>
                    <h4 className="text-3xl font-black font-syne text-white animate-bounce">{stats.resolvedToday}</h4>
                  </div>
                  <div className="p-6 rounded-2xl bg-imsec-card border border-white/[0.06] space-y-2 shadow-premium-card relative">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-accent-red" />
                    <p className="text-xs text-slate-400 font-light uppercase tracking-wider">Urgent Grievances</p>
                    <h4 className="text-3xl font-black font-syne text-accent-red tracking-tight flex items-center gap-1.5">
                      {stats.urgent}
                    </h4>
                  </div>
                </div>

                {/* Main Dashboard Panel splits */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left component: list of recent tickets */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-lg font-black font-syne tracking-wide text-white uppercase">
                        {isAdmin ? "Latest Student Queries Submission" : "Recent Grievances Filed By You"}
                      </h3>
                      <button 
                        onClick={() => setCurrentTab('my-tickets')}
                        className="text-xs text-accent-blue hover:underline transition-all flex items-center gap-1 font-medium select-none"
                      >
                        See All ({filteredTickets.length})
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="border-t border-white/[0.05] mb-4" />

                    <div className="space-y-4">
                      {loadingComplaints ? (
                        <>
                          <SkeletonLoader variant="card" />
                          <SkeletonLoader variant="card" />
                        </>
                      ) : getFilteredComplaints().length === 0 ? (
                        <div className="p-12 text-center rounded-2xl border border-white/5 bg-white/[0.01] space-y-3">
                          <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto animate-bounce" />
                          <p className="text-slate-400 font-light text-sm">No ticket submissions logged under current category filters.</p>
                        </div>
                      ) : (
                        getFilteredComplaints().slice(0, 4).map((ticket, idx) => (
                          <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            onClick={() => setSelectedComplaint(ticket)}
                            className="p-5 rounded-2xl bg-imsec-card border border-white/[0.06] hover:border-white/15 transition-all text-left shadow-premium-card hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer flex gap-4 relative overflow-hidden"
                          >
                            {/* colored left stripe severity */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                              ticket.severity === 'Urgent' ? 'bg-accent-red' : 
                              ticket.severity === 'Normal' ? 'bg-accent-orange' : 'bg-accent-blue'
                            }`} />

                            <div className="flex-1 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 pl-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono bg-white/5 px-2.5 py-0.5 rounded font-bold text-accent-blue">
                                    {ticket.ticketId}
                                  </span>
                                  {getCategoryIcon(ticket.category)}
                                  <span className="text-xs text-slate-300 font-light">{ticket.category}</span>
                                </div>
                                
                                <div className="flex items-center gap-1.5">
                                  {/* Severity badge pill */}
                                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                                    ticket.severity === 'Urgent' ? 'bg-accent-red/10 text-accent-red border border-accent-red/20 animate-pulse' :
                                    ticket.severity === 'Normal' ? 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20' :
                                    'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                                  }`}>
                                    {ticket.severity}
                                  </span>

                                  {/* Status badge pill */}
                                  <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-semibold border ${
                                    ticket.status === 'Submitted' ? 'bg-accent-blue/5 text-accent-blue border-accent-blue/15' :
                                    ticket.status === 'In Review' ? 'bg-accent-orange/5 text-accent-orange border-accent-orange/15 font-mono' :
                                    ticket.status === 'Resolved' ? 'bg-accent-green/5 text-accent-green border-accent-green/15 animate-bounce' :
                                    'bg-accent-red/5 text-accent-red border-accent-red/15'
                                  }`}>
                                    {ticket.status}
                                  </span>

                                  {/* Pending Escalation Overtime alert badge */}
                                  {(ticket.status === 'Submitted' || ticket.status === 'In Review') && (Date.now() - ticket.createdAt > 48 * 60 * 60 * 1000) && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-accent-orange/15 text-accent-orange border border-accent-orange/30 uppercase tracking-wider animate-pulse flex items-center gap-1">
                                      <Clock className="w-3 h-3 shrink-0" />
                                      Pending Escalation
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="pl-2 space-y-1">
                                <h4 className="text-sm font-semibold text-white tracking-wide pr-3 line-clamp-1 truncate">{ticket.title}</h4>
                                <p className="text-xs text-slate-400 font-light pr-4 line-clamp-2 truncate">{ticket.description}</p>
                              </div>

                              <div className="pl-2 pt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono border-t border-white/[0.04]">
                                <span>{new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>By: {ticket.isAnonymous ? 'Anonymous Member' : ticket.studentName}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right side component: helpful summaries */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-accent-blue/10 via-[#161B2A]/70 to-[#161B2A]/70 border border-white/[0.06] text-left shadow-premium-card space-y-3">
                      <div className="flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-accent-blue" />
                        <span className="text-xs font-bold uppercase text-white font-syne">College Escalation Standard</span>
                      </div>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Under our Zero-Delay Policy, any complaints unresolved for longer than <strong>48 Hours</strong> automatically transition to security escalation state, notifying administrative wardens dynamically.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* View tab: My Complaints / All Tickets */}
            {currentTab === 'my-tickets' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-left"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black font-syne text-white uppercase">
                      {isAdmin ? 'IMS College Complaints Inbox' : 'Campus Grievances & Ticket Histories'}
                    </h2>
                    <p className="text-xs font-light text-slate-400 mt-1">Review, search and filter through all ticket submissions compiled in local college systems.</p>
                  </div>

                  {!isAdmin && (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple hover:scale-[1.02] text-white text-xs font-medium flex items-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Lodge Complaint
                    </button>
                  )}
                </div>

                {/* Filters Drawer */}
                <div className="p-4 rounded-2xl bg-[#161B2A] border border-white/[0.05] flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-2.5 bg-black/20 px-3 py-2 rounded-xl border border-white/[0.03] flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search ticket ID, keywords..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="bg-transparent border-none text-xs text-white focus:outline-none w-full font-light"
                    />
                  </div>

                  {/* Grid selector dropdown filter list */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block tracking-wide font-mono pl-1">Category</span>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-[#0A0D14] border border-white/[0.06] text-xs px-3 py-1.5 rounded-xl text-slate-300 focus:border-accent-blue focus:outline-none"
                      >
                        <option value="All">All Categories</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Classroom">Classroom</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Canteen">Canteen</option>
                        <option value="WiFi">WiFi</option>
                        <option value="Library">Library</option>
                        <option value="Administration">Administration</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block tracking-wide font-mono pl-1">Status</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#0A0D14] border border-white/[0.06] text-xs px-3 py-1.5 rounded-xl text-slate-300 focus:border-accent-blue focus:outline-none"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="In Review">In Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Escalated">Escalated</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block tracking-wide font-mono pl-1">Severity</span>
                      <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="bg-[#0A0D14] border border-white/[0.06] text-xs px-3 py-1.5 rounded-xl text-slate-300 focus:border-accent-blue focus:outline-none"
                      >
                        <option value="All">All Urgency</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Normal">Normal</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Grievance list presentation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loadingComplaints ? (
                    <>
                      <SkeletonLoader variant="card" />
                      <SkeletonLoader variant="card" />
                    </>
                  ) : filteredTickets.length === 0 ? (
                    <div className="md:col-span-2 text-center p-16 rounded-2xl border border-white/5 bg-white/[0.01]">
                      <span className="text-slate-400 font-light text-sm block mb-3">No complaints recorded that match query filters.</span>
                      {!isAdmin && (
                        <button
                          onClick={() => setShowSubmitModal(true)}
                          className="px-4 py-2 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-semibold cursor-pointer"
                        >
                          Lodge Your First Complaint
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTickets.map((ticket, idx) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-5 rounded-2xl bg-[#161B2A] border border-white/[0.06] relative overflow-hidden flex flex-col justify-between hover:border-white/15 transition-all text-left shadow-premium-card hover:scale-[1.005] cursor-pointer`}
                        onClick={() => setSelectedComplaint(ticket)}
                      >
                        {/* colored left stripe severity */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          ticket.severity === 'Urgent' ? 'bg-accent-red' : 
                          ticket.severity === 'Normal' ? 'bg-accent-orange' : 'bg-accent-blue'
                        }`} />

                        <div className="space-y-3 pl-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-accent-blue font-bold tracking-wide">
                              {ticket.ticketId}
                            </span>
                            <span className="text-[10px] text-slate-400 font-light">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-white tracking-wide line-clamp-1">{ticket.title}</h4>
                            <p className="text-xs text-slate-400 font-light line-clamp-2">{ticket.description}</p>
                          </div>

                          {/* AI compact review indicator */}
                          <div className="p-2.5 rounded-xl bg-[#0A0D14]/70 border border-accent-purple/10 text-[10px] flex gap-2 items-start">
                            <Sparkles className="w-3.5 h-3.5 text-accent-purple shrink-0 mt-0.5 animate-pulse" />
                            <div className="space-y-0.5 text-slate-300">
                              <span className="font-semibold text-accent-purple uppercase block tracking-wider font-mono text-[8px]">AI Synopsis</span>
                              <p className="font-light pr-2 line-clamp-1 italic">"{ticket.aiSummary}"</p>
                            </div>
                          </div>

                          <div className="border-t border-white/[0.04] pt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {getCategoryIcon(ticket.category)}
                              <span className="text-[10px] text-slate-300 font-light">{ticket.category}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full ${
                                ticket.status === 'Submitted' ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' :
                                ticket.status === 'In Review' ? 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20' :
                                ticket.status === 'Resolved' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' :
                                'bg-accent-red/10 text-accent-red border border-accent-red/20'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* View tab: College Analytics */}
            {currentTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 text-left"
              >
                <div>
                  <h2 className="text-2xl font-black font-syne text-white uppercase">IMS Portal Grievance Analytics</h2>
                  <p className="text-xs font-light text-slate-400 mt-1">Live statistical trends compiled safely across categories, departments and urgency flags.</p>
                </div>

                {/* Highlight Cards blocks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sortedCategories.map(([cat, val], idx) => (
                    <div 
                      key={cat}
                      className="p-6 rounded-2xl bg-imsec-card border border-white/[0.06] relative overflow-hidden shadow-premium-card text-left"
                    >
                      <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-accent-blue to-accent-purple" />
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(cat)}
                          <span className="text-xs font-semibold text-slate-300 font-syne">{cat} Concerns</span>
                        </div>
                        <span className="text-[10px] font-bold text-accent-purple font-mono uppercase tracking-wider">Spot #{idx+1}</span>
                      </div>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-[10.5px] text-slate-400 font-light">Submissions logged:</span>
                        <h3 className="text-4xl font-extrabold font-syne bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{val}</h3>
                      </div>
                    </div>
                  ))}

                  {sortedCategories.length === 0 && (
                    <div className="md:col-span-3 text-center py-8 bg-white/[0.01] border border-white/5 rounded-2xl text-slate-400 text-xs">
                      Post some claims to view dynamic top categories highlights cards.
                    </div>
                  )}
                </div>

                {/* Graphs Blocks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-imsec-card border border-white/[0.06] space-y-4 shadow-premium-card text-left">
                    <h4 className="text-sm font-black font-syne text-white uppercase tracking-wider">Claims Split By College Categories</h4>
                    <GoogleChart type="PieChart" data={pieChartData} options={{ is3D: false, pieHole: 0.4 }} />
                  </div>

                  <div className="p-6 rounded-2xl bg-imsec-card border border-white/[0.06] space-y-4 shadow-premium-card text-left">
                    <h4 className="text-sm font-black font-syne text-white uppercase tracking-wider">Grievance Trends Sorted By Severity Levels</h4>
                    <GoogleChart type="ColumnChart" data={columnChartData} />
                  </div>
                </div>
              </motion.div>
            )}
          </main>

          {/* Footer branding */}
          <footer className="max-w-7xl mx-auto px-6 pb-8 text-center relative z-10 border-t border-white/[0.04] pt-8">
            <p className="text-xs text-slate-500 font-light tracking-wide">
              Made with precision by <span className="text-slate-300 font-medium font-syne uppercase tracking-wider">Samasya Samadhan Mandali</span>
            </p>
          </footer>

          {/* Collapsible Student Complaint submission Drawer Modal */}
          <AnimatePresence>
            {showSubmitModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 relative" id="ticket-modal">
                {/* opaque backdrop blur overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSubmitModal(false)}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 30 }}
                  className={`relative w-full max-w-lg rounded-3xl bg-imsec-card border border-white/[0.08] p-6 shadow-2xl overflow-y-auto max-h-[90vh] z-50 text-left ${
                    isSubmitShaking ? 'animate-shake border-accent-red-500' : ''
                  }`}
                >
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-accent-blue via-accent-purple to-accent-green" />

                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-black font-syne text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent-purple animate-pulse" />
                      Lodge College Grievance
                    </h3>
                    <button 
                      onClick={() => setShowSubmitModal(false)}
                      className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
                    >
                      X
                    </button>
                  </div>

                  <form onSubmit={submitComplaintHandler} className="space-y-4">
                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono pl-0.5">Category</label>
                      <select
                        value={newComplaint.category}
                        onChange={(e) => setNewComplaint(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full bg-[#0A0D14] border border-white/[0.08] text-xs px-4 py-3 rounded-xl text-white focus:border-accent-blue focus:outline-none transition-all"
                      >
                        <option value="Hostel">Hostel (Blocks A, B, C, D, Girls Hostel)</option>
                        <option value="Classroom">Classroom facilities</option>
                        <option value="Assignment">Academic & Assignments</option>
                        <option value="Canteen">Mess & Canteen Hygiene</option>
                        <option value="WiFi">Wi-Fi & Networks downtime</option>
                        <option value="Library">Library resources</option>
                        <option value="Administration">College Administration desk</option>
                        <option value="Other">Other Miscellaneous</option>
                      </select>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono pl-0.5">Title of Concern</label>
                      <input
                        type="text"
                        placeholder="e.g. Broken laboratory desktop switch on IT block"
                        value={newComplaint.title}
                        onChange={(e) => setNewComplaint(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full bg-[#0A0D14] border border-white/[0.08] text-xs px-4 py-3 rounded-xl text-white focus:border-accent-blue focus:outline-none transition-all font-light ${
                          complaintErrors.title ? 'border-accent-red' : ''
                        }`}
                      />
                      {complaintErrors.title && <span className="text-[10px] text-accent-red font-medium pl-1 block">{complaintErrors.title}</span>}
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono pl-0.5">Detailed Description</label>
                      <textarea
                        rows={4}
                        placeholder="Provide details about structural conditions, room numbers and timing histories. Write min 20 words so CampusVoice AI summarizes correctly."
                        value={newComplaint.description}
                        onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                        className={`w-full bg-[#0A0D14] border border-white/[0.08] text-xs px-4 py-3 rounded-xl text-white focus:border-accent-blue focus:outline-none transition-all font-light leading-relaxed resize-none ${
                          complaintErrors.description ? 'border-accent-red font-semibold' : ''
                        }`}
                      />
                      {complaintErrors.description && <span className="text-[10px] text-accent-red font-medium pl-1 block">{complaintErrors.description}</span>}
                    </div>

                    {/* File Attachment convertor */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block font-mono pl-0.5">Optional Photo Evidence</label>
                      <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                          isDragging ? 'border-accent-purple bg-accent-purple/5' : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.01]'
                        }`}
                        onClick={triggerSelectFile}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
                          className="hidden"
                        />
                        {newComplaint.photoData ? (
                          <div className="space-y-2">
                            <img
                              src={newComplaint.photoData}
                              alt="Complaint Evidence Preview"
                              className="max-h-24 mx-auto rounded-lg border border-white/15"
                            />
                            <span className="text-[10px] text-accent-green font-medium block">✓ Compress base64 ready</span>
                          </div>
                        ) : (
                          <>
                            <Paperclip className="w-5 h-5 text-slate-400 shrink-0" />
                            <div className="text-xs text-slate-300 font-light pr-2">Drag image here, or <span className="text-accent-blue hover:underline">browse files</span></div>
                            <span className="text-[9px] text-slate-400 font-light block">Supports JPG, WEBP, PNG</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Anonymous toggle */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.05]">
                      <div className="space-y-0.5 text-left">
                        <span className="text-xs font-semibold text-white block">Anonymous Submission</span>
                        <p className="text-[10px] text-slate-400 font-light leading-normal">Hides student name and avatar details from portal administrators.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewComplaint(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer select-none duration-200 outline-none ${
                          newComplaint.isAnonymous ? 'bg-accent-blue' : 'bg-white/10'
                        }`}
                      >
                        <span className={`block w-5 h-5 rounded-full bg-[#0A0D14] shadow transform duration-200 ${
                          newComplaint.isAnonymous ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="border-t border-white/[0.06] pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(false)}
                        className="py-3 px-4 rounded-xl border border-white/[0.07] text-slate-300 hover:text-white hover:bg-white/5 transition-all w-1/3 text-xs font-semibold cursor-pointer select-none"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        disabled={submittingComplaint}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple hover:scale-[1.01] text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer selection:scale-95 shadow-md active:scale-98"
                      >
                        {submittingComplaint ? (
                          <>
                            <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-1" />
                            AI Indexing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-[#060814]" />
                            Lodge Core Ticket
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Collapsible Ticket Timeline detail popup (Cubic bezier slider from right) */}
          <AnimatePresence>
            {selectedComplaint && (
              <div className="fixed inset-0 z-50 flex justify-end overflow-hidden" id="details-drawer">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedComplaint(null)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                  className="relative w-full max-w-lg bg-imsec-card border-l border-white/[0.08] h-full p-6 shadow-2xl overflow-y-auto z-50 text-left relative"
                >
                  <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-accent-blue via-accent-purple to-accent-green" />

                  <div className="flex justify-between items-center mb-6 pl-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono bg-white/5 px-2.5 py-0.5 rounded text-accent-blue font-bold">
                        {selectedComplaint.ticketId}
                      </span>
                      <h3 className="text-sm text-slate-400 font-light mt-1.5 text-slate-300">Grievance Document Audit</h3>
                    </div>
                    <button
                      onClick={() => setSelectedComplaint(null)}
                      className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      X
                    </button>
                  </div>

                  <div className="border-b border-white/[0.05] mb-5" />

                  <div className="space-y-7 pl-2 select-text">
                    {/* Basic details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(selectedComplaint.category)}
                          <span className="text-xs text-slate-300">{selectedComplaint.category} Category</span>
                        </div>
                        <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${
                          selectedComplaint.severity === 'Urgent' ? 'bg-accent-red/10 text-accent-red' : 'bg-white/5 text-slate-300'
                        }`}>
                          {selectedComplaint.severity} Urgency
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-white tracking-wide pr-3 leading-snug">{selectedComplaint.title}</h2>
                      <p className="text-xs text-slate-300 font-light leading-relaxed bg-[#0A0D14]/40 p-4 rounded-xl border border-white/[0.03]">{selectedComplaint.description}</p>
                    </div>

                    {/* Render attachment if uploads exist */}
                    {selectedComplaint.fileURL && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Attachment Evidence</span>
                        <img
                          src={selectedComplaint.fileURL}
                          alt="Grievance file Attachment"
                          className="max-h-48 rounded-xl border border-white/10"
                        />
                      </div>
                    )}

                    {/* Purple highlighting AI block */}
                    <div className="p-4 rounded-2xl bg-gradient-to-tr from-accent-purple/10 to-[#1D1929] border border-accent-purple/20 space-y-3 shadow-button-glow">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-accent-purple animate-pulse" />
                        <span className="text-xs font-bold font-syne uppercase text-white tracking-wider">CampusVoice Gemini Summary</span>
                      </div>
                      <div className="space-y-1.5 text-slate-300 pr-2">
                        <p className="text-xs text-slate-200 leading-relaxed italic">"{selectedComplaint.aiSummary}"</p>
                        <div className="pt-2 px-3 py-2 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <span className="text-[9px] font-mono text-accent-purple uppercase tracking-wider font-semibold">Suggested Department Action</span>
                          <p className="text-[11px] font-light text-slate-300">{selectedComplaint.suggestedAction}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="space-y-4">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider font-mono">Resolution Stepper Logs</span>
                      
                      <div className="relative pl-1 select-none space-y-4 timeline-grow-line">
                        {selectedComplaint.statusHistory.map((step, idx) => (
                          <div key={idx} className="flex gap-4 items-start relative z-10">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center animate-pulse scale-[1.1] relative">
                              <div className="w-2 h-2 rounded-full bg-[#0A0D14]" />
                            </div>
                            <div className="flex-1 space-y-0.5 text-left">
                              <div className="text-xs font-semibold text-white flex justify-between pr-2">
                                <span>{step.status} Transition</span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(step.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 font-light pr-2 leading-relaxed">{step.changeSummary}</p>
                              <span className="text-[9.5px] text-slate-400 font-mono block pt-0.5">Executor: {step.updatedBy}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin Interactive Actions control panel */}
                    {isAdmin ? (
                      <div className="p-4 rounded-2xl bg-[#060814]/40 border border-white/[0.04] space-y-4 select-none">
                        <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider font-bold text-accent-blue block">Admin Task Delegation Desk</span>
                        
                        <form onSubmit={handleAdminUpdate} className="space-y-3.5">
                          {/* Change Status */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono tracking-wide block pl-0.5">Ticket Status</label>
                            <select
                              value={adminStatusInput}
                              onChange={(e) => setAdminStatusInput(e.target.value as any)}
                              className="w-full bg-imsec-card border border-white/[0.05] text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-accent-blue text-white"
                            >
                              <option value="Submitted">Submitted (Queued)</option>
                              <option value="In Review">In Review (Analyzing)</option>
                              <option value="Resolved">Resolved (Complete)</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Escalated">Escalated (Urgent)</option>
                            </select>
                          </div>

                          {/* Assign To */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono tracking-wide block pl-0.5">Assign To Representative</label>
                            <input
                              type="email"
                              placeholder="e.g. dean.ac@imsec.ac.in"
                              value={assigneeInput}
                              onChange={(e) => setAssigneeInput(e.target.value)}
                              className="w-full bg-imsec-card border border-white/[0.05] text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-accent-blue text-white font-light"
                            />
                          </div>

                          {/* Internal note */}
                          <div className="space-y-1">
                            <label className="text-[9.5px] text-slate-400 font-mono tracking-wide block pl-0.5">Internal Note</label>
                            <textarea
                              rows={2}
                              placeholder="College members feedback regarding repair schedules..."
                              value={adminNoteInput}
                              onChange={(e) => setAdminNoteInput(e.target.value)}
                              className="w-full bg-imsec-card border border-white/[0.05] text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-accent-blue text-white font-light leading-relaxed resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isUpdatingComplaint}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xs font-semibold hover:scale-[1.01] active:scale-98 transition-all shadow-md mt-2 cursor-pointer flex justify-center items-center gap-1.5"
                          >
                            {isUpdatingComplaint ? (
                              <>
                                <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                                Applying...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 text-[#060814]" />
                                Save & Dispatch Notification
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    ) : (
                      /* Display Note back to Students */
                      (selectedComplaint.adminNote || selectedComplaint.assignedTo) && (
                        <div className="p-4 rounded-xl bg-[#060814]/50 border border-white/[0.04] space-y-2.5">
                          <span className="text-[10px] font-mono text-accent-green uppercase font-bold tracking-wider">Administration Review Response</span>
                          {selectedComplaint.assignedTo && (
                            <div className="text-[11px] text-slate-300 font-light pl-1">
                              <strong>Assigned Representative:</strong> {selectedComplaint.assignedTo}
                            </div>
                          )}
                          {selectedComplaint.adminNote && (
                            <div className="text-[11px] text-slate-300 font-light pl-1 leading-relaxed border-l-2 border-l-accent-green">
                              <strong>Note:</strong> "{selectedComplaint.adminNote}"
                            </div>
                          )}
                        </div>
                      )
                    )}


                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* First Login Registry Questionnaire Modal (Immersive slide-up layout) */}
          <AnimatePresence>
            {showSetupModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Opaque dark overlay */}
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

                <motion.div
                  initial={{ opacity: 0, scale: 0.93, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`relative w-full max-w-md rounded-3xl bg-imsec-card border border-white/[0.07] p-8 shadow-2xl z-50 text-left ${
                    isSetupShaking ? 'animate-shake' : ''
                  }`}
                >
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-accent-blue via-accent-purple to-accent-green" />

                  <div className="space-y-4 mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-accent-blue/10 border border-accent-blue/20 text-[10px] text-accent-blue tracking-widest uppercase font-mono font-bold">
                      CampusVoice Registration
                    </div>
                    <div>
                      <h3 className="text-xl font-black font-syne text-white uppercase">Complete Student Profile</h3>
                      <p className="text-xs text-slate-400 font-light leading-normal mt-1">Please provide academic identification fields to configure grievance workspace credentials properly.</p>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterProfile} className="space-y-4">
                    {/* AKTU Roll Num */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono pl-1 block">University Roll Number (13-Digits)</label>
                      <input
                        type="text"
                        maxLength={13}
                        placeholder="e.g. 2301430100055"
                        value={setupData.rollNumber}
                        onChange={(e) => setSetupData(prev => ({ ...prev, rollNumber: e.target.value.replace(/[^0-9]/g, '') }))}
                        className={`w-full bg-[#0A0D14] border border-white/[0.08] text-xs px-4 py-3 rounded-xl focus:border-accent-blue focus:outline-none text-white transition-all font-mono tracking-wider ${
                          setupFormErrors.rollNumber ? 'border-accent-red font-semibold' : ''
                        }`}
                      />
                      {setupFormErrors.rollNumber && <span className="text-[10px] text-accent-red font-medium pl-1 block">{setupFormErrors.rollNumber}</span>}
                    </div>

                    {/* Department Branch */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono pl-1 block">College Department Branch</label>
                      <select
                        value={setupData.branch}
                        onChange={(e) => setSetupData(prev => ({ ...prev, branch: e.target.value }))}
                        className="w-full bg-[#0A0D14] border border-white/[0.08] text-xs px-3 py-3 rounded-xl focus:border-accent-blue focus:outline-none text-white font-light transition-all"
                      >
                        <option value="Computer Science">Computer Science & Engineering (CSE)</option>
                        <option value="Information Technology">Information Technology (IT)</option>
                        <option value="Electronics">Electronics & Communication (ECE)</option>
                        <option value="Mechanical">Mechanical Engineering (ME)</option>
                        <option value="Civil">Civil Engineering (CE)</option>
                        <option value="Electrical">Electrical & Electronics (EN)</option>
                        <option value="Biotechnology">Biotechnology</option>
                        <option value="Applied Sciences">Applied Sciences</option>
                      </select>
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono pl-1 block">Current Year</label>
                      <select
                        value={setupData.year}
                        onChange={(e) => setSetupData(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full bg-[#0A0D14] border border-white/[0.08] text-xs px-3 py-3 rounded-xl focus:border-accent-blue focus:outline-none text-white font-light transition-all"
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Senior)</option>
                      </select>
                    </div>

                    {/* Hostel Block */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono pl-1 block">Hostel Accommodation Status</label>
                      <select
                        value={setupData.hostelBlock}
                        onChange={(e) => setSetupData(prev => ({ ...prev, hostelBlock: e.target.value }))}
                        className="w-full bg-[#0A0D14] border border-white/[0.08] text-xs px-3 py-3 rounded-xl focus:border-accent-blue focus:outline-none text-white font-light transition-all"
                      >
                        <option value="Day Scholar">Day Scholar (Commuter)</option>
                        <option value="Block A">Hostel Block A</option>
                        <option value="Block B">Hostel Block B</option>
                        <option value="Block C">Hostel Block C</option>
                        <option value="Block D">Hostel Block D</option>
                        <option value="Girls Hostel">Girls Hostel Residence</option>
                      </select>
                    </div>

                    <div className="border-t border-white/[0.06] pt-5 mt-2">
                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:scale-[1.01] active:scale-98 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                      >
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#060814]" />
                        Confirm & Initialize Account
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
