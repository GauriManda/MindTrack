import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-header">
              <div className="brand-icon">
                <div className="icon-inner">✨</div>
              </div>
              <h3>Dysgraphia Screening</h3>
            </div>
            <p>AI-powered early detection for writing difficulties.</p>
            <div className="brand-features">
              <span className="feature-tag">
                <span className="tag-icon">🧠</span>
                AI-Powered
              </span>
              <span className="feature-tag">
                <span className="tag-icon">🔬</span>
                Evidence-Based
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="footer-links">
            <div className="link-group">
              <h4>Quick Access</h4>
              <div className="links-list">
                <a href="/screening">
                  <span className="link-icon">🎯</span>
                  Start Assessment
                </a>
                <a href="/parent-portal">
                  <span className="link-icon">👨‍👩‍👧‍👦</span>
                  Parent Portal
                </a>
              </div>
            </div>

            <div className="link-group">
              <h4>Support</h4>
              <div className="links-list">
                <a href="/help">
                  <span className="link-icon">💬</span>
                  Help Center
                </a>
                <a href="/contact">
                  <span className="link-icon">📞</span>
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-legal">
            <div className="footer-copyright">
              <p>&copy; {currentYear} Dysgraphia Screening Platform</p>
            </div>
            
          </div>
        </div>
      </div>

      <style> {`
        .footer {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%, #ffffff 100%);
          position: relative;
          padding: 60px 0 32px 0;
          margin-top: auto;
          font-family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          overflow: hidden;
          border-top: 1px solid #e2e8f0;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, #3b82f6 25%, #7c3aed 50%, #ec4899 75%, transparent 100%);
        }

        .footer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse 800px 400px at 50% 0%, rgba(59, 130, 246, 0.02) 0%, transparent 50%);
          pointer-events: none;
        }

        .footer-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 1;
        }

        .footer-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 60px;
          margin-bottom: 48px;
        }

        .footer-brand {
          flex: 1;
          max-width: 360px;
        }

        .brand-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 50%, #ec4899 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 
            0 6px 24px rgba(59, 130, 246, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .icon-inner {
          font-size: 1.3rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .footer-brand h3 {
          color: #1e293b;
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #1e293b 0%, #3b82f6 50%, #7c3aed 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .footer-brand p {
          color: #64748b;
          margin-bottom: 20px;
          line-height: 1.6;
          font-size: 0.95rem;
          font-weight: 400;
        }

        .brand-features {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .feature-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          color: #475569;
          border-radius: 20px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }

        .feature-tag:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08);
          border-color: #cbd5e1;
        }

        .tag-icon {
          font-size: 0.9rem;
        }

        .footer-links {
          display: flex;
          gap: 60px;
          flex: 1;
        }

        .link-group {
          flex: 1;
        }

        .link-group h4 {
          color: #1e293b;
          margin-bottom: 20px;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          position: relative;
          padding-bottom: 6px;
        }

        .link-group h4::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 32px;
          height: 2px;
          background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
          border-radius: 1px;
        }

        .links-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .links-list a {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #64748b;
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 6px 0;
          border-radius: 6px;
          position: relative;
        }

        .link-icon {
          font-size: 1rem;
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .links-list a:hover {
          color: #1e293b;
          transform: translateX(6px);
        }

        .links-list a:hover .link-icon {
          opacity: 1;
          transform: scale(1.1);
        }

        .links-list a::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
          transition: width 0.3s ease;
          border-radius: 1px;
        }

        .links-list a:hover::before {
          width: 3px;
        }

        .footer-bottom {
          border-top: 1px solid #e2e8f0;
          padding-top: 24px;
        }

        .footer-legal {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-copyright p {
          margin: 0;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .legal-links {
          display: flex;
          gap: 24px;
        }

        .legal-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .legal-links a::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 1px;
          background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
          transition: width 0.3s ease;
        }

        .legal-links a:hover {
          color: #1e293b;
        }

        .legal-links a:hover::after {
          width: 100%;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .footer {
            padding: 48px 0 24px 0;
          }

          .footer-container {
            padding: 0 20px;
          }

          .footer-main {
            flex-direction: column;
            gap: 40px;
            margin-bottom: 32px;
          }

          .footer-links {
            flex-direction: column;
            gap: 32px;
          }

          .footer-legal {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }

          .brand-features {
            justify-content: center;
          }

          .footer-brand h3 {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .footer-main {
            gap: 28px;
          }

          .footer-links {
            gap: 24px;
          }

          .brand-header {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }

          .brand-features {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;