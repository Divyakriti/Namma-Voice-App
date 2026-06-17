export type Role = 'citizen' | 'officer' | 'admin';

export interface Citizen {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  reputationPoints: number;
}

export type DepartmentType = 
  | 'Municipal Corporation'
  | 'Water Board'
  | 'Electricity Board'
  | 'Highways Department'
  | 'Police Department';

export type CategoryType =
  | 'Garbage'
  | 'Roads'
  | 'Water'
  | 'Streetlights'
  | 'Police'
  | 'Encroachment'
  | 'Public Safety'
  | 'General';

export type StatusType =
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Verification Pending'
  | 'Citizen Verified' // Or transitioned straight to Resolved after verification
  | 'Resolved';

export interface Officer {
  id: string; // Officer ID
  name: string;
  department: DepartmentType;
  district: string;
}

export interface ComplaintHistory {
  id: string;
  complaintId: string;
  status: StatusType;
  updatedBy: string;
  updatedByRole: Role | 'System';
  remarks: string;
  timestamp: string;
  photoUrl?: string; // e.g. "after photo"
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  department: DepartmentType;
  location: {
    district: string;
    city: string;
    manualAddress: string;
    latitude: number;
    longitude: number;
  };
  reporter: {
    id: string;
    name: string;
    phone: string;
  };
  voiceUrl?: string;
  videoUrl?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  dateCreated: string;
  dueDate?: string;
  status: StatusType;
  remarks?: string;
  verificationPin?: string;
  verificationAttempts?: number;
}

export interface LeaderboardMetric {
  departmentName: DepartmentType;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  avgResolutionTimeHours: number; // dynamically computed
  resolutionRate: number; // percentage
  rank: number;
}
