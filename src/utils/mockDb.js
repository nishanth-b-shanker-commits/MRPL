// Mock database containing seed data for the LMS POC

export const adminUser = {
  username: 'admin',
  password: 'admin123',
  name: 'System Administrator',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
};

export const initialCourses = [
  {
    id: 'scorm-security-101',
    title: 'Cybersecurity Fundamentals (SCORM 1.2)',
    description: 'Learn the basic concepts of IT security, threat management, and best practices for securing corporate devices.',
    type: 'SCORM',
    duration: '30 mins',
    category: 'Compliance',
    completionRate: 75,
    enrolledCount: 140,
    scormVersion: '1.2',
    isDemo: true,
  },
  {
    id: 'video-sec-01',
    title: 'Cloud Security Architecture & IAM (Video)',
    description: 'Video course detailing Identity & Access Management (IAM), role-based access, and zero-trust security principles.',
    type: 'Video',
    duration: '15 mins',
    category: 'Security',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    transcript: 'Welcome to Cloud Security. In this module, we will explore Identity & Access Management (IAM), least privilege access, multi-factor authentication, and securing cloud APIs.',
    completionRate: 88,
    enrolledCount: 95
  },
  {
    id: 'git-advanced',
    title: 'Git Version Control: Beyond the Basics',
    description: 'Deep dive into git rebase, cherry-pick, conflict resolution, and trunk-based development workflows.',
    type: 'Video & Document',
    duration: '2 hours',
    category: 'Engineering',
    completionRate: 92,
    enrolledCount: 85,
  },
  {
    id: 'project-management',
    title: 'Modern Project Management & Agile',
    description: 'Understand Agile methodologies, Scrum ceremonies, Kanban boards, and how to plan sprint backlogs effectively.',
    type: 'Interactive',
    duration: '1.5 hours',
    category: 'Productivity',
    completionRate: 64,
    enrolledCount: 110,
  },
  {
    id: 'data-privacy',
    title: 'GDPR & Data Privacy compliance',
    description: 'Essential training for data protection, understanding user privacy rights, and handling sensitive customer data.',
    type: 'Document',
    duration: '45 mins',
    category: 'Compliance',
    completionRate: 98,
    enrolledCount: 300,
  }
];

export const searchItems = [
  {
    id: 'doc-1',
    title: 'Company Network Access Guide',
    description: 'Instructions on setting up corporate VPN, connecting to secure Wi-Fi, and handling network passwords.',
    content: 'To access the corporate network, download the VPN client. Reset credentials via the portal. Multi-Factor Authentication (MFA) is mandatory for login. Do not share your security keys.',
    type: 'document',
    category: 'Security',
    clicks: 12,
  },
  {
    id: 'video-1',
    title: 'Git Rebase and Merge Workflows',
    description: 'Video tutorial detailing how to rebase local branches and clean up git history before merging pull requests.',
    content: 'In this video, we cover git rebase interactive. Learn how to squash commits, rephrase messages, and resolve rebase conflicts in Visual Studio Code. Avoid merging main into branch directly.',
    type: 'video',
    category: 'Engineering',
    clicks: 8,
  },
  {
    id: 'video-sec-01-item',
    title: 'Cloud Security Architecture & IAM (Video)',
    description: 'Video course detailing Identity & Access Management (IAM), role-based access, and zero-trust security principles.',
    content: 'Welcome to Cloud Security. In this module, we will explore Identity & Access Management (IAM), least privilege access, multi-factor authentication, and securing cloud APIs.',
    type: 'video',
    category: 'Security',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    clicks: 15,
  },
  {
    id: 'presentation-1',
    title: 'Introduction to Agile & Scrum Framework',
    description: 'Slide deck explaining Scrum roles (Product Owner, Scrum Master, Developers) and sprint planning processes.',
    content: 'Agile development principles. Scrum values: commitment, courage, focus, openness, respect. The 4 ceremonies: Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective.',
    type: 'presentation',
    category: 'Productivity',
    clicks: 5,
  },
  {
    id: 'post-1',
    title: 'Discussion: Troubleshooting VPN Connection Errors',
    description: 'Team discussion thread resolving the "Authentication Failed" error during VPN login on MacOS.',
    content: 'User posted: Having trouble logging into VPN since updating MacOS. Admin replied: Make sure to delete old configuration profiles in System Settings and reinstall the client certificate.',
    type: 'discussion',
    category: 'Security',
    clicks: 22,
  },
  {
    id: 'doc-2',
    title: 'Data Protection Policy and GDPR Compliance',
    description: 'Official corporate policy outlining data controller responsibilities and customer rights regarding personal information.',
    content: 'We adhere strictly to GDPR policies. Users have the right to be forgotten, the right to data portability, and the right to object. All customer databases must encrypt personally identifiable information (PII) at rest.',
    type: 'document',
    category: 'Compliance',
    clicks: 4,
  },
  {
    id: 'video-2',
    title: 'Password Management Best Practices',
    description: 'Video covering how to generate strong, unique passwords using vault managers and why sharing passwords via Slack is prohibited.',
    content: 'Always use a credential vault. Never use personal names, birthdates, or generic phrases. Multi-factor authentication adds a second layer of defense. Keep recovery codes printed securely.',
    type: 'video',
    category: 'Security',
    clicks: 17,
  }
];

