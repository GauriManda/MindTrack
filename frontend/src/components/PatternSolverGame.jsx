import React, { useState, useEffect, useRef } from 'react';

const PatternSolverGame = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [currentPattern, setCurrentPattern] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gameStats, setGameStats] = useState({
    totalAttempts: 0,
    correctAnswers: 0,
    averageTime: 0,
    sequentialErrors: 0,
    spatialErrors: 0
  });
  const [startTime, setStartTime] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedShape, setSelectedShape] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const generatePattern = (level) => {
    if (level <= 2) {
      return generateNumberSequence(level);
    } else {
      return generateShapePattern(level);
    }
  };

  const generateNumberSequence = (level) => {
    const length = Math.min(4 + level, 8);
    const increment = Math.floor(Math.random() * 3) + 1;
    const start = Math.floor(Math.random() * 10) + 1;
    
    const pattern = [];
    for(let i = 0; i < length; i++) {
      pattern.push(start + (i * increment));
    }
    
    return {
      pattern: pattern.slice(0, -1),
      answer: pattern[pattern.length - 1],
      type: 'sequence'
    };
  };

  const generateShapePattern = (level) => {
    const shapes = ['circle', 'square', 'triangle'];
    const colors = ['red', 'blue', 'green'];
    const length = Math.min(3 + Math.floor(level / 2), 6);
    
    const pattern = [];
    for(let i = 0; i < length; i++) {
      pattern.push({
        shape: shapes[i % shapes.length],
        color: colors[Math.floor(i / shapes.length) % colors.length]
      });
    }
    
    return {
      pattern: pattern.slice(0, -1),
      answer: pattern[pattern.length - 1],
      type: 'shape'
    };
  };

  const startGame = () => {
    setGameActive(true);
    setTimeLeft(30);
    setScore(0);
    setCurrentLevel(1);
    setGameStats({
      totalAttempts: 0,
      correctAnswers: 0,
      averageTime: 0,
      sequentialErrors: 0,
      spatialErrors: 0
    });
    generateNewPattern();
  };

  const generateNewPattern = () => {
    const pattern = generatePattern(currentLevel);
    setCurrentPattern(pattern);
    setUserInput('');
    setSelectedShape('');
    setSelectedColor('');
    setFeedback('');
    setStartTime(Date.now());
  };

  const submitAnswer = () => {
    if (!currentPattern.pattern) return;
    
    const responseTime = Date.now() - startTime;
    const newStats = { ...gameStats };
    newStats.totalAttempts++;
    
    let isCorrect = false;
    
    if (currentPattern.type === 'sequence') {
      isCorrect = parseInt(userInput) === currentPattern.answer;
      if (!isCorrect) newStats.sequentialErrors++;
    } else if (currentPattern.type === 'shape') {
      const correctAnswer = currentPattern.answer;
      isCorrect = selectedShape === correctAnswer.shape && selectedColor === correctAnswer.color;
      if (!isCorrect) newStats.spatialErrors++;
    }
    
    if (isCorrect) {
      setScore(score + (currentLevel * 10));
      setFeedback('🎉 Correct! Well done!');
      newStats.correctAnswers++;
      setCurrentLevel(currentLevel + 1);
    } else {
      setFeedback('❌ Not quite right. Try to find the pattern!');
    }
    
    newStats.averageTime = (newStats.averageTime * (newStats.totalAttempts - 1) + responseTime) / newStats.totalAttempts;
    setGameStats(newStats);
    
    setTimeout(() => {
      if (gameActive) generateNewPattern();
    }, 2000);
  };

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameActive(false);
      setShowAnalysis(true);
    }
  }, [gameActive, timeLeft]);

  const renderPattern = () => {
    if (!currentPattern.pattern) return null;

    if (currentPattern.type === 'sequence') {
      return (
        <div style={styles.patternDisplay}>
          <h3>Complete the Number Sequence:</h3>
          <div style={styles.sequenceContainer}>
            {currentPattern.pattern.map((num, index) => (
              <div key={index} style={styles.numberCard}>{num}</div>
            ))}
            <div style={styles.missingCard}>?</div>
          </div>
        </div>
      );
    } else if (currentPattern.type === 'shape') {
      return (
        <div style={styles.patternDisplay}>
          <h3>What Shape and Color Come Next?</h3>
          <div style={styles.shapeContainer}>
            {currentPattern.pattern.map((item, index) => (
              <div key={index} style={{
                ...styles.shape,
                backgroundColor: item.color,
                borderRadius: item.shape === 'circle' ? '50%' : '8px'
              }}>
                {item.shape === 'triangle' ? '▲' : ''}
              </div>
            ))}
            <div style={styles.missingShape}>?</div>
          </div>
        </div>
      );
    }
  };

  const canSubmit = () => {
    if (currentPattern.type === 'sequence') {
      return userInput.trim() !== '';
    } else if (currentPattern.type === 'shape') {
      return selectedShape !== '' && selectedColor !== '';
    }
    return false;
  };

  const getDysgraphiaAnalysis = () => {
    const accuracy = gameStats.totalAttempts > 0 ? (gameStats.correctAnswers / gameStats.totalAttempts) * 100 : 0;
    const avgResponseTime = gameStats.averageTime / 1000;
    
    let analysis = {
      overallRisk: 'Low',
      recommendations: [],
      strengths: [],
      concerns: []
    };
    
    if (accuracy < 50) {
      analysis.overallRisk = 'High';
      analysis.concerns.push('Low pattern recognition accuracy may indicate processing difficulties');
      analysis.recommendations.push('Practice with simpler patterns and gradually increase complexity');
    } else if (accuracy < 70) {
      analysis.overallRisk = 'Moderate';
      analysis.concerns.push('Moderate difficulty with pattern recognition');
    } else {
      analysis.strengths.push('Good pattern recognition abilities');
    }
    
    if (avgResponseTime > 8) {
      analysis.concerns.push('Slower processing speed may indicate difficulties with visual-motor integration');
      analysis.recommendations.push('Practice timed exercises to improve processing speed');
      if (analysis.overallRisk === 'Low') analysis.overallRisk = 'Moderate';
    } else if (avgResponseTime < 3) {
      analysis.strengths.push('Quick processing and response time');
    }
    
    const spatialErrorRate = gameStats.totalAttempts > 0 ? (gameStats.spatialErrors / gameStats.totalAttempts) * 100 : 0;
    const sequentialErrorRate = gameStats.totalAttempts > 0 ? (gameStats.sequentialErrors / gameStats.totalAttempts) * 100 : 0;
    
    if (spatialErrorRate > 40) {
      analysis.concerns.push('Difficulty with spatial relationships and visual coordination');
      analysis.recommendations.push('Focus on spatial awareness exercises');
    }
    
    if (sequentialErrorRate > 40) {
      analysis.concerns.push('Challenges with sequential processing');
      analysis.recommendations.push('Practice sequence-based activities');
    }
    
    if (analysis.concerns.length >= 2) {
      analysis.overallRisk = analysis.concerns.length >= 3 ? 'High' : 'Moderate';
    }
    
    return analysis;
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '2.5rem',
      color: '#333',
      marginBottom: '10px'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#666'
    },
    gameStats: {
      display: 'flex',
      justifyContent: 'space-around',
      marginBottom: '20px',
      backgroundColor: 'white',
      padding: '15px',
      borderRadius: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    statCard: {
      textAlign: 'center'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '5px'
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#333'
    },
    gameArea: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    },
    patternDisplay: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    sequenceContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap',
      marginTop: '20px'
    },
    numberCard: {
      width: '60px',
      height: '60px',
      backgroundColor: '#4CAF50',
      color: 'white',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    missingCard: {
      width: '60px',
      height: '60px',
      backgroundColor: '#ddd',
      color: '#999',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      border: '2px dashed #999'
    },
    shapeContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap',
      marginTop: '20px'
    },
    shape: {
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      color: 'white',
      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
    },
    missingShape: {
      width: '60px',
      height: '60px',
      backgroundColor: '#ddd',
      color: '#999',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      border: '2px dashed #999'
    },
    inputContainer: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    numberInput: {
      padding: '15px',
      fontSize: '1.2rem',
      borderRadius: '8px',
      border: '2px solid #ddd',
      textAlign: 'center',
      width: '200px'
    },
    shapeInputContainer: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    inputGroup: {
      marginBottom: '20px'
    },
    inputLabel: {
      display: 'block',
      marginBottom: '10px',
      fontSize: '1.1rem',
      fontWeight: 'bold'
    },
    optionsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      flexWrap: 'wrap'
    },
    optionButton: {
      padding: '10px 20px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    optionButtonSelected: {
      padding: '10px 20px',
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      backgroundColor: '#e8f5e8',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    submitButton: {
      padding: '15px 30px',
      fontSize: '1.2rem',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    submitButtonDisabled: {
      padding: '15px 30px',
      fontSize: '1.2rem',
      backgroundColor: '#ccc',
      color: '#666',
      border: 'none',
      borderRadius: '8px',
      cursor: 'not-allowed'
    },
    startButton: {
      padding: '20px 40px',
      fontSize: '1.5rem',
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer'
    },
    feedback: {
      textAlign: 'center',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginTop: '15px',
      minHeight: '30px'
    },
    startScreen: {
      textAlign: 'center',
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    analysisContainer: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    riskIndicator: {
      textAlign: 'center',
      padding: '20px',
      borderRadius: '8px',
      fontSize: '1.3rem',
      fontWeight: 'bold',
      marginBottom: '30px'
    },
    riskLow: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    riskModerate: {
      backgroundColor: '#fff3cd',
      color: '#856404'
    },
    riskHigh: {
      backgroundColor: '#f8d7da',
      color: '#721c24'
    },
    perfGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
      marginBottom: '30px'
    },
    perfCard: {
      backgroundColor: '#f8f9fa',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center'
    },
    analysisSection: {
      marginBottom: '25px'
    },
    sectionTitle: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: '#333'
    },
    analysisList: {
      listStyle: 'none',
      padding: '0'
    },
    analysisItem: {
      backgroundColor: '#f8f9fa',
      padding: '15px',
      marginBottom: '10px',
      borderRadius: '8px',
      borderLeft: '4px solid #007bff'
    },
    disclaimer: {
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#e9ecef',
      borderRadius: '8px',
      fontSize: '0.9rem',
      lineHeight: '1.5'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🧩 Pattern Solver</h1>
        <p style={styles.subtitle}>Challenge your mind with pattern recognition</p>
      </div>
      
      {!gameActive && !showAnalysis && (
        <div style={styles.startScreen}>
          <h2>Ready for the Challenge?</h2>
          <p style={{marginBottom: '30px'}}>
            Solve number sequences and shape patterns to test your cognitive abilities.
          </p>
          <button style={styles.startButton} onClick={startGame}>
            Start Game
          </button>
        </div>
      )}
      
      {gameActive && (
        <>
          <div style={styles.gameStats}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Score</div>
              <div style={styles.statValue}>{score}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Level</div>
              <div style={styles.statValue}>{currentLevel}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Time Left</div>
              <div style={{...styles.statValue, color: timeLeft <= 10 ? 'red' : '#333'}}>
                {timeLeft}s
              </div>
            </div>
          </div>
          
          <div style={styles.gameArea}>
            {renderPattern()}
            
            <div style={styles.inputContainer}>
              {currentPattern.type === 'sequence' ? (
                <input
                  type="number"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter the next number"
                  style={styles.numberInput}
                />
              ) : currentPattern.type === 'shape' ? (
                <div style={styles.shapeInputContainer}>
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>Select Shape:</label>
                    <div style={styles.optionsContainer}>
                      {['circle', 'square', 'triangle'].map(shape => (
                        <button
                          key={shape}
                          style={selectedShape === shape ? styles.optionButtonSelected : styles.optionButton}
                          onClick={() => setSelectedShape(shape)}
                        >
                          {shape}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>Select Color:</label>
                    <div style={styles.optionsContainer}>
                      {['red', 'blue', 'green'].map(color => (
                        <button
                          key={color}
                          style={selectedColor === color ? styles.optionButtonSelected : styles.optionButton}
                          onClick={() => setSelectedColor(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              
              <div style={{marginTop: '20px'}}>
                <button 
                  style={canSubmit() ? styles.submitButton : styles.submitButtonDisabled}
                  onClick={submitAnswer}
                  disabled={!canSubmit()}
                >
                  Submit Answer
                </button>
              </div>
            </div>
            
            <div style={styles.feedback}>{feedback}</div>
          </div>
        </>
      )}
      
      {showAnalysis && (
        <div style={styles.analysisContainer}>
          <h2 style={{textAlign: 'center', marginBottom: '30px'}}>📊 Analysis Report</h2>
          
          <div style={{
            ...styles.riskIndicator,
            ...(getDysgraphiaAnalysis().overallRisk === 'Low' ? styles.riskLow :
                getDysgraphiaAnalysis().overallRisk === 'Moderate' ? styles.riskModerate : styles.riskHigh)
          }}>
            Overall Assessment: {getDysgraphiaAnalysis().overallRisk} Risk Level
          </div>
          
          <div style={styles.perfGrid}>
            <div style={styles.perfCard}>
              <div style={styles.statLabel}>Total Attempts</div>
              <div style={styles.statValue}>{gameStats.totalAttempts}</div>
            </div>
            <div style={styles.perfCard}>
              <div style={styles.statLabel}>Accuracy</div>
              <div style={styles.statValue}>
                {gameStats.totalAttempts > 0 ? Math.round((gameStats.correctAnswers / gameStats.totalAttempts) * 100) : 0}%
              </div>
            </div>
            <div style={styles.perfCard}>
              <div style={styles.statLabel}>Avg Time</div>
              <div style={styles.statValue}>{(gameStats.averageTime / 1000).toFixed(1)}s</div>
            </div>
            <div style={styles.perfCard}>
              <div style={styles.statLabel}>Final Score</div>
              <div style={styles.statValue}>{score}</div>
            </div>
          </div>
          
          {getDysgraphiaAnalysis().strengths.length > 0 && (
            <div style={styles.analysisSection}>
              <h3 style={styles.sectionTitle}>✨ Strengths</h3>
              <ul style={styles.analysisList}>
                {getDysgraphiaAnalysis().strengths.map((strength, index) => (
                  <li key={index} style={styles.analysisItem}>{strength}</li>
                ))}
              </ul>
            </div>
          )}
          
          {getDysgraphiaAnalysis().concerns.length > 0 && (
            <div style={styles.analysisSection}>
              <h3 style={styles.sectionTitle}>⚠️ Areas of Concern</h3>
              <ul style={styles.analysisList}>
                {getDysgraphiaAnalysis().concerns.map((concern, index) => (
                  <li key={index} style={styles.analysisItem}>{concern}</li>
                ))}
              </ul>
            </div>
          )}
          
          {getDysgraphiaAnalysis().recommendations.length > 0 && (
            <div style={styles.analysisSection}>
              <h3 style={styles.sectionTitle}>💡 Recommendations</h3>
              <ul style={styles.analysisList}>
                {getDysgraphiaAnalysis().recommendations.map((rec, index) => (
                  <li key={index} style={styles.analysisItem}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div style={{textAlign: 'center', marginTop: '30px'}}>
            <button 
              style={styles.startButton}
              onClick={() => {
                setShowAnalysis(false);
                setGameActive(false);
              }}
            >
              Play Again
            </button>
          </div>
          
          <div style={styles.disclaimer}>
            <strong>Important:</strong> This analysis is for educational purposes only and should not replace professional medical or educational assessment. For comprehensive evaluation of learning difficulties, please consult with qualified professionals.
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternSolverGame;