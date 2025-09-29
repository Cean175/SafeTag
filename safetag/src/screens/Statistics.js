import React, { useEffect, useState, useCallback } from "react";
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

// Custom Tooltip component (unchanged)
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Access the data from the payload, which includes the list of dates
        const data = payload[0].payload;
        const dates = data.dates || [];
        return (
            <div className="custom-tooltip" style={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <p className="label" style={{ fontWeight: 'bold' }}>{`${label}: ${data.Cases} Cases`}</p>
                <p className="intro">Dates:</p>
                <ul style={{ paddingLeft: '20px', margin: '0' }}>
                    {/* For Daily view, the tooltip is a bit redundant, but we keep it generic */}
                    {dates.map((date, index) => (
                        <li key={index} style={{ fontSize: '12px', listStyleType: 'disc' }}>{date}</li>
                    ))}
                </ul>
            </div>
        );
    }
    return null;
};

// Helper function to get the start of the week (Monday)
const getStartOfWeek = (date) => {
    const d = new Date(date);
    // Get the day of the week (0 for Sunday, 6 for Saturday)
    const day = d.getDay();
    // Calculate difference to Monday (1)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Helper function to get the week number label for a specific month
const getWeekOfMonthLabel = (date) => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const startOfWeek = getStartOfWeek(date);

    // Calculate the difference in weeks
    // We compare the start of the current week to the start of the month's week
    const weekNumber = Math.ceil(((startOfWeek.getTime() - getStartOfWeek(startOfMonth).getTime()) / 86400000) / 7) + 1;

    // This provides a label like "Week 1", "Week 2", etc.
    return `Week ${weekNumber}`;
};


function Statistics() {
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeFrame, setTimeFrame] = useState('monthly');

    const PIE_COLORS = ["#2563eb", "#10b981", "#facc15", "#ef4444", "#a855f7"];
    const [rawData, setRawData] = useState([]);

    // Function to aggregate data based on time frame (unchanged from last successful update)
    const aggregateCases = useCallback((data, frame) => {
        const aggregatedData = {};
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        if (frame === 'monthly') {
            // Initialize monthlyData based on your provided structure
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
                // Filter: Only include cases from today
                if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
                    key = date.toISOString().split('T')[0]; // YYYY-MM-DD
                    label = "Today";
                } else {
                    return; // Skip non-today entries
                }
            } else if (frame === 'weekly') {
                // Filter: Only include cases from the current month
                if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
                    key = getWeekOfMonthLabel(date); // "Week 1", "Week 2", etc.
                    label = key;
                } else {
                    return; // Skip non-current month entries
                }
            } else if (frame === 'monthly') {
                // All months are included using month name as key/label
                label = months[date.getMonth()];
                key = label; // Use month name as the key
            }

            if (key) {
                // Use label/key for aggregation
                if (!aggregatedData[key]) {
                    // This is mainly for Daily and Weekly aggregation before we order it
                    aggregatedData[key] = { key, label, Cases: 0, dates: [] };
                }
                aggregatedData[key].Cases++;
                aggregatedData[key].dates.push(formattedDate);
            }
        });

        let finalData = Object.values(aggregatedData);

        if (frame === 'daily') {
             // If there's no data for today, show 0
             if (finalData.length === 0) {
                 finalData = [{ key: 'today', label: 'Today', Cases: 0, dates: [] }];
             }
             // Daily view should be sorted for consistency, though there's usually only one item
             return finalData.sort((a, b) => new Date(a.key) - new Date(b.key));
        }

        if (frame === 'weekly') {
            const weeklyOrder = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map(weekLabel => {
                const existing = finalData.find(d => d.label === weekLabel);
                return existing || { key: weekLabel, label: weekLabel, Cases: 0, dates: [] };
            });
            // Filter out empty weeks beyond the current week of the month
            return weeklyOrder.filter(d => d.Cases > 0 || weeklyOrder.indexOf(d) < 4);
        }

        if (frame === 'monthly') {
             // Re-order by month name array, which maintains the January-December order
             const monthlyCasesData = months.map(month => ({
                month, // Use 'month' as the key for Recharts YAxis
                Cases: aggregatedData[month] ? aggregatedData[month].Cases : 0,
                dates: aggregatedData[month] ? aggregatedData[month].dates : [],
                label: month // Keep label for custom tooltip compatibility
            }));
            
            // Set the final data using the new structure
            return monthlyCasesData;
        }

        return finalData;

    }, []);

    // Effect to fetch initial data once (unchanged)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            const { data: documentations, error: fetchError } = await supabase
                .from("documentations")
                .select("incident_date, status");

            if (fetchError) {
                setError("Failed to fetch documentation data.");
                setLoading(false);
                return;
            }

            setRawData(documentations);

            // Status aggregation (unchanged)
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

    // Effect to re-aggregate data when rawData or timeFrame changes (unchanged)
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

    // Function to determine dataKey and layout for the chart
    const getChartProps = () => {
        if (timeFrame === 'daily') {
            return {
                title: "Cases Today",
                layout: "horizontal",
                yKey: "Cases",
                xKey: "label" // "Today"
            };
        }
        if (timeFrame === 'weekly') {
            return {
                title: `Cases in ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                layout: "vertical",
                yKey: "label", // "Week 1", "Week 2", etc.
                xKey: "Cases"
            };
        }
        return { // monthly
            title: "Cases Monthly",
            layout: "vertical",
            yKey: "month", // The key specific to the monthly data structure
            xKey: "Cases"
        };
    };

    const chartProps = getChartProps();

    // -------------------------------------------------------------------
    // NEW: Export and Print Functions
    // -------------------------------------------------------------------

    const handleExport = () => {
        if (!rawData || rawData.length === 0) {
            alert("No data to export.");
            return;
        }

        // Prepare the CSV content based on the raw data (simplest way)
        const headers = ["Incident Date", "Status"];
        const csvContent = rawData.map(doc => 
            `${doc.incident_date || ''},${doc.status || 'Unknown'}`
        ).join('\n');

        const finalCSV = headers.join(',') + '\n' + csvContent;

        // Create a temporary link element to trigger the download
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
        // Simple window print command
        // Note: You may want to add specific print CSS to make the output look better
        window.print();
    };

    // -------------------------------------------------------------------
    // End NEW Functions
    // -------------------------------------------------------------------


    if (loading) {
        return <div className="statistics-container"><h2>Loading statistics...</h2></div>;
    }

    if (error) {
        return <div className="statistics-container"><h2>{error}</h2></div>;
    }

    return (
        <div className="statistics-container">
            {/* Header (omitted for brevity) */}
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

            {/* Filter buttons - ADDED EXPORT AND PRINT BUTTONS */}
            <div className="filter-buttons">
                <button className="filter-btn" onClick={handleExport}>
                    <i className="fas fa-file-csv"></i> Export CSV
                </button>
                <button className="filter-btn" onClick={handlePrint}>
                    <i className="fas fa-print"></i> Print Report
                </button>
                {/* The rest of the original filter buttons */}
                <button className="filter-btn active">Cases by Status</button>
            </div>

            {/* TIME FRAME FILTER BUTTONS (unchanged) */}
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
            {/* END TIME FRAME FILTER BUTTONS */}

            {/* Main Content */}
            <main className="stats-content">
                <div className="chart-card">
                    {/* Use dynamic title */}
                    <h2>{chartProps.title}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            // Use dynamic layout
                            layout={chartProps.layout}
                            data={chartData}
                            margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
                        >
                            {/* XAxis and YAxis change based on layout */}
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