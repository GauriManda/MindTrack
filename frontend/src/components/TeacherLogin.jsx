// TeacherLogin.jsx - Fixed Teacher Portal with Working Test System
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import DysgraphiaTest from "./DysgraphiaTest";
import Footer from "./Footer";
import axios from "axios";

const TeacherLogin = () => {
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [teacherData, setTeacherData] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isRegistering, setIsRegistering] = useState(false);
  const [children, setChildren] = useState([]);
  const [teacherChildren, setTeacherChildren] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [selectedChildForTest, setSelectedChildForTest] = useState(null);
  const [childTestReports, setChildTestReports] = useState([]);
  
  // Registration form states
  const [regData, setRegData] = useState({
    teacherName: "",
    email: "",
    school: "",
    password: "",
    confirmPassword: ""
  });
  // Problem reporting states
  const [problemData, setProblemData] = useState({
    childId: "",
    childName: "",
    problemType: "",
    severity: "",
    description: ""
  });

  const [reportedProblems, setReportedProblems] = useState([]);
  
  const navigate = useNavigate();

  // Fetch all data when teacher logs in
  useEffect(() => {
    if (teacherData) {
      fetchChildrenData();
      fetchDashboardStats();
      fetchChildTestReports();
    }
  }, [teacherData]);

  const fetchChildrenData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/children-by-teacher/${teacherData.teacherId}`);
      if (response.data.success) {
        setTeacherChildren(response.data.children);
      }
    } catch (err) {
      console.error("Error fetching teacher children:", err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/dashboard-stats/${teacherData.teacherId}`);
      if (response.data.success) {
        setDashboardStats(response.data.stats);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      // If API doesn't exist, calculate basic stats from teacherChildren
      if (teacherChildren.length > 0) {
        const basicStats = {
          totalChildren: teacherChildren.length,
          childrenWithTests: teacherChildren.filter(child => child.testResults && child.testResults.length > 0).length,
          dysgraphicResults: teacherChildren.filter(child => child.lastTestResult === 'Dysgraphic').length,
          recentRegistrations: teacherChildren.filter(child => {
            const regDate = new Date(child.registrationDate);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return regDate > weekAgo;
          }).length
        };
        setDashboardStats(basicStats);
      }
    }
  };
  

  const fetchChildTestReports = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/child-test-reports/${teacherData.teacherId}`);
      if (response.data.success) {
        setChildTestReports(response.data.reports);
      }
    } catch (err) {
      console.error("Error fetching child test reports:", err);
      // If API doesn't exist, create reports from children data
      const reports = [];
      teacherChildren.forEach(child => {
        if (child.testResults && child.testResults.length > 0) {
          child.testResults.forEach(test => {
            reports.push({
              childId: child.childId,
              childName: child.childName,
              testDate: test.testDate,
              result: test.result,
              score: test.score,
              status: 'Completed'
            });
          });
        }
      });
      setChildTestReports(reports);
    }
  };

  const fetchReportedProblems = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/teacher-reports/${teacherData.teacherId}`);
      if (response.data.success) {
        setReportedProblems(response.data.reports);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    console.log("Starting registration process...");
    
    if (!regData.teacherName || !regData.school) {
      setError("Please fill in all required fields.");
      return;
    }
    
    if (!regData.password || !regData.confirmPassword) {
      setError("Please enter and confirm your password.");
      return;
    }
    
    if (regData.password !== regData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const timestamp = Date.now();
      const generatedTeacherId = `T${timestamp.toString().slice(-6)}`;

      const registrationData = {
        teacherId: generatedTeacherId,
        teacherName: regData.teacherName,
        email: regData.email,
        school: regData.school,
        password: regData.password
      };

      console.log("Sending registration data:", registrationData);
      console.log("Making request to: http://localhost:5000/api/teacher-register");

      const response = await axios.post(
        "http://localhost:5000/api/teacher-register",
        registrationData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        }
      );

      console.log("Response received:", response);

      if (response.data.success) {
        setSuccess(`Registration successful! Your Teacher ID is: ${generatedTeacherId}. Please save this ID for future login.`);
        setRegData({
          teacherName: "",
          email: "",
          school: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        setError(response.data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        response: err.response,
        request: err.request
      });
      
      if (err.response) {
        setError(err.response.data.message || "Server error occurred.");
      } else if (err.request) {
        setError("Network error: Unable to reach server. Make sure your backend is running on port 5000.");
      } else if (err.code === 'ECONNABORTED') {
        setError("Request timeout: The server is taking too long to respond. Please try again.");
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    console.log("Starting login process...");
    
    if (!teacherId || !password) {
      setError("Please enter your Teacher ID and password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setTeacherData(null);

    try {
      const loginData = { teacherId, password };
      
      console.log("Sending login data:", { teacherId, password: "***" });
      console.log("Making request to: http://localhost:5000/api/teacher-login");

      const response = await axios.post(
        "http://localhost:5000/api/teacher-login",
        loginData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        }
      );

      console.log("Login response received:", response);

      if (response.data.success) {
        setTeacherData(response.data);
        setSuccess("Login successful!");
      } else {
        setError(response.data.message || "Invalid Teacher ID or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Login error details:", {
        message: err.message,
        code: err.code,
        response: err.response,
        request: err.request
      });
      
      if (err.response) {
        setError(err.response.data.message || "Server error occurred.");
      } else if (err.request) {
        setError("Network error: Unable to reach server.");
      } else if (err.code === 'ECONNABORTED') {
        setError("Request timeout: The server is taking too long to respond. Please try again.");
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProblemReport = async (e) => {
    e.preventDefault();
    
    console.log("Starting problem report submission...");
    
    if (!problemData.childId || !problemData.problemType || !problemData.description) {
      setError("Please fill in all required fields for the problem report.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const reportData = {
        ...problemData,
        teacherId: teacherData.teacherId,
        teacherName: teacherData.teacherName,
        reportDate: new Date().toISOString(),
        status: "New"
      };

      console.log("Sending problem report:", reportData);

      const response = await axios.post(
        "http://localhost:5000/api/report-problem",
        reportData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        }
      );

      console.log("Problem report response:", response);

      if (response.data.success) {
        setSuccess("Problem report submitted successfully!");
        setProblemData({
          childId: "",
          childName: "",
          problemType: "",
          severity: "",
          description: ""
        });
        fetchReportedProblems(); // Refresh the reports list
      } else {
        setError(response.data.message || "Failed to submit problem report.");
      }
    } catch (err) {
      console.error("Problem report error:", err);
      if (err.code === 'ECONNABORTED') {
        setError("Request timeout: The server is taking too long to respond. Please try again.");
      } else {
        setError("Error submitting problem report.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setTeacherId("");
    setPassword("");
    setTeacherData(null);
    setError("");
    setSuccess("");
    setActiveTab("dashboard");
    setIsRegistering(false);
    setChildren([]);
    setReportedProblems([]);
    setSelectedChildForTest(null);
    setChildTestReports([]);
  };

  const switchToLogin = () => {
    setIsRegistering(false);
    setError("");
    setSuccess("");
    setPassword("");
  };

  const switchToRegister = () => {
    setIsRegistering(true);
    setError("");
    setSuccess("");
    setTeacherId("");
    setPassword("");
  };

  const handleRegInputChange = (field, value) => {
    setRegData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProblemInputChange = (field, value) => {
    setProblemData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-fill child name when child ID is selected
    if (field === "childId") {
      const child = children.find(c => c.childId === value);
      if (child) {
        setProblemData(prev => ({
          ...prev,
          childName: child.childName
        }));
      }
    }
  };

  // Function to handle new test for existing child
 const handleNewTestForChild = (child) => {
  console.log("Starting retest for child:", child);
  console.log("Current teacherData:", teacherData);
  
  // Pass teacherData as backup within the child object
  setSelectedChildForTest({
    ...child,
    isRetest: true,
    _teacherData: teacherData // Backup teacher data
  });
  setActiveTab("test");
};

  // Function to refresh data after test completion
  const handleTestComplete = () => {
    fetchChildrenData();
    fetchDashboardStats();
    fetchChildTestReports();
    setSelectedChildForTest(null);
  };

  // Enhanced UI styles
  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f0f2f5",
      minHeight: "100vh",
      padding: "20px"
    },
    loginCard: {
      maxWidth: "450px",
      margin: "80px auto",
      padding: "40px",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e1e8ed"
    },
    dashboardContainer: {
      maxWidth: "1400px",
      margin: "0 auto",
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
    },
    header: {
      backgroundColor: "#ffffff",
      color: "#333333",
      padding: "30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid #e1e8ed"
    },
    tabNavigation: {
      display: "flex",
      backgroundColor: "#f8f9fa",
      borderBottom: "1px solid #e1e8ed"
    },
    tab: {
      padding: "15px 25px",
      cursor: "pointer",
      border: "none",
      backgroundColor: "transparent",
      fontSize: "14px",
      fontWeight: "500",
      color: "#6c757d",
      borderBottomWidth: "3px",
      borderBottomStyle: "solid",
      borderBottomColor: "transparent",
      transition: "all 0.3s ease"
    },
    activeTab: {
      color: "#28a745",
      borderBottomColor: "#28a745",
      backgroundColor: "#ffffff"
    },
    tabContent: {
      padding: "30px"
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "20px",
      border: "1px solid #e1e8ed",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
    },
    button: {
      padding: "12px 24px",
      borderRadius: "8px",
      border: "none",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontSize: "14px"
    },
    primaryButton: {
      backgroundColor: "#28a745",
      color: "white"
    },
    secondaryButton: {
      backgroundColor: "#6c757d",
      color: "white"
    },
    input: {
      width: "100%",
      padding: "14px",
      borderRadius: "8px",
      border: "2px solid #e1e8ed",
      fontSize: "16px",
      transition: "border-color 0.3s ease",
      backgroundColor: "#ffffff",
      boxSizing: "border-box"
    },
    textarea: {
      width: "100%",
      padding: "14px",
      borderRadius: "8px",
      border: "2px solid #e1e8ed",
      fontSize: "16px",
      transition: "border-color 0.3s ease",
      backgroundColor: "#ffffff",
      boxSizing: "border-box",
      minHeight: "100px",
      resize: "vertical"
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: "#495057"
    },
    errorAlert: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #f5c6cb",
      marginBottom: "20px"
    },
    successAlert: {
      backgroundColor: "#d4edda",
      color: "#155724",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #c3e6cb",
      marginBottom: "20px"
    }
  };

  const renderRegistrationForm = () => (
    <form onSubmit={handleRegistration}>
      <div style={{marginBottom: "20px"}}>
        <label htmlFor="teacherName" style={styles.label}>
          Teacher Name *
        </label>
        <input
          type="text"
          id="teacherName"
          value={regData.teacherName}
          onChange={(e) => handleRegInputChange("teacherName", e.target.value)}
          placeholder="Enter your full name"
          style={styles.input}
          required
        />
      </div>
      
      <div style={{marginBottom: "20px"}}>
        <label htmlFor="email" style={styles.label}>
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={regData.email}
          onChange={(e) => handleRegInputChange("email", e.target.value)}
          placeholder="Enter your email"
          style={styles.input}
        />
      </div>

      <div style={{marginBottom: "20px"}}>
        <label htmlFor="school" style={styles.label}>
          School Name *
        </label>
        <input
          type="text"
          id="school"
          value={regData.school}
          onChange={(e) => handleRegInputChange("school", e.target.value)}
          placeholder="Enter school name"
          style={styles.input}
          required
        />
      </div>

      <div style={{marginBottom: "20px"}}>
        <label htmlFor="password" style={styles.label}>
          Password *
        </label>
        <input
          type="password"
          id="password"
          value={regData.password}
          onChange={(e) => handleRegInputChange("password", e.target.value)}
          placeholder="Create a password"
          style={styles.input}
          required
        />
      </div>
      
      <div style={{marginBottom: "20px"}}>
        <label htmlFor="confirmPassword" style={styles.label}>
          Confirm Password *
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={regData.confirmPassword}
          onChange={(e) => handleRegInputChange("confirmPassword", e.target.value)}
          placeholder="Confirm your password"
          style={styles.input}
          required
        />
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div style={styles.successAlert}>
          <strong>Success:</strong> {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          ...styles.button,
          ...styles.primaryButton,
          width: "100%",
          fontSize: "16px",
          padding: "14px",
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? "Creating Account..." : "Create Teacher Account"}
      </button>

      <div style={{textAlign: "center", marginTop: "20px"}}>
        <button
          type="button"
          onClick={switchToLogin}
          style={{
            ...styles.button,
            backgroundColor: "transparent",
            color: "#28a745",
            border: "none",
            textDecoration: "underline",
            fontSize: "14px"
          }}
        >
          Already have an account? Sign in here
        </button>
      </div>
    </form>
  );

  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <div style={{marginBottom: "25px"}}>
        <label htmlFor="teacherId" style={styles.label}>
          Teacher ID
        </label>
        <input
          type="text"
          id="teacherId"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          placeholder="Enter your unique Teacher ID"
          style={styles.input}
        />
      </div>

      <div style={{marginBottom: "25px"}}>
        <label htmlFor="password" style={styles.label}>
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={styles.input}
        />
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div style={styles.successAlert}>
          <strong>Success:</strong> {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          ...styles.button,
          ...styles.primaryButton,
          width: "100%",
          fontSize: "16px",
          padding: "14px",
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? "Authenticating..." : "Access Teacher Portal"}
      </button>

      <div style={{textAlign: "center", marginTop: "20px"}}>
        <button
          type="button"
          onClick={switchToRegister}
          style={{
            ...styles.button,
            backgroundColor: "transparent",
            color: "#28a745",
            border: "none",
            textDecoration: "underline",
            fontSize: "14px"
          }}
        >
          Don't have an account? Register here
        </button>
      </div>
    </form>
  );

  const renderDashboard = () => (
    <div>
      <div style={styles.card}>
        <h3 style={{ color: "#333", marginBottom: "10px", fontSize: "24px" }}>
          Welcome back, {teacherData.teacherName}!
        </h3>
        <p style={{ color: "#6c757d", margin: "0", fontSize: "16px" }}>
          Manage student assessments and register new children from {teacherData.school}.
        </p>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px"}}>
        <div style={{...styles.card, backgroundColor: "#e8f5e8", textAlign: "center"}}>
          <div style={{fontSize: "32px", color: "#388e3c", marginBottom: "10px"}}>👥</div>
          <h4 style={{margin: "0 0 5px 0", color: "#388e3c"}}>Total Children</h4>
          <p style={{margin: "0", fontSize: "18px", fontWeight: "bold"}}>
            {dashboardStats.totalChildren || teacherChildren.length || 0}
          </p>
        </div>
        
        <div style={{...styles.card, backgroundColor: "#e3f2fd", textAlign: "center"}}>
          <div style={{fontSize: "32px", color: "#1976d2", marginBottom: "10px"}}>✅</div>
          <h4 style={{margin: "0 0 5px 0", color: "#1976d2"}}>Tested</h4>
          <p style={{margin: "0", fontSize: "18px", fontWeight: "bold"}}>
            {dashboardStats.childrenWithTests || teacherChildren.filter(child => child.testResults && child.testResults.length > 0).length || 0}
          </p>
        </div>
        
        <div style={{...styles.card, backgroundColor: "#fff3e0", textAlign: "center"}}>
          <div style={{fontSize: "32px", color: "#f57c00", marginBottom: "10px"}}>⚠️</div>
          <h4 style={{margin: "0 0 5px 0", color: "#f57c00"}}>Needs Assessment</h4>
          <p style={{margin: "0", fontSize: "18px", fontWeight: "bold"}}>
            {dashboardStats.dysgraphicResults || teacherChildren.filter(child => child.lastTestResult === 'Dysgraphic').length || 0}
          </p>
        </div>

        <div style={{...styles.card, backgroundColor: "#fce4ec", textAlign: "center"}}>
          <div style={{fontSize: "32px", color: "#c2185b", marginBottom: "10px"}}>🆕</div>
          <h4 style={{margin: "0 0 5px 0", color: "#c2185b"}}>New This Week</h4>
          <p style={{margin: "0", fontSize: "18px", fontWeight: "bold"}}>
            {dashboardStats.recentRegistrations || teacherChildren.filter(child => {
              const regDate = new Date(child.registrationDate);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return regDate > weekAgo;
            }).length || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.card}>
        <h4 style={{marginBottom: "15px", color: "#333"}}>Quick Actions</h4>
        <div style={{display: "flex", gap: "15px", flexWrap: "wrap"}}>
          <button
            onClick={() => {
              setSelectedChildForTest(null);
              setActiveTab("test");
            }}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>📝</span> Register & Test New Child
          </button>
          <button
            onClick={() => setActiveTab("students")}
            style={{
              ...styles.button,
              backgroundColor: "#17a2b8",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>👥</span> View My Students
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              ...styles.button,
              backgroundColor: "#6c757d",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>📊</span> View Test Reports
          </button>
        </div>
      </div>
    </div>
  );

  const renderTestSection = () => {
  const isRetest = selectedChildForTest && selectedChildForTest.isRetest;
  
  return (
    <DysgraphiaTest 
      teacherData={teacherData} 
      selectedChild={selectedChildForTest}
      onTestComplete={handleTestComplete}
      isRetest={isRetest}  // Pass the retest flag
    />
  );
};

  const renderStudents = () => (
  <div>
    <div style={styles.card}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
        <h3 style={{margin: "0", color: "#333"}}>👥 My Students</h3>
        <button
          onClick={() => {
            setSelectedChildForTest(null);
            setActiveTab("test");
          }}
          style={{...styles.button, ...styles.primaryButton}}
        >
          + Register New Child
        </button>
      </div>
      
      {teacherChildren.length === 0 ? (
        <div style={{textAlign: "center", padding: "40px", color: "#6c757d"}}>
          <div style={{fontSize: "48px", marginBottom: "20px"}}>👶</div>
          <h4>No students registered yet</h4>
          <p style={{marginBottom: "20px"}}>Start by registering your first student in the Test section.</p>
          <button
            onClick={() => {
              setSelectedChildForTest(null);
              setActiveTab("test");
            }}
            style={{...styles.button, ...styles.primaryButton}}
          >
            Register First Student
          </button>
        </div>
      ) : (
        <div>
          {teacherChildren.map((child) => {
            // Get the most recent test result
            const recentTest = child.testResults && child.testResults.length > 0 
              ? child.testResults[child.testResults.length - 1] 
              : null;
            
            return (
              <div key={child.childId} style={{...styles.card, marginBottom: "15px"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <div style={{flex: 1}}>
                    <h4 style={{color: "#333", margin: "0"}}>{child.childName}</h4>
                    <p style={{margin: "5px 0", color: "#6c757d", fontSize: "14px"}}>
                      ID: {child.childId} • Age: {child.age} • Grade: {child.grade}
                    </p>
                    <p style={{margin: "0", color: "#666", fontSize: "12px"}}>
                      Registered: {new Date(child.registrationDate).toLocaleDateString()}
                    </p>
                    
                    {/* Show recent test results */}
                    {recentTest && (
                      <div style={{marginTop: "8px"}}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "600",
                          backgroundColor: recentTest.prediction === 'Dysgraphic' ? '#ffebee' : '#e8f5e8',
                          color: recentTest.prediction === 'Dysgraphic' ? '#c62828' : '#2e7d32',
                          marginRight: "8px"
                        }}>
                          Latest: {recentTest.prediction}
                        </span>
                        <span style={{fontSize: "11px", color: "#666"}}>
                          {new Date(recentTest.testDate).toLocaleDateString()}
                        </span>
                        {recentTest.confidence && (
                          <span style={{fontSize: "11px", color: "#666", marginLeft: "8px"}}>
                            ({(recentTest.confidence * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Show test history summary */}
                    {child.testResults && child.testResults.length > 1 && (
                      <div style={{marginTop: "5px", fontSize: "11px", color: "#666"}}>
                        Total tests: {child.testResults.length} • 
                        Progress: {child.testResults.length > 1 ? "Multiple assessments" : "Single assessment"}
                      </div>
                    )}
                  </div>
                  
                  <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
                    <button 
                      style={{
                        ...styles.button, 
                        ...styles.primaryButton, 
                        fontSize: "12px", 
                        padding: "8px 12px"
                      }}
                      onClick={() => handleNewTestForChild(child)}
                    >
                      📝 {child.testResults && child.testResults.length > 0 ? 'Retest' : 'First Test'}
                    </button>
                    
                    {child.testResults && child.testResults.length > 0 && (
                      <button 
                        style={{
                          ...styles.button,
                          backgroundColor: "#17a2b8",
                          color: "white",
                          fontSize: "12px",
                          padding: "8px 12px"
                        }}
                        onClick={() => {
                          // Show detailed test history
                          const historyText = child.testResults.map((test, index) => 
                            `Test ${index + 1}: ${test.prediction} (${(test.confidence * 100).toFixed(1)}%) - ${new Date(test.testDate).toLocaleDateString()}`
                          ).join('\n');
                          
                          alert(`Test History for ${child.childName}:\n\n${historyText}`);
                        }}
                      >
                        📊 History ({child.testResults.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          <div style={{textAlign: "center", marginTop: "30px"}}>
            <p style={{color: "#6c757d", marginBottom: "15px"}}>
              Total: {teacherChildren.length} student{teacherChildren.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => {
                setSelectedChildForTest(null);
                setActiveTab("test");
              }}
              style={{...styles.button, backgroundColor: "#28a745", color: "white"}}
            >
              + Register Another Student
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);
  const renderReportHistory = () => (
    <div>
      <div style={styles.card}>
        <h3 style={{marginBottom: "20px", color: "#333"}}>📊 Test Reports History</h3>
        
        {childTestReports.length === 0 ? (
          <div style={{textAlign: "center", padding: "40px", color: "#6c757d"}}>
            <div style={{fontSize: "48px", marginBottom: "20px"}}>📊</div>
            <h4>No test reports found</h4>
            <p style={{marginBottom: "20px"}}>
              Test reports for your students will appear here after they complete assessments.
            </p>
            <button
              onClick={() => {
                setSelectedChildForTest(null);
                setActiveTab("test");
              }}
              style={{...styles.button, ...styles.primaryButton}}
            >
              Start First Assessment
            </button>
          </div>
        ) : (
          <div>
            <div style={{marginBottom: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px"}}>
              <h4 style={{margin: "0", color: "#333"}}>Summary</h4>
              <p style={{margin: "5px 0 0 0", color: "#6c757d", fontSize: "14px"}}>
                Total Tests: {childTestReports.length} | 
                Dysgraphic Results: {childTestReports.filter(r => r.result === 'Dysgraphic').length} | 
                Normal Results: {childTestReports.filter(r => r.result === 'Normal').length}
              </p>
            </div>

            {childTestReports.slice(0, 10).map((report, index) => (
              <div key={index} style={{...styles.card, marginBottom: "15px"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px"}}>
                  <div>
                    <h4 style={{color: "#333", margin: "0 0 5px 0"}}>{report.childName}</h4>
                    <p style={{margin: "0", color: "#6c757d", fontSize: "14px"}}>
                      Child ID: {report.childId} • Test Date: {new Date(report.testDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{textAlign: "right"}}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: report.result === 'Dysgraphic' ? '#ffebee' : '#e8f5e8',
                      color: report.result === 'Dysgraphic' ? '#c62828' : '#2e7d32'
                    }}>
                      {report.result}
                    </span>
                    {report.score && (
                      <p style={{margin: "5px 0 0 0", fontSize: "12px", color: "#6c757d"}}>
                        Score: {report.score}%
                      </p>
                    )}
                  </div>
                </div>
                
                <div style={{fontSize: "12px", color: "#6c757d"}}>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: "8px",
                    backgroundColor: "#f8f9fa",
                    marginRight: "10px"
                  }}>
                    {report.status || 'Completed'}
                  </span>
                  <span>
                    Assessed by: {teacherData.teacherName}
                  </span>
                </div>
              </div>
            ))}
            
            {childTestReports.length > 10 && (
              <div style={{textAlign: "center", marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px"}}>
                <p style={{color: "#6c757d", margin: "0"}}>
                  Showing 10 of {childTestReports.length} test reports
                </p>
                <button
                  style={{...styles.button, backgroundColor: "#17a2b8", color: "white", marginTop: "10px"}}
                  onClick={() => {
                    // You can implement pagination or show all reports
                    alert("Feature coming soon: View all reports");
                  }}
                >
                  View All Reports
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Separate section for problem reports if needed */}
      {reportedProblems.length > 0 && (
        <div style={styles.card}>
          <h4 style={{marginBottom: "15px", color: "#333"}}>🚨 Problem Reports</h4>
          {reportedProblems.slice(0, 3).map((report, index) => (
            <div key={index} style={{...styles.card, marginBottom: "15px", backgroundColor: "#fff8e1"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px"}}>
                <div>
                  <h4 style={{color: "#333", margin: "0 0 5px 0"}}>{report.childName}</h4>
                  <p style={{margin: "0", color: "#6c757d", fontSize: "14px"}}>
                    {report.problemType} - {new Date(report.reportDate).toLocaleDateString()}
                  </p>
                </div>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  backgroundColor: "#fff3cd",
                  color: "#856404"
                }}>
                  {report.status}
                </span>
              </div>
              
              <p style={{margin: "0", color: "#6c757d", fontSize: "14px", lineHeight: "1.5"}}>
                {report.description.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "test":
        return renderTestSection();
      case "students":
        return renderStudents();
      case "history":
        return renderReportHistory();
      default:
        return renderDashboard();
    }
  };

  if (!teacherData) {
    return (
      <div style={styles.container}>
        <div style={{...styles.loginCard, maxWidth: isRegistering ? "500px" : "450px"}}>
          <div style={{textAlign: "center", marginBottom: "30px"}}>
            <div style={{fontSize: "48px", marginBottom: "15px"}}>🏫</div>
            <h2 style={{color: "#333", marginBottom: "10px", fontSize: "28px"}}>
              {isRegistering ? "Teacher Registration" : "Teacher Portal"}
            </h2>
            <p style={{color: "#6c757d", margin: "0"}}>
              {isRegistering 
                ? "Create your teacher account" 
                : "Dysgraphia Assessment System"
              }
            </p>
          </div>

          {isRegistering ? renderRegistrationForm() : renderLoginForm()}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navigation/>
      <div style={styles.dashboardContainer}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={{margin: "0", fontSize: "24px", color: "#333333"}}>
              🏫 Welcome, {teacherData.teacherName}
            </h2>
            <p style={{margin: "8px 0 0 0", opacity: 0.7, fontSize: "14px", color: "#666666"}}>
              Teacher ID: {teacherData.teacherId} • {teacherData.school}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              ...styles.button,
              backgroundColor: "#f8f9fa",
              color: "#333333",
              border: "2px solid #e1e8ed"
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={styles.tabNavigation}>
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "test", label: "📝 Register & Test" },
            { id: "students", label: "👥 My Students" },
            { id: "history", label: "📊 Test Reports" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "test") {
                  setSelectedChildForTest(null);
                }
                setActiveTab(tab.id);
              }}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : {})
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {renderTabContent()}
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default TeacherLogin;