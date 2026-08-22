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

export const initialRegistrations = [
  {
    id: 'REG-892101',
    _id: 'reg_892101',
    collegeName: 'NMAM Institute of Technology',
    teamName: 'Team-X',
    leaderName: 'Shashidhara',
    email: 'shashidhara@nitte.edu.in',
    phone: '+91 98860 12345',
    event: 'CodeFest 2026',
    membersCount: 4,
    members: ['Shashidhara (Lead)', 'Rohan Shenoy', 'Pranav Kumar', 'Deepa Hegde'],
    teamsInCollege: 2,
    paymentStatus: 'Pending',
    utr: 'UTR98231049281',
    amount: '₹ 500',
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
    registeredAt: '2026-08-22 10:30 AM'
  },
  {
    id: 'REG-892102',
    _id: 'reg_892102',
    collegeName: 'MIT Tech',
    teamName: 'CyberKnights',
    leaderName: 'Jane Smith',
    email: 'jane@mit.edu',
    phone: '+91 98451 10022',
    event: 'WebCrafters',
    membersCount: 4,
    members: ['Jane Smith (Lead)', 'Rohan Verma', 'Kavya S', 'Aditya Nair'],
    teamsInCollege: 2,
    paymentStatus: 'Pending',
    utr: 'UTR19284019283',
    amount: '₹ 500',
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
    registeredAt: '2026-08-22 11:15 AM'
  },
  {
    id: 'REG-892103',
    _id: 'reg_892103',
    collegeName: 'RV College of Engineering',
    teamName: 'MatrixRunners',
    leaderName: 'Ananya Rao',
    email: 'ananya@rvce.edu.in',
    phone: '+91 99002 33411',
    event: 'Gaming & Esports',
    membersCount: 4,
    members: ['Ananya Rao (Lead)', 'Varun Gowda', 'Sameer Ali', 'Neha Patil'],
    teamsInCollege: 2,
    paymentStatus: 'Approved',
    utr: 'UTR81920391823',
    amount: '₹ 500',
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
    registeredAt: '2026-08-22 09:00 AM'
  },
  {
    id: 'REG-892104',
    _id: 'reg_892104',
    collegeName: 'BMS College of Engineering',
    teamName: 'ByteBrigade',
    leaderName: 'Kiran Kumar',
    email: 'kiran@bmsce.ac.in',
    phone: '+91 98860 44512',
    event: 'CodeFest 2026',
    membersCount: 4,
    members: ['Kiran Kumar (Lead)', 'Siddharth M', 'Aishwarya K', 'Tejaswini R'],
    teamsInCollege: 1,
    paymentStatus: 'Approved',
    utr: 'UTR66219044231',
    amount: '₹ 500',
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
    registeredAt: '2026-08-22 02:15 PM'
  },
  {
    id: 'REG-892105',
    _id: 'reg_892105',
    collegeName: 'PES University',
    teamName: 'PES Hackers',
    leaderName: 'Tanmay Joshi',
    email: 'tanmay@pes.edu',
    phone: '+91 96112 55901',
    event: 'WebCrafters',
    membersCount: 2,
    members: ['Tanmay Joshi (Lead)', 'Harish Patel'],
    teamsInCollege: 2,
    paymentStatus: 'Approved',
    utr: 'UTR77109283419',
    amount: '₹ 300',
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
    registeredAt: '2026-08-22 04:30 PM'
  }
];

export const generateMockJWT = (admin) => {

  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ id: admin._id, email: admin.email, role: admin.role, exp: Date.now() + 86400000 }));
  const signature = btoa("semaphore2026_secret_sig");
  return `${header}.${payload}.${signature}`;
};
