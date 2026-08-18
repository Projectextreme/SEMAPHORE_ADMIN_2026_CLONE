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

export const generateMockJWT = (admin) => {

  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ id: admin._id, email: admin.email, role: admin.role, exp: Date.now() + 86400000 }));
  const signature = btoa("semaphore2026_secret_sig");
  return `${header}.${payload}.${signature}`;
};
