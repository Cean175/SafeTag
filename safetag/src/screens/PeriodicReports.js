import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, fetchStudents } from '../lib/supabaseClient';
import '../css/SharedBase.css';
import '../css/PeriodicReports.css';
import '../css/PeriodicReportsUI.css';
import BrandLogos from '../components/BrandLogos';

function PeriodicReports() {
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [reportType, setReportType] = useState('incidents'); // 'incidents' or 'students'
    const [groupBy, setGroupBy] = useState('time'); // 'time', 'category', 'action' (only for incidents)
    const [periodType, setPeriodType] = useState('monthly'); // monthly, weekly, yearly (only for incidents + time group)
    
    const [groupedDocs, setGroupedDocs] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        fetchData();
    }, [reportType]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (reportType === 'incidents') {
                const { data, error } = await supabase
                    .from('documentations')
                    .select('*')
                    .order('incident_date', { ascending: false });
                
                if (error) throw error;
                setDocs(data || []);
            } else if (reportType === 'students') {
                // Fetch students
                const data = await fetchStudents();
                setStudents(data || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const getWeekNumber = (d) => {
        // Copy date so don't modify original
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        // Get first day of year
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    };

    useEffect(() => {
        if (reportType === 'students') {
            if (!students.length) {
                setGroupedDocs({});
                return;
            }
            // For students, just one big group or group by Level if preferred.
            // Let's group by "All Registered Students" for now, or maybe by Level if meaningful.
            // Let's try grouping by Level/YearLevel.
            const groups = {};
            students.forEach(s => {
                const level = s.level || s.yearLevel || 'Unspecified Level';
                if (!groups[level]) groups[level] = [];
                groups[level].push(s);
            });
            setGroupedDocs(groups);
            return;
        }

        // reportType === 'incidents'
        if (!docs.length) {
            setGroupedDocs({});
            return;
        }

        const groups = {};

        docs.forEach(doc => {
            let key = 'Others';

            if (groupBy === 'time') {
                if (!doc.incident_date) return;
                const date = new Date(doc.incident_date);
                if (periodType === 'monthly') {
                    key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                } else if (periodType === 'yearly') {
                    key = date.getFullYear().toString();
                } else if (periodType === 'weekly') {
                    const year = date.getFullYear();
                    const week = getWeekNumber(date);
                    key = `Week ${week}, ${year}`;
                }
            } else if (groupBy === 'category') {
                key = doc.medical_condition || 'Unspecified Condition';
            } else if (groupBy === 'action') {
                key = doc.status || 'No Status Recorded';
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(doc);
        });

        setGroupedDocs(groups);
    }, [docs, students, periodType, groupBy, reportType]);

    const sortedGroupKeys = useMemo(() => {
        const keys = Object.keys(groupedDocs);
        if (reportType === 'students') {
             return keys.sort(); // Alphabetical for levels
        }
        if (groupBy === 'time') {
             // Try to keep descending logic roughly
             return keys.sort((a, b) => b.localeCompare(a));
        }
        // For categories/actions, maybe alphabetical or by count?
        // Let's sort by Count Descending
        return keys.sort((a, b) => groupedDocs[b].length - groupedDocs[a].length);
    }, [groupedDocs, reportType, groupBy]);

    const toggleGroup = (key) => {
        setExpandedGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const exportToCSV = (dataToExport, filename) => {
        if (!dataToExport || !dataToExport.length) return;

        let headers = [];
        let rowMapper = null;

        if (reportType === 'students') {
            headers = ['Name', 'Student ID', 'Sex', 'Age', 'Level', 'Condition'];
            rowMapper = (row) => [
                row.name,
                row.student_id || row.id,
                row.sex,
                row.age,
                row.level || row.yearLevel,
                row.health_condition
            ];
        } else {
            // Incidents
            headers = ['Date', 'Time', 'Student Name', 'Student ID', 'Age', 'Level', 'Condition', 'Status', 'Description', 'Location'];
            rowMapper = (row) => [
                row.incident_date,
                row.incident_time,
                row.student_name,
                row.student_id,
                row.age,
                row.student_lvl,
                row.medical_condition,
                row.status,
                row.description,
                row.location
            ];
        }
        
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(row => {
                const clean = (text) => `"${(text || '').toString().replace(/"/g, '""')}"`;
                return rowMapper(row).map(clean).join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename || 'export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportGroup = (e, groupKey) => {
        e.stopPropagation();
        const groupData = groupedDocs[groupKey];
        if (groupData) {
            exportToCSV(groupData, `SafeTag_${reportType}_${groupKey.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
        }
    };

    const handleExportAll = () => {
        const data = reportType === 'students' ? students : docs;
        exportToCSV(data, `SafeTag_All_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className="reports-container unique-reports-page">
            <header className="header">
                <div className="header-content">
                    <div className="branding">
                         <div className="title-row">
                            <h1 className="title">S.A.F.E</h1>
                            <BrandLogos />
                        </div>
                        <p className="subtitle">STUDENT ASSISTANCE FOR EMERGENCIES</p>
                    </div>
                     <div className="nav-icons">
                        <div className="nav-icon" onClick={() => handleNavigation('/home')}>
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
            
            <main className="main-content reports-content">
                <div className="reports-page-header">
                    <h2 className="reports-title">Periodic Incident Reports</h2>
                    
                    <div className="reports-toolbar">
                        <div className="period-selector">
                            <button 
                                className={`period-btn ${periodType === 'weekly' ? 'active' : ''}`}
                                onClick={() => setPeriodType('weekly')}
                            >
                                Weekly
                            </button>
                            <button 
                                className={`period-btn ${periodType === 'monthly' ? 'active' : ''}`}
                                onClick={() => setPeriodType('monthly')}
                            >
                                Monthly
                            </button>
                            <button 
                                className={`period-btn ${periodType === 'yearly' ? 'active' : ''}`}
                                onClick={() => setPeriodType('yearly')}
                            >
                                Yearly
                            </button>
                        </div>

                        <button 
                            className="export-all-btn" 
                            onClick={handleExportAll}
                        >
                            <i className="fas fa-file-export"></i> Export All Records
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Loading records...</div>
                ) : (
                    <div className="reports-groups">
                        {sortedGroupKeys.length === 0 ? (
                            <div className="no-records">No records found.</div>
                        ) : (
                            sortedGroupKeys.map(groupKey => (
                                <div key={groupKey} className="report-group-card">
                                    <div 
                                        className="group-header" 
                                        onClick={() => toggleGroup(groupKey)}
                                    >
                                        <div className="group-title">
                                            <i className="fas fa-calendar-alt"></i>
                                            {groupKey}
                                            <span className="count-badge">
                                                {groupedDocs[groupKey].length} incidents
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <button 
                                                className="group-export-btn"
                                                onClick={(e) => handleExportGroup(e, groupKey)}
                                                title="Export this list"
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    padding: '4px 8px',
                                                    cursor: 'pointer',
                                                    color: '#666',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                <i className="fas fa-download"></i> Export
                                            </button>
                                            <div className={`chevron ${expandedGroups[groupKey] ? 'expanded' : ''}`}>
                                                <i className="fas fa-chevron-down"></i>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {expandedGroups[groupKey] && (
                                        <div className="group-list table-responsive">
                                            <table className="reports-table">
                                                <thead>
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Student</th>
                                                        <th>Condition</th>
                                                        <th>Status</th>
                                                        <th>Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {groupedDocs[groupKey].map(doc => (
                                                        <tr key={doc.id}>
                                                            <td className="col-date">
                                                                {new Date(doc.incident_date).toLocaleDateString()}
                                                            </td>
                                                            <td className="col-student">
                                                                <div><strong>{doc.student_name}</strong></div>
                                                                <div className="sub-text">{doc.student_id}</div>
                                                            </td>
                                                            <td className="col-condition">{doc.medical_condition}</td>
                                                            <td className="col-status">
                                                                <span className={`report-status status-${(doc.status || '').toLowerCase().replace(' ', '-')}`}>
                                                                    {doc.status}
                                                                </span>
                                                            </td>
                                                            <td className="col-desc">{doc.description}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default PeriodicReports;
