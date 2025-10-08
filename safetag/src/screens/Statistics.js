import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Statistics.css";
import { supabase } from '../lib/supabaseClient';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

// Custom Tooltip component (unchanged)
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const dates = data.dates || [];
        return (
            <div className="custom-tooltip" style={{
                backgroundColor: '#fff', border: '1px solid #ccc',
                padding: '10px', borderRadius: '5px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <p className="label" style={{ fontWeight: 'bold' }}>{`${label}: ${data.Cases} Cases`}</p>
                <p className="intro">Dates:</p>
                <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    {dates.map((date, index) => (
                        <li key={index} style={{ fontSize: '12px', listStyleType: 'disc' }}>{date}</li>
                    ))}
                </ul>
            </div>
        );
    }
    return null;
};

// Helper functions (getStartOfWeek, getWeekOfMonthLabel) remain unchanged
const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getWeekOfMonthLabel = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const startOfWeek = getStartOfWeek(date);
    const weekNumber = Math.ceil(((startOfWeek.getTime() - getStartOfWeek(startOfMonth).getTime()) / 86400000) / 7) + 1;
    return `Week ${weekNumber}`;
};


function Statistics() {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFrame, setTimeFrame] = useState('monthly');
    const [rawData, setRawData] = useState([]);
    const PIE_COLORS = ["#2563eb", "#10b981", "#facc15", "#ef4444", "#a855f7"];

    // aggregateCases function remains unchanged
    const aggregateCases = useCallback((data, frame) => {
        const aggregatedData = {};
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        if (frame === 'monthly') {
            months.forEach(month => {
                aggregatedData[month] = { label: month, Cases: 0, dates: [] };
            });
        }
        
        data.forEach((doc) => {
            const date = new Date(doc.incident_date);
            let key = '';
            let label = '';
            const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            if (frame === 'daily') {
                if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
                    key = date.toISOString().split('T')[0];
                    label = "Today";
                } else { return; }
            } else if (frame === 'weekly') {
                if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                    key = getWeekOfMonthLabel(date);
                    label = key;
                } else { return; }
            } else if (frame === 'monthly') {
                label = months[date.getMonth()];
                key = label;
            }

            if (key) {
                if (!aggregatedData[key]) {
                    aggregatedData[key] = { key, label, Cases: 0, dates: [] };
                }
                aggregatedData[key].Cases++;
                aggregatedData[key].dates.push(formattedDate);
            }
        });

        let finalData = Object.values(aggregatedData);

        if (frame === 'daily') {
            if (finalData.length === 0) {
                finalData = [{ key: 'today', label: 'Today', Cases: 0, dates: [] }];
            }
            return finalData.sort((a, b) => new Date(a.key) - new Date(b.key));
        }

        if (frame === 'weekly') {
            const weeklyOrder = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map(weekLabel => {
                const existing = finalData.find(d => d.label === weekLabel);
                return existing || { key: weekLabel, label: weekLabel, Cases: 0, dates: [] };
            });
            return weeklyOrder.filter(d => d.Cases > 0 || weeklyOrder.indexOf(d) < 4);
        }

        if (frame === 'monthly') {
            const monthlyCasesData = months.map(month => ({
                month,
                Cases: aggregatedData[month] ? aggregatedData[month].Cases : 0,
                dates: aggregatedData[month] ? aggregatedData[month].dates : [],
                label: month
            }));
            return monthlyCasesData;
        }

        return finalData;
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            const { data: documentations, error: fetchError } = await supabase
                .from("documentations")
                .select("*");

            if (fetchError) {
                setError("Failed to fetch documentation data.");
                setLoading(false);
                return;
            }

            setRawData(documentations);

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

        fetchInitialData();
    }, []);

    // Update statusData (pie chart) based on selected timeFrame
    const filterByTimeFrame = (data, frame) => {
        if (!data) return [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        if (frame === 'daily') {
            return data.filter(doc => {
                if (!doc.incident_date) return false;
                const d = new Date(doc.incident_date);
                return d.toISOString().split('T')[0] === today.toISOString().split('T')[0];
            });
        }

        if (frame === 'weekly') {
            // For weekly view we consider entries in the current month (consistent with bar weekly aggregation)
            return data.filter(doc => {
                if (!doc.incident_date) return false;
                const d = new Date(doc.incident_date);
                return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
            });
        }

        // monthly (default): include all data
        return data;
    };

    useEffect(() => {
        const filtered = filterByTimeFrame(rawData, timeFrame);
        const map = {};
        (filtered || []).forEach(doc => {
            const status = doc.status || 'Unknown';
            map[status] = (map[status] || 0) + 1;
        });
        const arr = Object.entries(map).map(([name, value]) => ({ name, value }));
        setStatusData(arr);
    }, [rawData, timeFrame]);

    useEffect(() => {
        if (rawData.length > 0 || timeFrame === 'daily') {
            const aggregated = aggregateCases(rawData, timeFrame);
            setChartData(aggregated);
        } else if (!loading && !error) {
            setChartData([]);
        }
    }, [rawData, timeFrame, loading, error, aggregateCases]);

    const handleNavigation = (path) => {
        navigate(path);
    };

    const getChartProps = () => {
        if (timeFrame === 'daily') {
            return { title: "Cases Today", layout: "horizontal", yKey: "Cases", xKey: "label" };
        }
        if (timeFrame === 'weekly') {
            return { title: `Cases in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, layout: "vertical", yKey: "label", xKey: "Cases" };
        }
        return { title: "Cases Monthly", layout: "vertical", yKey: "month", xKey: "Cases" };
    };

    const chartProps = getChartProps();

    const sanitizeCSVField = (field) => {
        const str = String(field || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const handleExport = () => {
        if (!rawData || rawData.length === 0) {
            alert("No data to export.");
            return;
        }

        // Updated Headers
        const headers = [
            "ID", "Student ID", "Name", "Age", "Level", 
            "Incident Date", "Status", // Added here
            "Medical Condition", "Created At"
        ];
        
        // Updated Row Data
        const csvContent = rawData.map(doc => {
            const row = [
                doc.id,                
                doc.student_id,        
                doc.student_name,      
                doc.age,               
                doc.student_lvl,       
                doc.incident_date,  
                doc.status,         
                doc.medical_condition,         
                doc.created_at         
            ];
            return row.map(sanitizeCSVField).join(',');
        }).join('\n');

        const finalCSV = headers.join(',') + '\n' + csvContent;

        const blob = new Blob([finalCSV], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `SAFE_Statistics_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="statistics-container"><h2>Loading statistics...</h2></div>;
    }

    if (error) {
        return <div className="statistics-container"><h2>{error}</h2></div>;
    }

    return (
        <div className="statistics-container">
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

            <div className="filter-buttons">
                <button className="filter-btn" onClick={handleExport}>
                    <i className="fas fa-file-csv"></i> Export CSV
                </button>
                <button className="filter-btn" onClick={handlePrint}>
                    <i className="fas fa-print"></i> Print Report
                </button>
                <button className="filter-btn active">Cases by Status</button>
            </div>

            <div className="time-frame-filters">
                <button
                    className={`time-frame-btn ${timeFrame === 'daily' ? 'active-time-frame' : ''}`}
                    onClick={() => setTimeFrame('daily')}
                >
                    Daily
                </button>
                <button
                    className={`time-frame-btn ${timeFrame === 'weekly' ? 'active-time-frame' : ''}`}
                    onClick={() => setTimeFrame('weekly')}
                >
                    Weekly
                </button>
                <button
                    className={`time-frame-btn ${timeFrame === 'monthly' ? 'active-time-frame' : ''}`}
                    onClick={() => setTimeFrame('monthly')}
                >
                    Monthly
                </button>
            </div>
            
            <main className="stats-content">
                <div className="chart-card">
                    <h2>{chartProps.title}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            layout={chartProps.layout}
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
                        >
                            {chartProps.layout === 'vertical' ? (
                                <>
                                    <XAxis type="number" dataKey="Cases" />
                                    <YAxis type="category" dataKey={chartProps.yKey} interval={0} />
                                </>
                            ) : (
                                <>
                                    <XAxis type="category" dataKey={chartProps.xKey} />
                                    <YAxis type="number" dataKey="Cases" />
                                </>
                            )}
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Cases" fill="#2563eb" />
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