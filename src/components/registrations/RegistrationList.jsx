import { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  CheckCircle2,
  Filter
} from 'lucide-react';
import './RegistrationList.css';

export const RegistrationList = () => {
  const [registrations, setRegistrations] = useState([
    {
      id: 'REG-2026-01',
      collegeName: 'MIT Tech',
      teamName: 'CyberKnights',
      leaderName: 'Jane Smith',
      email: 'jane@example.com',
      event: 'CodeFest Hackathon',
      membersCount: 4,
      teamsInCollege: 2,
      paymentStatus: 'Approved',
      registeredAt: '2026-08-16 10:00'
    },
    {
      id: 'REG-2026-02',
      collegeName: 'NMAM Institute of Technology',
      teamName: 'AlgoWizards',
      leaderName: 'Rahul Sharma',
      email: 'rahul@nitte.edu.in',
      event: 'RoboWars',
      membersCount: 3,
      teamsInCollege: 1,
      paymentStatus: 'Pending',
      registeredAt: '2026-08-16 11:15'
    },
    {
      id: 'REG-2026-03',
      collegeName: 'RV College of Engineering',
      teamName: 'MatrixRunners',
      leaderName: 'Ananya Rao',
      email: 'ananya@rvce.edu.in',
      event: 'WebCrafters',
      membersCount: 2,
      teamsInCollege: 2,
      paymentStatus: 'Approved',
      registeredAt: '2026-08-16 12:30'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const colleges = ['All', ...new Set(registrations.map((r) => r.collegeName))];

  const handleExportCSV = () => {
    const headers = ['Registration ID,College Name,Team Name,Leader Name,Email,Event,Members,Payment Status,Date\n'];
    const rows = filteredRegistrations.map(r =>
      `"${r.id}","${r.collegeName}","${r.teamName}","${r.leaderName}","${r.email}","${r.event}",${r.membersCount},"${r.paymentStatus}","${r.registeredAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Semaphore_Registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesCollege = selectedCollege === 'All' || r.collegeName === selectedCollege;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.teamName.toLowerCase().includes(term) ||
      r.leaderName.toLowerCase().includes(term) ||
      r.collegeName.toLowerCase().includes(term) ||
      r.id.toLowerCase().includes(term);
    return matchesCollege && matchesSearch;
  });

  return (
    <div className="registrations-container">
      {/* Title */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <FileSpreadsheet className="title-icon" /> Team Registrations & College Quotas
          </h2>
          <p className="page-description">
            Audit team rosters, monitor the strict 2 teams per college quota policy, and export data summaries.
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-primary">
          <Download size={15} /> Export CSV Report
        </button>
      </div>

      {/* CSV Download Toast */}
      {downloadSuccess && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>Registrations CSV report generated and downloaded successfully!</span>
        </div>
      )}

      {/* College Rule Banner */}
      <div className="college-rule-alert">
        <AlertTriangle size={18} className="alert-rule-icon" />
        <div className="rule-text">
          <strong>College Quota Rule:</strong> Maximum 2 teams per affiliated institution permitted initially.
          Colleges reaching 2 teams are flagged as <em>Quota Reached (2/2)</em>.
        </div>
      </div>

      {/* Filters Card */}
      <div className="card filter-card">
        <div className="filter-row">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={15} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by team name, leader, or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="college-filter-wrapper">
            <Building2 size={15} className="filter-icon" />
            <select
              className="form-select select-compact"
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
            >
              {colleges.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Colleges' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="table-responsive">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>REG ID</th>
                <th>COLLEGE NAME</th>
                <th>TEAM NAME</th>
                <th>LEADER DETAILS</th>
                <th>EVENT</th>
                <th>MEMBERS</th>
                <th>QUOTA STATUS</th>
                <th>PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id}>
                  <td className="code-font">{reg.id}</td>
                  <td className="font-semibold college-col">
                    <span className="college-cell-name">{reg.collegeName}</span>
                  </td>
                  <td>
                    <strong className="team-highlight">{reg.teamName}</strong>
                  </td>
                  <td>
                    <div className="leader-info">
                      <span className="leader-name">{reg.leaderName}</span>
                      <span className="email-sub">{reg.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="event-tag">{reg.event}</span>
                  </td>
                  <td className="text-center font-bold">{reg.membersCount}</td>
                  <td>
                    <span
                      className={`quota-badge ${
                        reg.teamsInCollege >= 2 ? 'quota-full' : 'quota-ok'
                      }`}
                    >
                      {reg.teamsInCollege >= 2 ? (
                        <>
                          <CheckCircle size={11} /> 2/2 Reached
                        </>
                      ) : (
                        `1 / 2 Slots`
                      )}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${reg.paymentStatus.toLowerCase()}`}
                    >
                      {reg.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
