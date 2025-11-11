import React, { useState } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
const Counselor = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const counselors = [
    {
      id: 1,
      name: "Dr. Priya Sharma",
      specialty: "Academic Counseling",
      qualification: "M.A. Psychology, Ph.D. Counseling",
      experience: "8 years",
      contact: "+91 98765 43210",
      email: "priya.sharma@counseling.com",
      location: "Civil Lines, Nagpur",
      rating: 4.8,
      availability: "Mon-Fri, 9 AM - 6 PM",
      languages: ["Hindi", "English", "Marathi"],
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Dr. Rajesh Patel",
      specialty: "Career Guidance",
      qualification: "M.A. Career Counseling, Certified Career Coach",
      experience: "12 years",
      contact: "+91 87654 32109",
      email: "rajesh.patel@careerguide.com",
      location: "Sadar, Nagpur",
      rating: 4.9,
      availability: "Mon-Sat, 10 AM - 7 PM",
      languages: ["Hindi", "English", "Gujarati"],
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "Dr. Sneha Deshmukh",
      specialty: "Mental Health",
      qualification: "M.D. Psychiatry, Mental Health Counselor",
      experience: "10 years",
      contact: "+91 76543 21098",
      email: "sneha.deshmukh@mentalhealth.com",
      location: "Dharampeth, Nagpur",
      rating: 4.7,
      availability: "Tue-Sun, 11 AM - 8 PM",
      languages: ["Hindi", "English", "Marathi"],
      image: "https://images.unsplash.com/photo-1594824750081-a3e08b8d9e59?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      name: "Dr. Amit Agarwal",
      specialty: "Study Skills",
      qualification: "M.Ed. Educational Psychology",
      experience: "6 years",
      contact: "+91 65432 10987",
      email: "amit.agarwal@studyskills.com",
      location: "Sitabuldi, Nagpur",
      rating: 4.6,
      availability: "Mon-Fri, 2 PM - 9 PM",
      languages: ["Hindi", "English"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      name: "Dr. Kavita Joshi",
      specialty: "Stress Management",
      qualification: "M.A. Clinical Psychology, Stress Management Specialist",
      experience: "9 years",
      contact: "+91 54321 09876",
      email: "kavita.joshi@stresscare.com",
      location: "Laxmi Nagar, Nagpur",
      rating: 4.8,
      availability: "Mon-Sat, 9 AM - 5 PM",
      languages: ["Hindi", "English", "Marathi"],
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 6,
      name: "Dr. Rahul Mehta",
      specialty: "Career Guidance",
      qualification: "MBA, Certified Career Development Facilitator",
      experience: "7 years",
      contact: "+91 43210 98765",
      email: "rahul.mehta@careerpath.com",
      location: "Ramdaspeth, Nagpur",
      rating: 4.5,
      availability: "Tue-Sat, 1 PM - 8 PM",
      languages: ["Hindi", "English"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const specialties = ['all', 'Academic Counseling', 'Career Guidance', 'Mental Health', 'Study Skills', 'Stress Management'];

  const filteredCounselors = selectedSpecialty === 'all' 
    ? counselors 
    : counselors.filter(counselor => counselor.specialty === selectedSpecialty);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(emptyStars)}
      </div>
    );
  };

  return (
    <div className="counselor-page">
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #ffffff !important;
        }

        .counselor-page {
          min-height: 100vh;
          background: #ffffff;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
          color: #2c3e50;
          padding: 2rem 0;
          background: linear-gradient(135deg, #f8f9fc 0%, #e9ecef 100%);
          border-radius: 20px;
          margin-bottom: 3rem;
        }

        .header h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          color: #2c3e50;
          font-weight: 700;
        }

        .header p {
          font-size: 1.2rem;
          color: #6c757d;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .filter-section {
          background: #ffffff;
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;
          margin-bottom: 3rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 3rem;
        }

        .filter-section h3 {
          margin-bottom: 1.5rem;
          color: #2c3e50;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
        }

        .filter-btn {
          padding: 0.8rem 1.8rem;
          border: 2px solid #6c5ce7;
          background: #ffffff;
          color: #6c5ce7;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          box-shadow: 0 4px 15px rgba(108, 92, 231, 0.1);
        }

        .filter-btn:hover {
          background: #6c5ce7;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(108, 92, 231, 0.3);
        }

        .filter-btn.active {
          background: #6c5ce7;
          color: white;
          box-shadow: 0 8px 25px rgba(108, 92, 231, 0.3);
        }

        .counselors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .counselor-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 12px 40px rgba(0,0,0,0.08);
          border: 1px solid #e9ecef;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .counselor-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          border-color: #6c5ce7;
        }

        .counselor-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #6c5ce7, #a29bfe);
        }

        .counselor-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .counselor-image {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 1.5rem;
          border: 4px solid #f8f9fa;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .counselor-basic-info h3 {
          color: #2c3e50;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .specialty-tag {
          background: linear-gradient(135deg, #6c5ce7, #a29bfe);
          color: white;
          padding: 0.5rem 1.2rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-block;
        }

        .counselor-details {
          margin-bottom: 1.5rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.8rem 0;
          border-bottom: 1px solid #f1f3f4;
        }

        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .detail-label {
          font-weight: 600;
          color: #495057;
          font-size: 1rem;
        }

        .detail-value {
          color: #2c3e50;
          font-size: 1rem;
          font-weight: 500;
        }

        .rating-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stars {
          color: #ffd700;
          font-size: 1.1rem;
        }

        .rating-value {
          color: #2c3e50;
          font-weight: 600;
        }

        .languages {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .language-tag {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          color: #495057;
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid #dee2e6;
        }

        .contact-section {
          background: linear-gradient(135deg, #f8f9fc, #e9ecef);
          padding: 1.5rem;
          border-radius: 15px;
          margin-top: 1.5rem;
        }

        .contact-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .contact-btn {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .call-btn {
          background: linear-gradient(135deg, #00b894, #00cec9);
          color: white;
          box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3);
        }

        .call-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 184, 148, 0.4);
        }

        .email-btn {
          background: linear-gradient(135deg, #0984e3, #74b9ff);
          color: white;
          box-shadow: 0 4px 15px rgba(9, 132, 227, 0.3);
        }

        .email-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(9, 132, 227, 0.4);
        }

        .no-results {
          text-align: center;
          color: #6c757d;
          font-size: 1.3rem;
          margin-top: 3rem;
          padding: 3rem;
          background: #f8f9fa;
          border-radius: 20px;
          max-width: 600px;
          margin: 3rem auto;
        }

        @media (max-width: 768px) {
          .counselor-page {
            padding: 1rem;
          }

          .header h1 {
            font-size: 2rem;
          }

          .counselors-grid {
            grid-template-columns: 1fr;
          }

          .counselor-card {
            padding: 1.5rem;
          }

          .contact-buttons {
            flex-direction: column;
          }

          .filter-buttons {
            justify-content: center;
          }
        }
      `}</style>
<Navigation/>
      <div className="header">
        <h1>Student Counselors in Nagpur</h1>
        <p>Find qualified counselors to support your academic journey and personal growth</p>
      </div>

      <div className="filter-section">
        <h3>Filter by Specialty:</h3>
        <div className="filter-buttons">
          {specialties.map(specialty => (
            <button
              key={specialty}
              className={`filter-btn ${selectedSpecialty === specialty ? 'active' : ''}`}
              onClick={() => setSelectedSpecialty(specialty)}
            >
              {specialty === 'all' ? 'All Specialties' : specialty}
            </button>
          ))}
        </div>
      </div>

      {filteredCounselors.length > 0 ? (
        <div className="counselors-grid">
          {filteredCounselors.map(counselor => (
            <div key={counselor.id} className="counselor-card">
              <div className="counselor-header">
                <img 
                  src={counselor.image} 
                  alt={counselor.name}
                  className="counselor-image"
                />
                <div className="counselor-basic-info">
                  <h3>{counselor.name}</h3>
                  <div className="specialty-tag">{counselor.specialty}</div>
                </div>
              </div>

              <div className="counselor-details">
                <div className="detail-row">
                  <span className="detail-label">Qualification:</span>
                  <span className="detail-value">{counselor.qualification}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Experience:</span>
                  <span className="detail-value">{counselor.experience}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{counselor.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Rating:</span>
                  <div className="rating-container">
                    {renderStars(counselor.rating)}
                    <span className="rating-value">({counselor.rating})</span>
                  </div>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Availability:</span>
                  <span className="detail-value">{counselor.availability}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Languages:</span>
                  <div className="languages">
                    {counselor.languages.map(lang => (
                      <span key={lang} className="language-tag">{lang}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="contact-section">
                <div className="contact-buttons">
                  <button 
                    className="contact-btn call-btn"
                    onClick={() => window.location.href = `tel:${counselor.contact}`}
                  >
                    📞 Call Now
                  </button>
                  <button 
                    className="contact-btn email-btn"
                    onClick={() => window.location.href = `mailto:${counselor.email}`}
                  >
                    ✉️ Send Email
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          No counselors found for the selected specialty.
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default Counselor;