// Mock database for Semaphore 2026 Admin Panel (used when live API is unavailable)

export const initialAdmins = [
  {
    _id: "6a8190a14b4ed61dcc03b70d",
    name: "Super Admin",
    email: "semaphore2026@gmail.com",
    password: "mca@9988",
    role: "superadmin",
    createdAt: "2026-08-16T10:27:45.000Z",
    updatedAt: "2026-08-16T10:27:45.000Z"
  },
  {
    _id: "67b0b1f8e21a8a0012345678",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "admin",
    createdAt: "2026-08-16T10:28:00.000Z",
    updatedAt: "2026-08-16T10:28:00.000Z"
  },
  {
    _id: "67b0b1f8e21a8a0012345679",
    name: "Swasthik Lead",
    email: "swasthik@semaphore.com",
    password: "password123",
    role: "admin",
    createdAt: "2026-08-16T11:00:00.000Z",
    updatedAt: "2026-08-16T11:00:00.000Z"
  }
];

export const initialUsers = [
  {
    _id: "67b0c2a1e4b0123456789abc",
    name: "Akash",
    email: "akash@nmamit.in",
    role: "user",
    collegeName: "XY College (NMAMIT)",
    loginTime: "24 mins ago",
    college: {
      _id: "67b0c110e4b0987654321def",
      collegeName: "XY College (NMAMIT)",
      totalTeams: 2
    },
    createdAt: "2026-08-22T12:30:00.000Z",
    updatedAt: "2026-08-22T12:30:00.000Z"
  },
  {
    _id: "67b0c2a1e4b0123456789abd",
    name: "Shashidhara",
    email: "shashidhara@nitte.edu.in",
    role: "user",
    collegeName: "NMAM Institute of Technology",
    loginTime: "1 hour ago",
    college: {
      _id: "67b0c110e4b0987654321deg",
      collegeName: "NMAM Institute of Technology",
      totalTeams: 2
    },
    createdAt: "2026-08-22T11:15:00.000Z",
    updatedAt: "2026-08-22T11:15:00.000Z"
  },
  {
    _id: "67b0c2a1e4b0123456789abe",
    name: "Jane Smith",
    email: "jane@mit.edu",
    role: "user",
    collegeName: "MIT Tech",
    loginTime: "2 hours ago",
    college: {
      _id: "67b0c110e4b0987654321deh",
      collegeName: "MIT Tech",
      totalTeams: 2
    },
    createdAt: "2026-08-22T10:00:00.000Z",
    updatedAt: "2026-08-22T10:00:00.000Z"
  },
  {
    _id: "67b0c2a1e4b0123456789abf",
    name: "Rahul Sharma",
    email: "rahul.s@rvce.edu.in",
    role: "user",
    collegeName: "RV College of Engineering",
    loginTime: "4 hours ago",
    college: {
      _id: "67b0c110e4b0987654321dei",
      collegeName: "RV College of Engineering",
      totalTeams: 2
    },
    createdAt: "2026-08-22T08:30:00.000Z",
    updatedAt: "2026-08-22T08:30:00.000Z"
  }
];

export const initialEvents = [
  {
    id: 'EVT-01',
    _id: 'evt_01',
    title: 'CodeFest 2026',
    shortTag: 'Coding',
    category: 'Coding & Hackathon',
    fee: '₹ 500',
    maxTeamsPerCollege: 2,
    maxTeamMembers: 4,
    teamsRegistered: 18,
    venue: 'Lab 301, Main Block',
    status: 'Active',
    description: '3-round speed coding, algorithm optimization, and competitive algorithmic problem solving.',
    coordinators: ['Havyas', 'Shashidhara']
  },
  {
    id: 'EVT-02',
    _id: 'evt_02',
    title: 'RoboWars Arena',
    shortTag: 'Robotics',
    category: 'Robotics Flagship',
    fee: '₹ 750',
    maxTeamsPerCollege: 2,
    maxTeamMembers: 5,
    teamsRegistered: 12,
    venue: 'Auditorium Quadrangle',
    status: 'Active',
    description: 'Heavyweight combat robot arena battles with obstacle clearance and speed trials.',
    coordinators: ['Swasthik', 'Ananya Prabhu']
  },
  {
    id: 'EVT-03',
    _id: 'evt_03',
    title: 'WebCrafters',
    shortTag: 'Web',
    category: 'Web Development',
    fee: '₹ 400',
    maxTeamsPerCollege: 2,
    maxTeamMembers: 3,
    teamsRegistered: 15,
    venue: 'Lab 202, MCA Block',
    status: 'Active',
    description: 'Rapid full-stack responsive web sprint with modern frontend stacks and REST integration.',
    coordinators: ['Hanson', 'Dheemanth']
  },
  {
    id: 'EVT-04',
    _id: 'evt_04',
    title: 'Gaming & Esports',
    shortTag: 'Gaming',
    category: 'Esports Championship',
    fee: '₹ 300',
    maxTeamsPerCollege: 2,
    maxTeamMembers: 5,
    teamsRegistered: 9,
    venue: 'Seminar Hall 1',
    status: 'Active',
    description: 'Multi-round competitive PC gaming tournament with live spectator projection.',
    coordinators: ['Karthik Rao', 'Varun']
  }
];

