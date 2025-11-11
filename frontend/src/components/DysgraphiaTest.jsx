
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DysgraphiaTest = ({ teacherData, selectedChild = null, onTestComplete, isRetest = false }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Child registration states
  const [showChildForm, setShowChildForm] = useState(!isRetest && !selectedChild);
  const [childData, setChildData] = useState({
    childName: '',
    age: '',
    grade: '',
    school: teacherData?.school || '',
    parentName: '',
    parentEmail: '',
    parentPhone: ''
  });
  const [registeredChild, setRegisteredChild] = useState(null);

  // Pre-populate data if it's a retest or selected child
  useEffect(() => {
    if (selectedChild) {
      setChildData({
        childName: selectedChild.childName,
        age: selectedChild.age.toString(),
        grade: selectedChild.grade,
        school: selectedChild.school || teacherData?.school || '',
        parentName: selectedChild.parentName || '',
        parentEmail: selectedChild.parentEmail || '',
        parentPhone: selectedChild.parentPhone || ''
      });
      
      setRegisteredChild({
        childId: selectedChild.childId,
        childName: selectedChild.childName,
        age: selectedChild.age,
        grade: selectedChild.grade
      });
      
      setShowChildForm(false);
    } else {
      // Reset for new registration
      setChildData({
        childName: '',
        age: '',
        grade: '',
        school: teacherData?.school || '',
        parentName: '',
        parentEmail: '',
        parentPhone: ''
      });
      setRegisteredChild(null);
      setShowChildForm(!isRetest);
    }
    
    // Reset test states
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }, [selectedChild, isRetest, teacherData]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (PNG, JPEG, JPG, or GIF)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setResult(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChildRegistration = async (e) => {
    e.preventDefault();
    
    if (!childData.childName || !childData.age) {
      setError('Child name and age are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate unique child ID
      const timestamp = Date.now();
      const childId = `C${timestamp.toString().slice(-6)}`;
      
      // Register child
      const registrationData = {
        childId,
        childName: childData.childName,
        age: parseInt(childData.age),
        grade: childData.grade,
        school: childData.school,
        teacherId: teacherData?.teacherId,
        teacherName: teacherData?.teacherName,
        parentName: childData.parentName,
        parentEmail: childData.parentEmail,
        parentPhone: childData.parentPhone,
        registrationDate: new Date().toISOString()
      };

      const response = await axios.post(
        'http://localhost:5000/api/register-child',
        registrationData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        }
      );

      if (response.data.success) {
        setRegisteredChild({
          childId,
          childName: childData.childName,
          age: parseInt(childData.age),
          grade: childData.grade
        });
        setShowChildForm(false);
        
        // Call the callback to refresh parent component data
        if (onTestComplete) {
          onTestComplete();
        }
      } else {
        setError(response.data.message || 'Failed to register child');
      }
    } catch (err) {
      console.error('Child registration error:', err);
      if (err.response) {
        setError(err.response.data.message || 'Server error occurred');
      } else if (err.request) {
        setError('Network error: Unable to reach server');
      } else {
        setError('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    if (!registeredChild) {
      setError('Please register a child first or select an existing child');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      // Add child and test information
      formData.append('childId', registeredChild.childId);
      formData.append('childName', registeredChild.childName);
      formData.append('teacherId', teacherData?.teacherId);
      formData.append('isRetest', (isRetest || false).toString());
      const response = await axios.post('http://localhost:5000/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      // Store the test result with child information
      if (response.data) {
        const testResult = {
          ...response.data,
          childId: registeredChild.childId,
          childName: registeredChild.childName,
          teacherId: teacherData?.teacherId,
          teacherName: teacherData?.teacherName,
          testDate: new Date().toISOString(),
          isRetest: isRetest
        };

        // Save test result
        await axios.post('http://localhost:5000/api/save-test-result', testResult);
        
        // Call the callback to refresh parent component data
        if (onTestComplete) {
          onTestComplete();
        }
      }

      setResult(response.data);
    } catch (err) {
      console.error('Prediction error:', err);
      
      if (err.response) {
        setError(`Server error: ${err.response.data.error || 'Unknown error'}`);
      } else if (err.request) {
        setError('Network error: Unable to connect to the server');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    
    if (!isRetest && !selectedChild) {
      setRegisteredChild(null);
      setShowChildForm(true);
      setChildData({
        childName: '',
        age: '',
        grade: '',
        school: teacherData?.school || '',
        parentName: '',
        parentEmail: '',
        parentPhone: ''
      });
    }
    
    if (document.getElementById('image-upload')) {
      document.getElementById('image-upload').value = '';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#06ffa5';
    if (confidence >= 0.6) return '#ffa726';
    return '#ff6b6b';
  };

  return (
    <div>
      <div className="container">
        <div className="card">
          <h1 className="title">
            {isRetest ? `Dysgraphia Retest - ${registeredChild?.childName || 'Student'}` : 'Dysgraphia Detection Test'}
          </h1>
          <p className="subtitle">
            {isRetest 
              ? `Conducting a follow-up assessment for ${registeredChild?.childName}`
              : 'Register a new child and upload their handwriting sample for AI-powered dysgraphia assessment'
            }
          </p>

          {/* Show previous test results if it's a retest */}
          {isRetest && selectedChild && selectedChild.testResults && selectedChild.testResults.length > 0 && (
            <div className="card" style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', marginBottom: '20px' }}>
              <h3 style={{ color: '#2196f3', marginBottom: '15px' }}>📊 Previous Test Results</h3>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {selectedChild.testResults.slice(-3).map((test, index) => (
                  <div key={index} style={{
                    padding: '10px 15px',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #bbdefb',
                    minWidth: '150px'
                  }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: test.result === 'Dysgraphic' ? '#c62828' : '#2e7d32',
                      marginBottom: '5px' 
                    }}>
                      {test.result || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(test.testDate).toLocaleDateString()}
                    </div>
                    {test.confidence && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        Confidence: {(test.confidence * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Child Registration Section - only show for new registrations */}
          {!isRetest && (
            <div className="card" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: '#4caf50', margin: '0' }}>👶 Child Information</h3>
                {!registeredChild && (
                  <button
                    type="button"
                    onClick={() => setShowChildForm(!showChildForm)}
                    style={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {showChildForm ? 'Cancel' : '+ Register New Child'}
                  </button>
                )}
              </div>

              {registeredChild && (
                <div style={{
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px solid #4caf50'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>
                    ✅ {isRetest ? 'Testing Child' : 'Child Registered'}: {registeredChild.childName}
                  </h4>
                  <p style={{ margin: '0', color: '#666' }}>
                    ID: {registeredChild.childId} | Age: {registeredChild.age} | Grade: {registeredChild.grade}
                  </p>
                  {!isRetest && (
                    <button
                      onClick={() => {
                        setRegisteredChild(null);
                        setShowChildForm(true);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#4caf50',
                        border: '1px solid #4caf50',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px',
                        fontSize: '12px'
                      }}
                    >
                      Register Different Child
                    </button>
                  )}
                </div>
              )}

              {showChildForm && !registeredChild && (
                <form onSubmit={handleChildRegistration} style={{ marginTop: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                        Child Name *
                      </label>
                      <input
                        type="text"
                        value={childData.childName}
                        onChange={(e) => setChildData({...childData, childName: e.target.value})}
                        placeholder="Enter child's full name"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                        Age *
                      </label>
                      <input
                        type="number"
                        value={childData.age}
                        onChange={(e) => setChildData({...childData, age: e.target.value})}
                        placeholder="Age"
                        min="3"
                        max="18"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                        Grade
                      </label>
                      <input
                        type="text"
                        value={childData.grade}
                        onChange={(e) => setChildData({...childData, grade: e.target.value})}
                        placeholder="e.g., 3rd, 4th"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>
                        School
                      </label>
                      <input
                        type="text"
                        value={childData.school}
                        onChange={(e) => setChildData({...childData, school: e.target.value})}
                        placeholder="School name"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: '#666', marginBottom: '10px' }}>Parent/Guardian Information (Optional)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                      <input
                        type="text"
                        value={childData.parentName}
                        onChange={(e) => setChildData({...childData, parentName: e.target.value})}
                        placeholder="Parent name"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <input
                        type="email"
                        value={childData.parentEmail}
                        onChange={(e) => setChildData({...childData, parentEmail: e.target.value})}
                        placeholder="Parent email"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <input
                        type="tel"
                        value={childData.parentPhone}
                        onChange={(e) => setChildData({...childData, parentPhone: e.target.value})}
                        placeholder="Parent phone"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Registering...' : 'Register Child'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* For retests, show current child info */}
          {isRetest && registeredChild && (
            <div className="card" style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', marginBottom: '20px' }}>
              <h3 style={{ color: '#2196f3', margin: '0 0 15px 0' }}>👶 Current Test Subject</h3>
              <div style={{
                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #2196f3'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>
                  📝 Retesting: {registeredChild.childName}
                </h4>
                <p style={{ margin: '0', color: '#666' }}>
                  ID: {registeredChild.childId} | Age: {registeredChild.age} | Grade: {registeredChild.grade}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="card" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
            <h3 style={{ color: '#667eea', marginBottom: '15px' }}>📋 Instructions</h3>
            <ul style={{ color: '#666', lineHeight: '1.8' }}>
              {!isRetest && <li>First register the child whose handwriting you want to test</li>}
              <li>Take a clear photo or scan of the child's handwriting sample</li>
              <li>Ensure good lighting and minimal shadows</li>
              <li>Use a contrasting background (white paper recommended)</li>
              <li>Include at least 2-3 lines of text for accurate analysis</li>
              <li>Supported formats: PNG, JPEG, JPG, GIF (max 10MB)</li>
              {isRetest && <li>Compare results with previous assessments for progress tracking</li>}
            </ul>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Upload Handwriting Sample</label>
              <div className="file-input-container">
                <input
                  type="file"
                  id="image-upload"
                  className="file-input"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={!registeredChild}
                />
                <label 
                  htmlFor="image-upload" 
                  className="file-input-label"
                  style={{ 
                    opacity: !registeredChild ? 0.5 : 1,
                    cursor: !registeredChild ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📎</div>
                  <div>
                    {!registeredChild 
                      ? (isRetest ? 'Loading student data...' : 'Please register a child first')
                      : selectedFile 
                        ? `Selected: ${selectedFile.name}` 
                        : 'Click to select or drag & drop an image'
                    }
                  </div>
                  <div style={{ fontSize: '0.9rem', marginTop: '10px', opacity: '0.7' }}>
                    PNG, JPEG, JPG, GIF (Max 10MB)
                  </div>
                </label>
              </div>
            </div>

            {/* Image Preview */}
            {preview && (
              <div className="form-group">
                <label className="form-label">Preview</label>
                <div style={{ 
                  border: '2px solid #e0e0e0', 
                  borderRadius: '12px', 
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: '#f9f9f9'
                }}>
                  <img 
                    src={preview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '400px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="form-group" style={{ textAlign: 'center' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading || !selectedFile || !registeredChild}
                style={{ 
                  opacity: (loading || !selectedFile || !registeredChild) ? 0.6 : 1,
                  cursor: (loading || !selectedFile || !registeredChild) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ 
                      width: '20px', 
                      height: '20px', 
                      marginRight: '10px',
                      display: 'inline-block'
                    }}></span>
                    Analyzing...
                  </>
                ) : (
                  `🔍 ${isRetest ? 'Analyze Retest' : 'Analyze Handwriting'}`
                )}
              </button>
              
              {selectedFile && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetTest}
                  style={{ marginLeft: '15px' }}
                >
                  🔄 Reset
                </button>
              )}
            </div>
          </form>

          {/* Results */}
          {result && registeredChild && (
            <div className="card" style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#667eea', marginBottom: '20px', textAlign: 'center' }}>
                📊 {isRetest ? 'Retest' : 'Analysis'} Results for {registeredChild.childName}
              </h3>
              
              <div className={`prediction-result ${result.prediction.toLowerCase().replace('-', '-')}`}>
                <div style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
                  {result.prediction === 'Dysgraphic' ? '⚠️' : '✅'} 
                  {result.prediction}
                </div>
                
                <div style={{ fontSize: '1rem', marginBottom: '15px', opacity: '0.9' }}>
                  Confidence: {(result.confidence * 100).toFixed(1)}%
                </div>
                
                <div className="confidence-meter">
                  <div 
                    className="confidence-bar"
                    style={{ 
                      width: `${result.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(result.confidence)
                    }}
                  ></div>
                </div>
                
                {result.interpretation && (
                  <div style={{ 
                    marginTop: '20px', 
                    fontSize: '1rem', 
                    fontWeight: 'normal',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '15px',
                    borderRadius: '10px'
                  }}>
                    <strong>Interpretation:</strong> {result.interpretation}
                  </div>
                )}
              </div>

              {/* Child-specific recommendations */}
              <div className="card" style={{ 
                marginTop: '20px', 
                backgroundColor: 'rgba(102, 126, 234, 0.1)' 
              }}>
                <h4 style={{ color: '#667eea', marginBottom: '15px' }}>
                  💡 {isRetest ? 'Updated' : ''} Recommendations for {registeredChild.childName}
                </h4>
                
                {result.prediction === 'Dysgraphic' ? (
                  <ul style={{ color: '#666', lineHeight: '1.8' }}>
                    <li>Share results with {registeredChild.childName}'s parents/guardians</li>
                    <li>Consider referral for educational assessment and support</li>
                    <li>Implement classroom accommodations (extra time, alternative assessment methods)</li>
                    <li>Explore assistive technologies and adaptive writing tools</li>
                    <li>Consider occupational therapy consultation</li>
                    <li>Monitor progress and provide regular encouragement</li>
                    {isRetest && <li>Compare with previous results to track progress over time</li>}
                  </ul>
                ) : (
                  <ul style={{ color: '#666', lineHeight: '1.8' }}>
                    <li>Handwriting appears within normal range for age {registeredChild.age}</li>
                    <li>Continue supporting {registeredChild.childName}'s writing development</li>
                    <li>Maintain regular handwriting practice</li>
                    <li>Encourage proper posture and grip when writing</li>
                    <li>Continue monitoring progress over time</li>
                    {isRetest && <li>Results show positive development since last assessment</li>}
                  </ul>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ textAlign: 'center', marginTop: '25px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={resetTest}
                >
                  🔄 {isRetest ? 'Test Again' : 'Test Another Child'}
                </button>
                {!isRetest && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      // Retest the same child
                      resetTest();
                    }}
                    style={{ marginLeft: '15px' }}
                  >
                    📝 Retest Same Child
                  </button>
                )}
                <Link 
                  to="/memorygame" 
                  className="btn btn-secondary"
                  style={{ marginLeft: '15px' }}
                >
                  🎮 Try Training Games
                </Link>
              </div>
            </div>
          )}
          {/* Additional Information */}
          <div className="card" style={{ 
            marginTop: '40px', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)' 
          }}>
            <h3 style={{ color: '#667eea', marginBottom: '20px' }}>
              ℹ️ About This Test
            </h3>
            <div className="grid grid-2">
              <div>
                <h4 style={{ marginBottom: '10px' }}>What is Dysgraphia?</h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Dysgraphia is a learning disability that affects writing abilities. 
                  It can impact handwriting, spelling, and the ability to put thoughts 
                  on paper. Our AI system analyzes various features including stroke 
                  consistency, letter spacing, and alignment.
                </p>
              </div>
              <div>
                <h4 style={{ marginBottom: '10px' }}>How It Works</h4>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Our system uses advanced machine learning to analyze handwriting 
                  samples. It extracts multiple features from the image and combines 
                  them with deep learning techniques to provide accurate assessments. 
                  This is a screening tool and not a medical diagnosis.
                </p>
              </div>
            </div>
            
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              borderRadius: '10px',
              borderLeft: '4px solid #ffc107'
            }}>
              <strong style={{ color: '#856404' }}>Disclaimer:</strong>
              <span style={{ color: '#666', marginLeft: '5px' }}>
                This tool provides preliminary screening results only. For definitive 
                diagnosis and treatment recommendations, please consult with qualified 
                healthcare professionals or educational specialists.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DysgraphiaTest;