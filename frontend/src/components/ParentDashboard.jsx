import React, { useState } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";
import SpotDifferenceGame from "./SpotDifferenceGame";
import Games from "./Games";
import Dysgraphia from "./Dysgraphia";

const ParentDashboard = ({ childData = {}, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Provide default values for childData properties
  const safeChildData = {
    childName: childData?.childName || "Child",
    childId: childData?.childId || "N/A",
    age: childData?.age || "Not specified",
    grade: childData?.grade || "Not specified",
    lastActivity: childData?.lastActivity || "No activity"
  };

  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#fbfbfcff",
      minHeight: "100vh",
      padding: "20px"
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
      borderBottom: "3px solid transparent",
      transition: "all 0.3s ease"
    },
    activeTab: {
      color: "#007bff",
      borderBottomColor: "#007bff",
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
      backgroundColor: "#007bff",
      color: "white"
    },
    secondaryButton: {
      backgroundColor: "#6c757d",
      color: "white"
    },
    successButton: {
      backgroundColor: "#28a745",
      color: "white"
    },
    warningButton: {
      backgroundColor: "#ffc107",
      color: "#212529"
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "30px"
    },
    statCard: {
      textAlign: "center",
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid #e1e8ed"
    }
  };

  // Navigation handlers that stay within the dashboard
  const handleNavigateBack = () => {
    setActiveTab("dashboard");
  };

  const handleNavigateHome = () => {
    setActiveTab("dashboard");
  };

  const renderDashboard = () => {
    return (
      <div>
        <div style={styles.card}>
          <h3 style={{ color: "#333", marginBottom: "10px", fontSize: "24px" }}>
            👋 Welcome back!
          </h3>
          <p style={{ color: "#6c757d", margin: "0", fontSize: "16px" }}>
            Track {safeChildData.childName}'s progress in dysgraphia screening and development activities.
          </p>
        </div>

        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, backgroundColor: "#e8f5e8"}}>
            <div style={{fontSize: "32px", color: "#388e3c", marginBottom: "10px"}}>🎯</div>
            <h4 style={{margin: "0 0 5px 0", color: "#388e3c"}}>Child Age</h4>
            <p style={{margin: "0", fontSize: "18px", fontWeight: "bold"}}>
              {safeChildData.age}
            </p>
          </div>
          
          <div style={{...styles.statCard, backgroundColor: "#fff3e0"}}>
            <div style={{fontSize: "32px", color: "#f57c00", marginBottom: "10px"}}>📚</div>
            <h4 style={{margin: "0 0 5px 0", color: "#f57c00"}}>Grade Level</h4>
            <p style={{margin: "0", fontSize: "18px", fontWeight: "bold"}}>
              {safeChildData.grade}
            </p>
          </div>

          <div style={{...styles.statCard, backgroundColor: "#fce4ec"}}>
            <div style={{fontSize: "32px", color: "#c2185b", marginBottom: "10px"}}>⏱️</div>
            <h4 style={{margin: "0 0 5px 0", color: "#c2185b"}}>Last Activity</h4>
            <p style={{margin: "0", fontSize: "18px", fontWeight: "bold"}}>
              {safeChildData.lastActivity}
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <h4 style={{marginBottom: "20px", color: "#333"}}>Quick Actions</h4>
          <div style={{display: "flex", gap: "15px", flexWrap: "wrap"}}>
            <button 
              style={{...styles.button, ...styles.primaryButton}}
              onClick={() => setActiveTab("assessment")}
            >
              📋 View Assessment
            </button>
            <button 
              style={{...styles.button, ...styles.successButton}}
              onClick={() => setActiveTab("activities")}
            >
              🎮 Learning Activities
            </button>
            <button 
              style={{...styles.button, ...styles.warningButton}}
              onClick={() => setActiveTab("resources")}
            >
              📖 Resources & Tips
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAssessment = () => {
    return (
      <Dysgraphia
      />
    );
  };

  const renderActivities = () => {
    return (
      <div>
        <Games />
      </div>
    );
  };

  const renderResources = () => {
    return (
      <div>
        <div style={styles.card}>
          <h3 style={{marginBottom: "20px", color: "#333"}}>📖 Resources & Educational Tips</h3>
          
          <div style={{...styles.card, backgroundColor: "#f8f9fa", marginBottom: "20px"}}>
            <h4 style={{color: "#333", marginBottom: "15px"}}>🧠 Understanding Dysgraphia</h4>
            <p style={{color: "#6c757d", lineHeight: "1.6", marginBottom: "15px"}}>
              Dysgraphia is a learning difficulty that affects writing abilities. It can manifest as problems with 
              letter formation, spacing, organization, and writing fluency. Early identification and intervention 
              can significantly improve outcomes.
            </p>
          </div>

          <div style={{...styles.card, backgroundColor: "#fff8e1", marginBottom: "20px"}}>
            <h4 style={{color: "#333", marginBottom: "15px"}}>💡 Tips for Parents</h4>
            <ul style={{color: "#6c757d", lineHeight: "1.6", paddingLeft: "20px"}}>
              <li>Practice fine motor skills through play activities</li>
              <li>Use multi-sensory approaches to learning letters</li>
              <li>Break writing tasks into smaller, manageable steps</li>
              <li>Celebrate progress, no matter how small</li>
              <li>Work closely with your child's teacher and therapists</li>
            </ul>
          </div>

          <div style={{...styles.card, backgroundColor: "#e8f5e8", marginBottom: "20px"}}>
            <h4 style={{color: "#333", marginBottom: "15px"}}>🏠 Activities to Try at Home</h4>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px"}}>
              <div>
                <h5 style={{color: "#388e3c", marginBottom: "5px"}}>Fine Motor Skills</h5>
                <p style={{color: "#6c757d", fontSize: "14px", margin: "0"}}>
                  Play with playdough, use tweezers to pick up small objects, string beads
                </p>
              </div>
              <div>
                <h5 style={{color: "#388e3c", marginBottom: "5px"}}>Letter Practice</h5>
                <p style={{color: "#6c757d", fontSize: "14px", margin: "0"}}>
                  Trace letters in sand, write in the air, use finger paints
                </p>
              </div>
              <div>
                <h5 style={{color: "#388e3c", marginBottom: "5px"}}>Strengthening</h5>
                <p style={{color: "#6c757d", fontSize: "14px", margin: "0"}}>
                  Squeeze stress balls, use hole punchers, tear paper into strips
                </p>
              </div>
            </div>
          </div>

          <div style={{...styles.card, backgroundColor: "#e8f4fd", border: "1px solid #b8daff"}}>
            <h4 style={{color: "#004085", marginBottom: "15px"}}>🤝 Need Additional Support?</h4>
            <p style={{color: "#004085", marginBottom: "20px"}}>
              Our team of specialists is here to help you and your child succeed. Don't hesitate to reach out 
              for personalized guidance and support.
            </p>
            <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
              <button style={{...styles.button, backgroundColor: "#004085", color: "white"}}>
                📞 Contact Specialist
              </button>
              <button style={{...styles.button, backgroundColor: "transparent", color: "#004085", border: "2px solid #004085"}}>
                📧 Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "assessment":
        return renderAssessment();
      case "activities":
        return renderActivities();
      case "resources":
        return renderResources();
      default:
        return renderDashboard();
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      console.warn("No logout handler provided");
    }
  };

  const tabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "assessment", label: "🧠 Assessment" },
    { id: "activities", label: "🎮 Activities" },
    { id: "resources", label: "📖 Resources" }
  ];

  return (
    <div style={styles.container}>
      <Navigation />
      <div style={styles.dashboardContainer}>
        <div style={styles.header}>
          <div>
            <h2 style={{margin: "0", fontSize: "24px", color: "#333333"}}>
              👋 Welcome, Parent of {safeChildData.childName}
            </h2>
            <p style={{margin: "8px 0 0 0", opacity: 0.7, fontSize: "14px", color: "#666666"}}>
              Child ID: {safeChildData.childId} • Dysgraphia Screening Dashboard
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

        <div style={styles.tabNavigation}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : {})
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.tabContent}>
          {renderTabContent()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ParentDashboard;