export const initialCoordinators = [
  {
    id: 'COORD-01',
    _id: 'coord_01',
    name: 'Rohan Shenoy',
    email: 'rohan.shenoy@semaphore.com',
    phone: '+91 98860 12345',
    assignedEvent: 'CodeFest 2026',
    department: 'MCA 2nd Year',
    status: 'Active',
    createdAt: '2026-08-16T10:00:00.000Z'
  },
  {
    id: 'COORD-02',
    _id: 'coord_02',
    name: 'Ananya Prabhu',
    email: 'ananya.p@semaphore.com',
    phone: '+91 98450 67890',
    assignedEvent: 'RoboWars Arena',
    department: 'MCA 2nd Year',
    status: 'Active',
    createdAt: '2026-08-16T10:30:00.000Z'
  },
  {
    id: 'COORD-03',
    _id: 'coord_03',
    name: 'Karthik Rao',
    email: 'karthik.rao@semaphore.com',
    phone: '+91 97410 54321',
    assignedEvent: 'DesignX UI/UX',
    department: 'MCA 1st Year',
    status: 'Active',
    createdAt: '2026-08-16T11:00:00.000Z'
  },
  {
    id: 'COORD-04',
    _id: 'coord_04',
    name: 'Hanson DSouza',
    email: 'hanson@semaphore.com',
    phone: '+91 94488 12399',
    assignedEvent: 'WebCrafters',
    department: 'MCA 2nd Year',
    status: 'Active',
    createdAt: '2026-08-16T11:30:00.000Z'
  }
];

export const DEFAULT_RECEIPT_PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280"><rect width="400" height="280" rx="12" fill="%23090d16" stroke="%231e293b" stroke-width="2"/><circle cx="200" cy="70" r="28" fill="%2310b981" fill-opacity="0.15"/><path d="M190 70l6 7 14-14" stroke="%2310b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="200" y="125" font-family="system-ui,-apple-system,sans-serif" font-size="15" font-weight="700" fill="%23ffffff" text-anchor="middle">UPI Verified Payment</text><text x="200" y="148" font-family="system-ui,-apple-system,sans-serif" font-size="12" fill="%2338bdf8" text-anchor="middle">Scan %26 Pay Digital Receipt</text><rect x="40" y="175" width="320" height="42" rx="8" fill="%23131d2e" stroke="%231e293b"/><text x="60" y="201" font-family="system-ui,sans-serif" font-size="12" fill="%2394a3b8">Status:</text><text x="340" y="201" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="%2310b981" text-anchor="end">APPROVED ✓</text><text x="200" y="250" font-family="monospace" font-size="11" fill="%2364748b" text-anchor="middle">Semaphore 2026 Payment Hub</text></svg>';

export const initialRegistrations = [
  {
    id: 'REG-892101',
    _id: 'reg_892101',
    registrationFee: 300,
    collegeName: 'NMAM Institute of Technology',
    teamName: 'Team-NN25MCA081',
    leaderName: 'Nikhil P',
    email: 'nn25mca081@nmamit.in',
    phone: '7019480750',
    event: 'CodeFest 2026',
    membersCount: 1,
    members: ['Nikhil P'],
    participants: [
      {
        name: 'Nikhil P',
        email: 'nn25mca081@nmamit.in',
        phone: '7019480750',
        college: 'NMAM Institute of Technology',
        _id: '6a8a7b7f21690f7526bded3a'
      }
    ],
    paymentId: {
      _id: '6a8a86b41adfa1c1017ffbdc',
      user: '6a84988ea0d80f8d8766706e',
      imageUrl: DEFAULT_RECEIPT_PLACEHOLDER,
      amount: 300,
      utr: '23456787654',
      timestamp: '2026-08-23T05:35:48.092Z',
      status: 'approved',
      createdAt: '2026-08-23T05:35:48.101Z',
      updatedAt: '2026-08-23T05:36:16.938Z'
    },
    teamsInCollege: 1,
    paymentStatus: 'Approved',
    utr: '23456787654',
    amount: '₹ 300',
    amountNumber: 300,
    proofUrl: DEFAULT_RECEIPT_PLACEHOLDER,
    registeredAt: '2026-08-23T04:47:59.273Z'
  },
  {
    id: 'REG-892102',
    _id: 'reg_892102',
    registrationFee: 500,
    collegeName: 'MIT Tech',
    teamName: 'CyberKnights',
    leaderName: 'Jane Smith',
    email: 'jane@mit.edu',
    phone: '+91 98451 10022',
    event: 'WebCrafters',
    membersCount: 4,
    members: ['Jane Smith', 'Rohan Verma', 'Kavya S', 'Aditya Nair'],
    participants: [
      { name: 'Jane Smith', email: 'jane@mit.edu', phone: '+91 98451 10022', college: 'MIT Tech', _id: '6a8a7b7f21690f7526bded3b' },
      { name: 'Rohan Verma', email: 'rohan@mit.edu', phone: '+91 98451 10023', college: 'MIT Tech', _id: '6a8a7b7f21690f7526bded3c' },
      { name: 'Kavya S', email: 'kavya@mit.edu', phone: '+91 98451 10024', college: 'MIT Tech', _id: '6a8a7b7f21690f7526bded3d' },
      { name: 'Aditya Nair', email: 'aditya@mit.edu', phone: '+91 98451 10025', college: 'MIT Tech', _id: '6a8a7b7f21690f7526bded3e' }
    ],
    paymentId: {
      _id: '6a8a86b41adfa1c1017ffbdd',
      user: '6a84988ea0d80f8d8766706f',
      imageUrl: DEFAULT_RECEIPT_PLACEHOLDER,
      amount: 500,
      utr: 'UTR19284019283',
      timestamp: '2026-08-22T11:15:00.000Z',
      status: 'pending',
      createdAt: '2026-08-22T11:15:00.000Z'
    },
    teamsInCollege: 2,
    paymentStatus: 'Pending',
    utr: 'UTR19284019283',
    amount: '₹ 500',
    amountNumber: 500,
    proofUrl: DEFAULT_RECEIPT_PLACEHOLDER,
    registeredAt: '2026-08-22 11:15 AM'
  },
  {
    id: 'REG-892103',
    _id: 'reg_892103',
    registrationFee: 500,
    collegeName: 'RV College of Engineering',
    teamName: 'MatrixRunners',
    leaderName: 'Ananya Rao',
    email: 'ananya@rvce.edu.in',
    phone: '+91 99002 33411',
    event: 'Gaming & Esports',
    membersCount: 4,
    members: ['Ananya Rao', 'Varun Gowda', 'Sameer Ali', 'Neha Patil'],
    participants: [
      { name: 'Ananya Rao', email: 'ananya@rvce.edu.in', phone: '+91 99002 33411', college: 'RV College of Engineering', _id: '6a8a7b7f21690f7526bded3f' },
      { name: 'Varun Gowda', email: 'varun@rvce.edu.in', phone: '+91 99002 33412', college: 'RV College of Engineering', _id: '6a8a7b7f21690f7526bded40' },
      { name: 'Sameer Ali', email: 'sameer@rvce.edu.in', phone: '+91 99002 33413', college: 'RV College of Engineering', _id: '6a8a7b7f21690f7526bded41' },
      { name: 'Neha Patil', email: 'neha@rvce.edu.in', phone: '+91 99002 33414', college: 'RV College of Engineering', _id: '6a8a7b7f21690f7526bded42' }
    ],
    paymentId: {
      _id: '6a8a86b41adfa1c1017ffbde',
      user: '6a84988ea0d80f8d87667070',
      imageUrl: DEFAULT_RECEIPT_PLACEHOLDER,
      amount: 500,
      utr: 'UTR81920391823',
      timestamp: '2026-08-22T09:00:00.000Z',
      status: 'approved',
      createdAt: '2026-08-22T09:00:00.000Z'
    },
    teamsInCollege: 2,
    paymentStatus: 'Approved',
    utr: 'UTR81920391823',
    amount: '₹ 500',
    amountNumber: 500,
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80',
    registeredAt: '2026-08-22 09:00 AM'
  },
  {
    id: 'REG-892104',
    _id: 'reg_892104',
    registrationFee: 500,
    collegeName: 'BMS College of Engineering',
    teamName: 'ByteBrigade',
    leaderName: 'Kiran Kumar',
    email: 'kiran@bmsce.ac.in',
    phone: '+91 98860 44512',
    event: 'CodeFest 2026',
    membersCount: 4,
    members: ['Kiran Kumar', 'Siddharth M', 'Aishwarya K', 'Tejaswini R'],
    participants: [
      { name: 'Kiran Kumar', email: 'kiran@bmsce.ac.in', phone: '+91 98860 44512', college: 'BMS College of Engineering', _id: '6a8a7b7f21690f7526bded43' },
      { name: 'Siddharth M', email: 'siddharth@bmsce.ac.in', phone: '+91 98860 44513', college: 'BMS College of Engineering', _id: '6a8a7b7f21690f7526bded44' },
      { name: 'Aishwarya K', email: 'aishwarya@bmsce.ac.in', phone: '+91 98860 44514', college: 'BMS College of Engineering', _id: '6a8a7b7f21690f7526bded45' },
      { name: 'Tejaswini R', email: 'tejaswini@bmsce.ac.in', phone: '+91 98860 44515', college: 'BMS College of Engineering', _id: '6a8a7b7f21690f7526bded46' }
    ],
    paymentId: {
      _id: '6a8a86b41adfa1c1017ffbdf',
      user: '6a84988ea0d80f8d87667071',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80',
      amount: 500,
      utr: 'UTR66219044231',
      timestamp: '2026-08-22T14:15:00.000Z',
      status: 'approved',
      createdAt: '2026-08-22T14:15:00.000Z'
    },
    teamsInCollege: 1,
    paymentStatus: 'Approved',
    utr: 'UTR66219044231',
    amount: '₹ 500',
    amountNumber: 500,
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80',
    registeredAt: '2026-08-22 02:15 PM'
  },
  {
    id: 'REG-892105',
    _id: 'reg_892105',
    registrationFee: 300,
    collegeName: 'PES University',
    teamName: 'PES Hackers',
    leaderName: 'Tanmay Joshi',
    email: 'tanmay@pes.edu',
    phone: '+91 96112 55901',
    event: 'WebCrafters',
    membersCount: 2,
    members: ['Tanmay Joshi', 'Harish Patel'],
    participants: [
      { name: 'Tanmay Joshi', email: 'tanmay@pes.edu', phone: '+91 96112 55901', college: 'PES University', _id: '6a8a7b7f21690f7526bded47' },
      { name: 'Harish Patel', email: 'harish@pes.edu', phone: '+91 96112 55902', college: 'PES University', _id: '6a8a7b7f21690f7526bded48' }
    ],
    paymentId: {
      _id: '6a8a86b41adfa1c1017ffbe0',
      user: '6a84988ea0d80f8d87667072',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80',
      amount: 300,
      utr: 'UTR77109283419',
      timestamp: '2026-08-22T16:30:00.000Z',
      status: 'approved',
      createdAt: '2026-08-22T16:30:00.000Z'
    },
    teamsInCollege: 2,
    paymentStatus: 'Approved',
    utr: 'UTR77109283419',
    amount: '₹ 300',
    amountNumber: 300,
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80',
    registeredAt: '2026-08-22 04:30 PM'
  }
];

export const generateMockJWT = (admin) => {

  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ id: admin._id, email: admin.email, role: admin.role, exp: Date.now() + 86400000 }));
  const signature = btoa("semaphore2026_secret_sig");
  return `${header}.${payload}.${signature}`;
};

export const initialPayments = [
  {
    paymentid: "66c89f1e1a2b3c4d5e6f7p99",
    _id: "66c89f1e1a2b3c4d5e6f7p99",
    amount: 1000,
    utr: "UTR987654321012",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80",
    imageurl: "https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80",
    status: "approved",
    message: "Payment verified via UTR bank statement",
    approvedBy: {
      _id: "66c89f1e2a3b4c5d6e7fadmin1",
      name: "Super Admin",
      email: "admin@example.com",
      role: "superadmin"
    },
    timestamp: "2026-08-23T13:12:00.000Z",
    createdAt: "2026-08-23T13:12:00.000Z",
    updatedAt: "2026-08-23T14:00:00.000Z",
    user: {
      _id: "66c89f1e1a2b3c4d5e6f7a80",
      name: "John Doe",
      email: "john@example.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
      collegeName: "Stanford University",
      college: {
        _id: "66c89f1e1a2b3c4d5e6f7c00",
        collegeName: "Stanford University",
        totalTeams: 1
      },
      team: {
        _id: "66c89f1e1a2b3c4d5e6f7a81",
        name: "CyberKnights",
        teamid: "TEAM-1724419200000-4821"
      }
    },
    events: [
      {
        _id: "66c89f1e1a2b3c4d5e6f7b01",
        title: "CodeSprint Hackathon",
        description: "24-hour coding marathon",
        date: "2026-09-15T09:00:00.000Z",
        registrationFee: 500
      },
      {
        _id: "66c89f1e1a2b3c4d5e6f7b02",
        title: "Robo Wars",
        description: "Bot combat tournament",
        date: "2026-09-16T10:00:00.000Z",
        registrationFee: 500
      }
    ]
  },
  {
    paymentid: "66c89f1e1a2b3c4d5e6f7p98",
    _id: "66c89f1e1a2b3c4d5e6f7p98",
    amount: 500,
    utr: "UTR98231049281",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80",
    imageurl: "https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80",
    status: "pending",
    message: "Awaiting bank statement confirmation",
    approvedBy: null,
    timestamp: "2026-08-23T14:10:00.000Z",
    createdAt: "2026-08-23T14:10:00.000Z",
    updatedAt: "2026-08-23T14:10:00.000Z",
    user: {
      _id: "66c89f1e1a2b3c4d5e6f7a82",
      name: "Shashidhara",
      email: "shashidhara@nitte.edu.in",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
      collegeName: "NMAM Institute of Technology",
      college: {
        _id: "66c89f1e1a2b3c4d5e6f7c01",
        collegeName: "NMAM Institute of Technology",
        totalTeams: 2
      },
      team: {
        _id: "66c89f1e1a2b3c4d5e6f7a83",
        name: "Team-X",
        teamid: "TEAM-1724419200000-9912"
      }
    },
    events: [
      {
        _id: "66c89f1e1a2b3c4d5e6f7b03",
        title: "CodeFest 2026",
        description: "Speed coding and algorithmic optimization competition",
        date: "2026-09-15T10:00:00.000Z",
        registrationFee: 500
      }
    ]
  },
  {
    paymentid: "66c89f1e1a2b3c4d5e6f7p97",
    _id: "66c89f1e1a2b3c4d5e6f7p97",
    amount: 750,
    utr: "UTR19284019283",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80",
    imageurl: "https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80",
    status: "rejected",
    message: "Invalid UTR transaction reference",
    approvedBy: {
      _id: "66c89f1e2a3b4c5d6e7fadmin2",
      name: "John Doe Admin",
      email: "john@example.com",
      role: "admin"
    },
    timestamp: "2026-08-23T11:45:00.000Z",
    createdAt: "2026-08-23T11:45:00.000Z",
    updatedAt: "2026-08-23T12:00:00.000Z",
    user: {
      _id: "66c89f1e1a2b3c4d5e6f7a84",
      name: "Jane Smith",
      email: "jane@mit.edu",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
      collegeName: "MIT Tech",
      college: {
        _id: "66c89f1e1a2b3c4d5e6f7c02",
        collegeName: "MIT Tech",
        totalTeams: 2
      },
      team: {
        _id: "66c89f1e1a2b3c4d5e6f7a85",
        name: "AlgoWizards",
        teamid: "TEAM-1724419200000-1102"
      }
    },
    events: [
      {
        _id: "66c89f1e1a2b3c4d5e6f7b04",
        title: "RoboWars Arena",
        description: "Heavyweight combat robot arena battles",
        date: "2026-09-16T11:00:00.000Z",
        registrationFee: 750
      }
    ]
  }
];

