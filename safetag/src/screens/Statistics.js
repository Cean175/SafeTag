import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Statistics.css";
import { supabase } from '../lib/supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

function Statistics() {
  const navigate = useNavigate();
  const [monthlyCases, setMonthlyCases] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PIE_COLORS = ["#2563eb", "#10b981", "#facc15", "#ef4444", "#a855f7"];

  useEffect(() => {
    // Fetch data from Supabase
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      // Fetch data from the 'documentations' table and select 'created_at' and 'status'
      const { data: documentations, error: fetchError } = await supabase
        .from("documentations")
        .select("created_at, status");

      if (fetchError) {
        setError("Failed to fetch documentation data.");
        setLoading(false);
        return;
      }

      // Monthly cases aggregation
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthlyCounts = Array(12).fill(0);
      documentations.forEach((doc) => {
        const date = new Date(doc.created_at);
        const monthIdx = date.getMonth();
        monthlyCounts[monthIdx]++;
      });
      const monthlyCasesData = months.map((month, idx) => ({
        month,
        Cases: monthlyCounts[idx],
      }));
      setMonthlyCases(monthlyCasesData);

      // Status aggregation (replaces 'Action done' aggregation)
      const statusMap = {};
      documentations.forEach((doc) => {
        const status = doc.status || "Unknown";
        statusMap[status] = (statusMap[status] || 0) + 1;
      });
      const statusDataArr = Object.entries(statusMap).map(([name, value]) => ({
        name,
        value,
      }));
      setStatusData(statusDataArr);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (loading) {
    return <div className="statistics-container"><h2>Loading statistics...</h2></div>;
  }

  if (error) {
    return <div className="statistics-container"><h2>{error}</h2></div>;
  }

  return (
    <div className="statistics-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">S.A.F.E</h1>
            <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
          </div>
          <div className="nav-icons">
            <div className="nav-icon active" onClick={() => handleNavigation('/home')}>
              <i className="fas fa-home"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/user')}>
              <i className="fas fa-user"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/statistics')}>
              <i className="fas fa-chart-bar"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/contact')}>
              <i className="fas fa-phone"></i>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation('/settings')}>
              <i className="fas fa-cog"></i>
            </div>
          </div>
        </div>
      </header>

      {/* Filter buttons */}
      <div className="filter-buttons">
        <button className="filter-btn">Generate Reports</button>
        <button className="filter-btn active">Cases by Status</button>
        <button className="filter-btn">Ailments, Location</button>
        <button className="filter-btn">Monthly</button>
        <button className="filter-btn">Weekly</button>
        <button className="filter-btn">Semester</button>
      </div>

      {/* Main Content */}
      <main className="stats-content">
        <div className="chart-card">
          <h2>Cases Monthly</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlyCases}
              margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
            >
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="Cases"
                fill="#2563eb"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Cases by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}

export default Statistics;