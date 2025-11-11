// ParentAuth.jsx - Separate component for login/registration
import React, { useState } from "react";
import axios from "axios";

const ParentAuth = ({ onLoginSuccess }) => {
  const [parentId, setParentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Registration form states
  const [regData, setRegData] = useState({
    parentName: "",
    email: "",
    phone: "",
    childName: "",
    childAge: "",
    childGrade: "",
    password: "",
    confirmPassword: ""
  });

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!regData.parentName || !regData.childName) {
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
    
    if (regData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Generate unique Parent ID and Child ID
      const timestamp = Date.now();
      const generatedParentId = `P${timestamp.toString().slice(-6)}`;
      const generatedChildId = `C${timestamp.toString().slice(-6)}`;

      // Prepare data to match your backend structure
      const registrationData = {
        parentId: generatedParentId,
        parentName: regData.parentName,
        childId: generatedChildId,
        childName: regData.childName,
        email: regData.email,
        phone: regData.phone,
        childAge: regData.childAge,
        childGrade: regData.childGrade,
        password: regData.password
      };

      const response = await axios.post(
        "http://localhost:5000/api/parent-register",
        registrationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setSuccess(`Registration successful! Your Parent ID is: ${generatedParentId}. Please save this ID and your password for future login.`);
        // Reset form
        setRegData({
          parentName: "",
          email: "",
          phone: "",
          childName: "",
          childAge: "",
          childGrade: "",
          password: "",
          confirmPassword: ""
        });
      } else {
        setError(response.data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(err.response.data.message || "Server error occurred.");
      } else if (err.request) {
        setError("Network error: Unable to reach server. Make sure your backend is running on port 5000.");
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!parentId) {
      setError("Please enter your Parent ID.");
      return;
    }
    
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/parent-login",
        { 
          parentId, 
          password
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setSuccess("Login successful!");
        // Pass the user data back to parent component
        onLoginSuccess(response.data);
      } else {
        setError(response.data.message || "Invalid Parent ID or password.");
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        setError(err.response.data.message || "Server error occurred.");
      } else if (err.request) {
        setError("Network error: Unable to reach server.");
      } else {
        setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
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
    setParentId("");
    setPassword("");
  };

  const handleRegInputChange = (field, value) => {
    setRegData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // UI styles
  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#fbfbfcff",
      minHeight: "100vh",
      padding: "20px"
    },
    loginCard: {
      maxWidth: isRegistering ? "600px" : "450px",
      margin: "80px auto",
      padding: "40px",
      backgroundColor: "#ffffffff",
      borderRadius: "16px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      border: "1px solid #e1e8ed"
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
      backgroundColor: "#007bff",
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
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px"}}>
        <div>
          <label htmlFor="parentName" style={styles.label}>Parent Name *</label>
          <input
            type="text"
            id="parentName"
            value={regData.parentName}
            onChange={(e) => handleRegInputChange("parentName", e.target.value)}
            placeholder="Enter your full name"
            style={styles.input}
            required
          />
        </div>
        <div>
          <label htmlFor="email" style={styles.label}>Email Address</label>
          <input
            type="email"
            id="email"
            value={regData.email}
            onChange={(e) => handleRegInputChange("email", e.target.value)}
            placeholder="Enter your email"
            style={styles.input}
          />
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px"}}>
        <div>
          <label htmlFor="phone" style={styles.label}>Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={regData.phone}
            onChange={(e) => handleRegInputChange("phone", e.target.value)}
            placeholder="Enter your phone number"
            style={styles.input}
          />
        </div>
        <div>
          <label htmlFor="childName" style={styles.label}>Child's Name *</label>
          <input
            type="text"
            id="childName"
            value={regData.childName}
            onChange={(e) => handleRegInputChange("childName", e.target.value)}
            placeholder="Enter child's name"
            style={styles.input}
            required
          />
        </div>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px"}}>
        <div>
          <label htmlFor="childAge" style={styles.label}>Child's Age</label>
          <select
            id="childAge"
            value={regData.childAge}
            onChange={(e) => handleRegInputChange("childAge", e.target.value)}
            style={styles.input}
          >
            <option value="">Select age</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 5} value={i + 5}>{i + 5} years old</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="childGrade" style={styles.label}>Child's Grade</label>
          <select
            id="childGrade"
            value={regData.childGrade}
            onChange={(e) => handleRegInputChange("childGrade", e.target.value)}
            style={styles.input}
          >
            <option value="">Select grade</option>
            <option value="Pre-K">Pre-K</option>
            <option value="Kindergarten">Kindergarten</option>
            <option value="1st Grade">1st Grade</option>
            <option value="2nd Grade">2nd Grade</option>
            <option value="3rd Grade">3rd Grade</option>
            <option value="4th Grade">4th Grade</option>
            <option value="5th Grade">5th Grade</option>
            <option value="6th Grade">6th Grade</option>
            <option value="7th Grade">7th Grade</option>
            <option value="8th Grade">8th Grade</option>
          </select>
        </div>
      </div>

      {/* Password Fields */}
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px"}}>
        <div>
          <label htmlFor="password" style={styles.label}>Password *</label>
          <input
            type="password"
            id="password"
            value={regData.password}
            onChange={(e) => handleRegInputChange("password", e.target.value)}
            placeholder="Create a password (min 6 chars)"
            style={styles.input}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" style={styles.label}>Confirm Password *</label>
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
      </div>

      {error && <div style={styles.errorAlert}><strong>Error:</strong> {error}</div>}
      {success && <div style={styles.successAlert}><strong>Success:</strong> {success}</div>}

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
        {loading ? (
          <span><span style={{marginRight: "8px"}}>⏳</span>Creating Account...</span>
        ) : (
          <span><span style={{marginRight: "8px"}}>📝</span>Create Parent Account</span>
        )}
      </button>

      <div style={{textAlign: "center", marginTop: "20px"}}>
        <button
          type="button"
          onClick={switchToLogin}
          style={{
            ...styles.button,
            backgroundColor: "transparent",
            color: "#007bff",
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
        <label htmlFor="parentId" style={styles.label}>Parent ID</label>
        <input
          type="text"
          id="parentId"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          placeholder="Enter your unique Parent ID"
          style={{
            ...styles.input,
            borderColor: error ? "#dc3545" : "#e1e8ed"
          }}
          onFocus={(e) => e.target.style.borderColor = "#007bff"}
          onBlur={(e) => e.target.style.borderColor = error ? "#dc3545" : "#e1e8ed"}
        />
      </div>

      <div style={{marginBottom: "25px"}}>
        <label htmlFor="password" style={styles.label}>Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={{
            ...styles.input,
            borderColor: error ? "#dc3545" : "#e1e8ed"
          }}
          onFocus={(e) => e.target.style.borderColor = "#007bff"}
          onBlur={(e) => e.target.style.borderColor = error ? "#dc3545" : "#e1e8ed"}
        />
      </div>

      {error && <div style={styles.errorAlert}><strong>Error:</strong> {error}</div>}
      {success && <div style={styles.successAlert}><strong>Success:</strong> {success}</div>}

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
        {loading ? (
          <span><span style={{marginRight: "8px"}}>⏳</span>Authenticating...</span>
        ) : (
          <span><span style={{marginRight: "8px"}}>🔑</span>Access Dashboard</span>
        )}
      </button>

      <div style={{textAlign: "center", marginTop: "20px"}}>
        <button
          type="button"
          onClick={switchToRegister}
          style={{
            ...styles.button,
            backgroundColor: "transparent",
            color: "#007bff",
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

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={{textAlign: "center", marginBottom: "30px"}}>
          <div style={{fontSize: "48px", marginBottom: "15px"}}>🏥</div>
          <h2 style={{color: "#333", marginBottom: "10px", fontSize: "28px"}}>
            {isRegistering ? "Parent Registration" : "Parent Portal"}
          </h2>
          <p style={{color: "#6c757d", margin: "0"}}>
            {isRegistering 
              ? "Create your account to start tracking your child's progress" 
              : "Dysgraphia Screening & Assessment System"
            }
          </p>
        </div>

        {isRegistering ? renderRegistrationForm() : renderLoginForm()}

        <div style={{
          marginTop: "30px", 
          padding: "20px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <h5 style={{color: "#495057", marginBottom: "10px"}}>
            {isRegistering ? "Why Register?" : "New to our system?"}
          </h5>
          <p style={{color: "#6c757d", fontSize: "14px", marginBottom: "15px"}}>
            {isRegistering 
              ? "Get personalized dysgraphia screening and track your child's handwriting development with our comprehensive assessment tools."
              : "Contact your child's educator or our support team to get your Parent ID and start tracking progress."
            }
          </p>
          <button style={{
            ...styles.button,
            backgroundColor: "transparent",
            color: "#007bff",
            border: "2px solid #007bff",
            fontSize: "14px"
          }}>
            {isRegistering ? "Learn More" : "Get Help"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentAuth;