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
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    collegeName: "MIT Tech",
    college: {
      _id: "67b0c110e4b0987654321def",
      collegeName: "MIT Tech",
      totalTeams: 2
    },
    createdAt: "2026-08-16T10:00:00.000Z",
    updatedAt: "2026-08-16T10:00:00.000Z"
  },
  {
    _id: "67b0c2a1e4b0123456789abd",
    name: "Rahul Sharma",
    email: "rahul@nitte.edu.in",
    role: "user",
    collegeName: "NMAM Institute of Technology",
    college: {
      _id: "67b0c110e4b0987654321deg",
      collegeName: "NMAM Institute of Technology",
      totalTeams: 1
    },
    createdAt: "2026-08-16T11:15:00.000Z",
    updatedAt: "2026-08-16T11:15:00.000Z"
  },
  {
    _id: "67b0c2a1e4b0123456789abe",
    name: "Ananya Rao",
    email: "ananya@rvce.edu.in",
    role: "user",
    collegeName: "RV College of Engineering",
    college: {
      _id: "67b0c110e4b0987654321deh",
      collegeName: "RV College of Engineering",
      totalTeams: 2
    },
    createdAt: "2026-08-16T12:30:00.000Z",
    updatedAt: "2026-08-16T12:30:00.000Z"
  }
];

export const initialEvents = [
  {
    id: 'EVT-01',
    title: 'CodeFest 2026',
    category: 'Coding & Hackathon',
    fee: '₹ 500',
    maxTeamsPerCollege: 2,
    maxTeamMembers: 4,
    venue: 'Lab 301, Main Block',
    status: 'Active',
    coordinators: ['Havyas', 'Shashidhara']
  },
  {
    id: 'EVT-02',
    title: 'RoboWars Arena',
    category: 'Robotics',
    fee: '₹ 750',
    maxTeamsPerCollege: 2,
    maxTeamMembers: 5,
    venue: 'Auditorium Quadrangle',
    status: 'Active',
    coordinators: ['Swasthik']
  },
  {
    id: 'EVT-03',
    title: 'WebCrafters',
    category: 'Web Development',
    fee: '₹ 400',
    maxTeamsPerCollege: 2,
    maxTeamMembers: 3,
    venue: 'Lab 202',
    status: 'Draft',
    coordinators: ['Hanson', 'Dheemanth']
  }
];

export const initialRegistrations = [
  {
    id: 'REG-892101',
    _id: 'reg_892101',
    collegeName: 'MIT Tech',
    teamName: 'CyberKnights',
    leaderName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 98451 10022',
    event: 'Web Development Hackathon 2026',
    membersCount: 4,
    members: ['Jane Smith (Lead)', 'Rohan Verma', 'Kavya S', 'Aditya Nair'],
    teamsInCollege: 2,
    paymentStatus: 'Pending',
    utr: 'UTR98231049281',
    amount: '₹ 500',
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
    registeredAt: '2026-08-16 10:30 AM'
  },
  {
    id: 'REG-892102',
    _id: 'reg_892102',
    collegeName: 'NMAM Institute of Technology',
    teamName: 'AlgoWizards',
    leaderName: 'Rahul Sharma',
    email: 'rahul@nitte.edu.in',
    phone: '+91 97410 88219',
    event: 'AI Project Showcase 2026',
    membersCount: 3,
    members: ['Rahul Sharma (Lead)', 'Pranav Shenoy', 'Deepa Bhat'],
    teamsInCollege: 1,
    paymentStatus: 'Pending',
    utr: 'UTR19284019283',
    amount: '₹ 750',
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
    registeredAt: '2026-08-16 11:15 AM'
  },
  {
    id: 'REG-892103',
    _id: 'reg_892103',
    collegeName: 'RV College of Engineering',
    teamName: 'MatrixRunners',
    leaderName: 'Ananya Rao',
    email: 'ananya@rvce.edu.in',
    phone: '+91 99002 33411',
    event: 'Gaming Championship 2026',
    membersCount: 4,
    members: ['Ananya Rao (Lead)', 'Varun Gowda', 'Sameer Ali', 'Neha Patil'],
    teamsInCollege: 2,
    paymentStatus: 'Approved',
    utr: 'UTR81920391823',
    amount: '₹ 500',
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
    registeredAt: '2026-08-16 09:00 AM'
  },
  {
    id: 'REG-892104',
    _id: 'reg_892104',
    collegeName: 'BMS College of Engineering',
    teamName: 'ByteBrigade',
    leaderName: 'Kiran Kumar',
    email: 'kiran@bmsce.ac.in',
    phone: '+91 98860 44512',
    event: 'Web Development Hackathon 2026',
    membersCount: 4,
    members: ['Kiran Kumar (Lead)', 'Siddharth M', 'Aishwarya K', 'Tejaswini R'],
    teamsInCollege: 1,
    paymentStatus: 'Approved',
    utr: 'UTR66219044231',
    amount: '₹ 500',
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
    registeredAt: '2026-08-17 02:15 PM'
  },
  {
    id: 'REG-892105',
    _id: 'reg_892105',
    collegeName: 'PES University',
    teamName: 'PES Hackers',
    leaderName: 'Tanmay Joshi',
    email: 'tanmay@pes.edu',
    phone: '+91 96112 55901',
    event: 'Audit Event',
    membersCount: 2,
    members: ['Tanmay Joshi (Lead)', 'Harish Patel'],
    teamsInCollege: 2,
    paymentStatus: 'Approved',
    utr: 'UTR77109283419',
    amount: '₹ 300',
    proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
    registeredAt: '2026-08-18 04:30 PM'
  }
];

export const generateMockJWT = (admin) => {

  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ id: admin._id, email: admin.email, role: admin.role, exp: Date.now() + 86400000 }));
  const signature = btoa("semaphore2026_secret_sig");
  return `${header}.${payload}.${signature}`;
};
