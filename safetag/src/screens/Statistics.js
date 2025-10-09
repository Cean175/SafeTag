import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Statistics.css";

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

function Statistics({ documentationData }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  // --- Example dataset (replace with your Documentation data) ---
  const monthlyCases = [
    { month: "January", January: 3 },
    { month: "February", February: 7 },
    { month: "March", March: 10 },
    { month: "April", April: 20 },
    { month: "May", May: 28 },
    { month: "June", June: 5 },
    { month: "July", July: 2 },
    { month: "August", August: 12 },
    { month: "September", September: 18 },
    { month: "October", October: 20 },
    { month: "November", November: 15 },
    { month: "December", December: 10 },
  ];

  const actionData = [
    { name: "Treatment only", value: 12.5 },
    { name: "Clinic", value: 25 },
    { name: "Hospitalized", value: 62.5 },
  ];

  const COLORS = ["#2563eb", "#10b981", "#facc15"];

  return (
    <div className="statistics-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="branding">
            <h1 className="title">S.A.F.E</h1>
            <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
          </div>

          {/* Nav Icons */}
          <div className="nav-icons">
            <div className="nav-icon" onClick={() => handleNavigation("/home")}>
              <span>🏠</span>
            </div>
            <div className="nav-icon" onClick={() => handleNavigation("/user")}>
              <span>👤</span>
            </div>
            <div
              className="nav-icon active"
              onClick={() => handleNavigation("/statistics")}
            >
              <span>📊</span>
            </div>
            <div
              className="nav-icon"
              onClick={() => handleNavigation("/contact")}
            >
              <span>📞</span>
            </div>
            <div
              className="nav-icon"
              onClick={() => handleNavigation("/settings")}
            >
              <span>⚙️</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filter buttons */}
      <div className="filter-buttons">
        <button className="filter-btn">Generate Reports</button>
        <button className="filter-btn">Cases, Action</button>
        <button className="filter-btn">Ailments, Location</button>
        <button className="filter-btn active">Monthly</button>
        <button className="filter-btn">Weekly</button>
        <button className="filter-btn">Semester</button>
      </div>

      {/* Main Content */}
      <main className="stats-content">
        <div className="chart-card">
          <h2>Cases Monthly</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              layout="vertical"
              data={monthlyCases}
              margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="month" type="category" />
              <Tooltip />
              <Legend />
              {Object.keys(monthlyCases[0])
                .filter((key) => key !== "month")
                .map((key, i) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Action done</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={actionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {actionData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
}

export default Statistics;