export const synonymsMap = {
  'reset': ['change', 'modify', 'troubleshoot', 'forgot', 'update', 'restore', 'recover'],
  'password': ['credential', 'passcode', 'login', 'credentials', 'auth', 'key', 'keycard', 'password'],
  'vpn': ['network', 'remote', 'connect', 'access', 'wifi', 'wi-fi', 'corporate'],
  'git': ['github', 'version', 'branch', 'merge', 'rebase', 'repository', 'commit'],
  'scrum': ['agile', 'sprint', 'board', 'kanban', 'project', 'meeting', 'standup'],
  'privacy': ['gdpr', 'compliance', 'security', 'data', 'customer', 'sensitive', 'pii']
};

export const competencyFramework = {
  'Software Engineer': {
    'Coding & Design': 4,
    'Version Control (Git)': 4,
    'Agile Methodologies': 3,
    'Security Awareness': 3,
    'Data Privacy': 2
  },
  'Customer Support Specialist': {
    'Coding & Design': 1,
    'Version Control (Git)': 1,
    'Agile Methodologies': 2,
    'Security Awareness': 4,
    'Data Privacy': 4
  },
  'Product Manager': {
    'Coding & Design': 2,
    'Version Control (Git)': 2,
    'Agile Methodologies': 5,
    'Security Awareness': 3,
    'Data Privacy': 3
  }
};

export const initialProfiles = [
  {
    id: 'emp-01',
    username: 'sarah.chen',
    password: 'password',
    name: 'Sarah Chen',
    role: 'Software Engineer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    status: 'Active',
    skills: {
      'Coding & Design': 3,
      'Version Control (Git)': 2,
      'Agile Methodologies': 3,
      'Security Awareness': 2,
      'Data Privacy': 2
    },
    trainingHistory: [
      { courseId: 'data-privacy', status: 'completed', score: 100, completedAt: '2026-02-15' }
    ]
  },
  {
    id: 'emp-02',
    username: 'marcus.brody',
    password: 'password',
    name: 'Marcus Brody',
    role: 'Customer Support Specialist',
    department: 'Customer Success',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    status: 'Active',
    skills: {
      'Coding & Design': 1,
      'Version Control (Git)': 1,
      'Agile Methodologies': 1,
      'Security Awareness': 4,
      'Data Privacy': 2
    },
    trainingHistory: [
      { courseId: 'scorm-security-101', status: 'completed', score: 85, completedAt: '2026-03-10' }
    ]
  },
  {
    id: 'emp-03',
    username: 'elena.rostova',
    password: 'password',
    name: 'Elena Rostova',
    role: 'Product Manager',
    department: 'Product',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    status: 'Active',
    skills: {
      'Coding & Design': 2,
      'Version Control (Git)': 1,
      'Agile Methodologies': 4,
      'Security Awareness': 3,
      'Data Privacy': 3
    },
    trainingHistory: []
  }
];
