import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';

const Link = ({ to, className, children, ...props }) => (
  <a href={to} className={className} {...props}>{children}</a>
);

// Interactive Progress Ring Component
const ProgressRing = ({ progress, color = '#3b82f6', size = 80, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ 
            transition: 'stroke-dashoffset 1.5s ease-in-out',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: color
      }}>
        {Math.round(progress)}%
      </div>
    </div>
  );
};

// Interactive Wave Chart Component
const WaveChart = ({ data, color = '#3b82f6', height = 60 }) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimationProgress(100), 500);
    return () => clearTimeout(timer);
  }, []);

  const width = 200;
  const maxValue = Math.max(...data);
  
  // Create smooth wave path
  const createPath = (points, tension = 0.3) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      if (i === 1) {
        const cp1x = prev.x + (curr.x - prev.x) * tension;
        const cp1y = prev.y;
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
      } else {
        const cp1x = prev.x + (curr.x - prev.x) * tension;
        const cp1y = prev.y + (curr.y - prev.y) * tension;
        const cp2x = curr.x - (next ? (next.x - prev.x) * tension : 0);
        const cp2y = curr.y;
        path += ` S ${cp2x} ${cp2y} ${curr.x} ${curr.y}`;
      }
    }
    
    return path;
  };

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - (value / maxValue) * height
  }));

  const pathData = createPath(points);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        <path
          d={`${pathData} L ${width} ${height} L 0 ${height} Z`}
          fill={`url(#gradient-${color})`}
          style={{
            clipPath: `inset(0 ${100 - animationProgress}% 0 0)`,
            transition: 'clip-path 2s ease-out'
          }}
        />
        
        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: '300',
            strokeDashoffset: animationProgress === 100 ? '0' : '300',
            transition: 'stroke-dashoffset 2s ease-out',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
          }}
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={color}
            style={{
              opacity: animationProgress === 100 ? 0.8 : 0,
              transition: `opacity 0.5s ease-out ${index * 0.1}s`,
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// Status Indicator Component
const StatusIndicator = ({ level, label, color }) => {
  const getBarHeight = (level) => {
    switch(level) {
      case 'low': return '25%';
      case 'medium': return '65%';
      case 'high': return '90%';
      default: return '50%';
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '60px',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        margin: '0 auto 8px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: getBarHeight(level),
          backgroundColor: color,
          borderRadius: '0 0 8px 8px',
          transition: 'height 1.5s ease-out',
          background: `linear-gradient(180deg, ${color}dd, ${color})`
        }} />
      </div>
      <div style={{
        fontSize: '0.7rem',
        color: '#64748b',
        fontWeight: '500'
      }}>
        {label}
      </div>
    </div>
  );
};

const Dashboard = () => {
  // Realistic assessment data patterns for dysgraphia screening
  const handwritingTrendData = [65, 72, 68, 75, 78, 82, 79, 84, 88, 85];
  const motorSkillsData = [58, 62, 69, 71, 74, 78, 81, 83, 86, 89];
  const engagementData = [88, 85, 90, 87, 92, 89, 94, 91, 95, 93];
  const consistencyData = [45, 52, 58, 64, 69, 72, 76, 78, 81, 84];

  return (
    <div style={styles.pageWrapper}>
      <Navigation />
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <span style={styles.badgeText}>✨ AI-Powered Dysgraphia Screening</span>
            </div>
            <h1 style={styles.heroTitle}>
              Early Detection for 
              <span style={styles.titleAccent}> Better Learning</span>
            </h1>
            <p style={styles.heroDescription}>
              Advanced dysgraphia screening through interactive handwriting analysis and motor skill assessments. 
              Supporting children, parents, educators, and specialists with evidence-based insights.
            </p>
           
          </div>
          
          <div style={styles.heroVisual}>
            <div style={styles.visualCard}>
              <div style={styles.visualCardHeader}>
                <div style={styles.cardDots}>
                  <span style={{...styles.dot, backgroundColor: '#10b981'}}></span>
                  <span style={{...styles.dot, backgroundColor: '#f59e0b'}}></span>
                  <span style={{...styles.dot, backgroundColor: '#ef4444'}}></span>
                </div>
                <span style={styles.cardTitle}>Live Assessment Analysis</span>
              </div>
              <div style={styles.visualCardContent}>
                <div style={styles.chartContainer}>
                  <div style={styles.chartLabel}>Handwriting Progress Trend</div>
                  <WaveChart data={handwritingTrendData} color="#3b82f6" height={80} />
                </div>
                <div style={styles.progressIndicators}>
                  <div style={styles.progressItem}>
                    <ProgressRing progress={78} color="#10b981" size={60} strokeWidth={6} />
                    <div style={styles.progressLabel}>Letter Formation</div>
                  </div>
                  <div style={styles.progressItem}>
                    <ProgressRing progress={65} color="#f59e0b" size={60} strokeWidth={6} />
                    <div style={styles.progressLabel}>Motor Control</div>
                  </div>
                  <div style={styles.progressItem}>
                    <ProgressRing progress={82} color="#8b5cf6" size={60} strokeWidth={6} />
                    <div style={styles.progressLabel}>Consistency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* User Roles Section */}
        <div style={styles.rolesSection}>
          <div style={styles.sectionHeader}>
            <h1 style={styles.sectionSubtitle}>Tailored screening tools for different perspectives and needs</h1>
          </div>

          <div style={styles.roleGrid}>
            <Link to="/parent-login" style={styles.roleCard}>
              <div style={styles.roleHeader}>
                <div style={{...styles.roleIcon, backgroundColor: '#fef3c7', color: '#d97706'}}>
                  👨‍👩‍👧‍👦
                </div>
                <div style={styles.roleArrow}>→</div>
              </div>
              <div style={styles.roleContent}>
                <h3 style={styles.roleTitle}>Parents</h3>
                <p style={styles.roleDescription}>
                  Early screening tools to identify potential writing difficulties. Get insights into your child's handwriting development with simple, engaging assessments.
                </p>
                
              </div>
            </Link>

            <Link to="/teacher-login" style={styles.roleCard}>
              <div style={styles.roleHeader}>
                <div style={{...styles.roleIcon, backgroundColor: '#dbeafe', color: '#2563eb'}}>
                  👩‍🏫
                </div>
                <div style={styles.roleArrow}>→</div>
              </div>
              <div style={styles.roleContent}>
                <h3 style={styles.roleTitle}>Educators</h3>
                <p style={styles.roleDescription}>
                  Classroom-ready screening tools to identify students who may benefit from additional handwriting support. Track class-wide writing development patterns.
                </p>
               
              </div>
            </Link>

            <Link to="/counselors" style={styles.roleCard}>
              <div style={styles.roleHeader}>
                <div style={{...styles.roleIcon, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                  👨‍⚕️
                </div>
                <div style={styles.roleArrow}>→</div>
              </div>
              <div style={styles.roleContent}>
                <h3 style={styles.roleTitle}>Specialists</h3>
                <p style={styles.roleDescription}>
                  Comprehensive assessment tools for occupational therapists, psychologists, and learning specialists. Detailed analysis for professional evaluation.
                </p>
                
              </div>
            </Link>
          </div>
        </div>

        {/* Assessment Features Section */}
        <div style={styles.featuresSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Comprehensive Screening Features</h2>
            <p style={styles.sectionSubtitle}>Evidence-based assessment tools designed by pediatric specialists</p>
          </div>

          <div style={styles.featuresRow}>
            <div style={styles.featureCard}>
              <div style={{...styles.featureIcon, backgroundColor: '#fef3c7', color: '#d97706'}}>
                ✍️
              </div>
              <h3 style={styles.featureTitle}>Handwriting Analysis</h3>
              <p style={styles.featureDescription}>
                AI-powered analysis of letter formation, spacing, and writing fluency through interactive digital assessments.
              </p>
              <div style={styles.featureChart}>
                <WaveChart data={[72, 75, 78, 81, 84, 87]} color="#d97706" height={40} />
              </div>
            </div>

            <div style={styles.featureCard}>
              <div style={{...styles.featureIcon, backgroundColor: '#dbeafe', color: '#2563eb'}}>
                🎯
              </div>
              <h3 style={styles.featureTitle}>Motor Skills Assessment</h3>
              <p style={styles.featureDescription}>
                Interactive games that evaluate fine motor control, hand-eye coordination, and pencil grip patterns.
              </p>
              <div style={styles.featureChart}>
                <WaveChart data={motorSkillsData.slice(-6)} color="#2563eb" height={40} />
              </div>
            </div>

            <div style={styles.featureCard}>
              <div style={{...styles.featureIcon, backgroundColor: '#dcfce7', color: '#16a34a'}}>
                📊
              </div>
              <h3 style={styles.featureTitle}>Progress Visualization</h3>
              <p style={styles.featureDescription}>
                Visual progress tracking without overwhelming numbers - focus on growth patterns and improvement trends.
              </p>
              <div style={styles.featureChart}>
                <WaveChart data={[68, 71, 74, 77, 80, 83]} color="#16a34a" height={40} />
              </div>
            </div>

            <div style={styles.featureCard}>
              <div style={{...styles.featureIcon, backgroundColor: '#f3e8ff', color: '#7c3aed'}}>
                🎮
              </div>
              <h3 style={styles.featureTitle}>Engaging Activities</h3>
              <p style={styles.featureDescription}>
                Game-based assessments that keep children motivated while gathering comprehensive handwriting data.
              </p>
              <div style={styles.featureChart}>
                <WaveChart data={engagementData.slice(-6)} color="#7c3aed" height={40} />
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Indicators Section */}
        <div style={styles.statsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>What We Assess</h2>
            <p style={styles.sectionSubtitle}>Key indicators tracked during dysgraphia screening</p>
          </div>

          <div style={styles.indicatorsGrid}>
            <div style={styles.indicatorCard}>
              <div style={styles.indicatorHeader}>
                <div style={styles.indicatorIcon}>✍️</div>
                <h3 style={styles.indicatorTitle}>Letter Formation Quality</h3>
              </div>
              <div style={styles.statusGrid}>
                <StatusIndicator level="high" label="Shape Accuracy" color="#10b981" />
                <StatusIndicator level="medium" label="Size Consistency" color="#f59e0b" />
                <StatusIndicator level="medium" label="Stroke Order" color="#3b82f6" />
              </div>
            </div>

            <div style={styles.indicatorCard}>
              <div style={styles.indicatorHeader}>
                <div style={styles.indicatorIcon}>🎯</div>
                <h3 style={styles.indicatorTitle}>Motor Control</h3>
              </div>
              <div style={styles.statusGrid}>
                <StatusIndicator level="medium" label="Pressure Control" color="#10b981" />
                <StatusIndicator level="high" label="Line Quality" color="#f59e0b" />
                <StatusIndicator level="low" label="Hand Stability" color="#ef4444" />
              </div>
            </div>

            <div style={styles.indicatorCard}>
              <div style={styles.indicatorHeader}>
                <div style={styles.indicatorIcon}>📏</div>
                <h3 style={styles.indicatorTitle}>Spatial Organization</h3>
              </div>
              <div style={styles.statusGrid}>
                <StatusIndicator level="high" label="Letter Spacing" color="#10b981" />
                <StatusIndicator level="medium" label="Line Alignment" color="#3b82f6" />
                <StatusIndicator level="medium" label="Margin Awareness" color="#8b5cf6" />
              </div>
            </div>

            
          </div>
        </div>

        
      </div>
      <Footer/>
    </div>
    
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    lineHeight: 1.6,
  },
  
  heroSection: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
    padding: '100px 0 80px',
    position: 'relative',
    overflow: 'hidden',
  },
  
  heroContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    alignItems: 'center',
  },
  
  heroContent: {},
  
  heroBadge: {
    display: 'inline-block',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    border: '1px solid #bae6fd',
    borderRadius: '50px',
    marginBottom: '24px',
    boxShadow: '0 2px 10px rgba(59, 130, 246, 0.1)',
  },
  
  badgeText: {
    color: '#0369a1',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: '1.1',
    marginBottom: '24px',
    letterSpacing: '-0.02em',
  },
  
  titleAccent: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #7c3aed 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  
  heroDescription: {
    fontSize: '1.2rem',
    color: '#64748b',
    lineHeight: '1.8',
    marginBottom: '32px',
    maxWidth: '500px',
  },
  
  heroButtons: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  
  primaryButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
  },
  
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '16px 24px',
    transition: 'all 0.3s ease',
    borderRadius: '12px',
  },
  
  playIcon: {
    color: '#3b82f6',
    fontSize: '1.2rem',
  },
  
  heroVisual: {},
  
  visualCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  
  visualCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderBottom: '1px solid #e2e8f0',
  },
  
  cardDots: {
    display: 'flex',
    gap: '8px',
  },
  
  dot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  
  cardTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#475569',
  },
  
  visualCardContent: {
    padding: '24px',
  },
  
  chartContainer: {
    marginBottom: '24px',
  },
  
  chartLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginBottom: '12px',
    fontWeight: '500',
  },
  
  progressIndicators: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  
  progressItem: {
    textAlign: 'center',
    flex: 1,
  },
  
  progressLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500',
    marginTop: '8px',
  },
  
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  
  rolesSection: {
    padding: '80px 0',
  },
  
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
    letterSpacing: '-0.01em',
  },
  
  sectionSubtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '32px',
  },
  
  roleCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '32px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  
  roleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  
  roleIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
  },
  
  roleArrow: {
    fontSize: '1.5rem',
    color: '#cbd5e1',
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
  },
  
  roleContent: {},
  
  roleTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px',
  },
  
  roleDescription: {
    color: '#64748b',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  
  roleFeatures: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  
  feature: {
    fontSize: '0.8rem',
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    color: '#475569',
    borderRadius: '20px',
    fontWeight: '500',
    border: '1px solid #e2e8f0',
  },
  
  featuresSection: {
    padding: '80px 0',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)',
    margin: '0 -20px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  
  featuresRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px 20px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f1f5f9',
    position: 'relative',
    overflow: 'hidden',
  },
  
  featureIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    margin: '0 auto 16px',
  },
  
  featureTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px',
    lineHeight: '1.3',
  },
  
  featureDescription: {
    color: '#64748b',
    lineHeight: '1.5',
    fontSize: '0.9rem',
    marginBottom: '16px',
  },
  
  featureChart: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '16px',
  },
  
  statsSection: {
    padding: '80px 0',
  },
  
  indicatorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  
  indicatorCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '32px 24px',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  
  indicatorHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  
  indicatorIcon: {
    fontSize: '2.2rem',
    marginBottom: '12px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  },
  
  indicatorTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  
  statusGrid: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '16px',
  },
  
  disclaimerSection: {
    padding: '60px 0 40px',
    borderTop: '1px solid #e2e8f0',
    marginTop: '60px',
  },
  
  disclaimer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    backgroundColor: '#f8fafc',
    padding: '24px 28px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    maxWidth: '900px',
    margin: '0 auto',
  },
  
  disclaimerIcon: {
    fontSize: '1.8rem',
    marginTop: '2px',
  },
  
  disclaimerContent: {
    flex: 1,
  },
  
  disclaimerTitle: {
    color: '#1e293b',
    fontSize: '1.1rem',
    fontWeight: '700',
    margin: '0 0 12px 0',
  },
  
  disclaimerText: {
    color: '#64748b',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    margin: 0,
  }

};

export default Dashboard;