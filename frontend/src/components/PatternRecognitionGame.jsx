import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

const PatternRecognitionGame = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPattern, setCurrentPattern] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [responseData, setResponseData] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/parent-dashboard');  
  };
  const NavigationHeader = () => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '20px',
      padding: '10px 0',
      borderBottom: '1px solid #dee2e6'
    }}>
      <button
        onClick={handleBackToDashboard}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
    </div>
  );


  // Pattern types for different cognitive assessments
  const patterns = {
    1: { // Visual sequence completion
      pattern: ['🔴', '🔵', '🔴', '🔵', '🔴', '?'],
      correct: '🔵',
      options: ['🔵', '🔴', '🟡', '🟢'],
      type: 'sequence'
    },
    2: { // Shape pattern
      pattern: ['△', '□', '△', '□', '△', '?'],
      correct: '□',
      options: ['□', '△', '○', '⬟'],
      type: 'sequence'
    },
    3: { // Number sequence
      pattern: ['2', '4', '6', '8', '?'],
      correct: '10',
      options: ['10', '9', '12', '7'],
      type: 'numerical'
    },
    4: { // Complex visual pattern
      pattern: ['🌟⭐', '⭐🌟', '🌟⭐', '⭐🌟', '?'],
      correct: '🌟⭐',
      options: ['🌟⭐', '⭐🌟', '🌟🌟', '⭐⭐'],
      type: 'complex'
    },
    5: { // Size progression
      pattern: ['●', '◐', '○', '●', '◐', '?'],
      correct: '○',
      options: ['○', '●', '◐', '◑'],
      type: 'visual'
    },
    6: { // Directional arrows
      pattern: ['→', '↑', '←', '↓', '→', '?'],
      correct: '↑',
      options: ['↑', '→', '↓', '←'],
      type: 'directional'
    },
    7: { // Letter sequence
      pattern: ['A', 'B', 'C', 'D', '?'],
      correct: 'E',
      options: ['E', 'F', 'C', 'B'],
      type: 'alphabetical'
    },
    8: { // Complex number pattern
      pattern: ['1', '1', '2', '3', '5', '?'],
      correct: '8',
      options: ['8', '7', '6', '9'],
      type: 'fibonacci'
    }
  };

  useEffect(() => {
    if (gameStarted && !gameComplete) {
      setStartTime(Date.now());
    }
  }, [currentLevel, gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setGameComplete(false);
    setScore(0);
    setCurrentLevel(1);
    setResponseData([]);
    loadLevel(1);
  };

  const loadLevel = (level) => {
    if (level > 8) {
      completeGame();
      return;
    }

    const patternData = patterns[level];
    setCurrentPattern(patternData.pattern);
    setOptions(shuffleArray([...patternData.options]));
    setCorrectAnswer(patternData.correct);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswer = (answer) => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const isCorrect = answer === correctAnswer;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    // Store response data for analysis
    const responseEntry = {
      level: currentLevel,
      patternType: patterns[currentLevel].type,
      correct: isCorrect,
      responseTime: responseTime,
      selectedAnswer: answer,
      correctAnswer: correctAnswer
    };

    setResponseData(prev => [...prev, responseEntry]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setCurrentLevel(prev => prev + 1);
      loadLevel(currentLevel + 1);
    }, 2000);
  };

  const completeGame = () => {
    setGameComplete(true);
    calculateAnalysis();
  };

  const calculateAnalysis = () => {
    // This will be used for the analysis display
  };

  const getAnalysis = () => {
    if (responseData.length === 0) return null;

    const totalQuestions = responseData.length;
    const correctAnswers = responseData.filter(r => r.correct).length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    const avgResponseTime = responseData.reduce((sum, r) => sum + r.responseTime, 0) / totalQuestions;
    
    const patternTypeAccuracy = {};
    const patternTypeAvgTime = {};
    
    responseData.forEach(response => {
      const type = response.patternType;
      if (!patternTypeAccuracy[type]) {
        patternTypeAccuracy[type] = { correct: 0, total: 0 };
        patternTypeAvgTime[type] = { totalTime: 0, count: 0 };
      }
      
      patternTypeAccuracy[type].total++;
      patternTypeAvgTime[type].count++;
      patternTypeAvgTime[type].totalTime += response.responseTime;
      
      if (response.correct) {
        patternTypeAccuracy[type].correct++;
      }
    });

    return {
      overallAccuracy: accuracy,
      averageResponseTime: avgResponseTime,
      patternTypeAccuracy,
      patternTypeAvgTime,
      totalQuestions,
      correctAnswers
    };
  };

  const getDysgraphiaInsights = (analysis) => {
    if (!analysis) return [];
    
    const insights = [];
    
    // Response time analysis
    if (analysis.averageResponseTime > 8000) {
      insights.push("⚠️ Extended processing time observed - may indicate visual-spatial processing challenges");
    } else if (analysis.averageResponseTime < 3000) {
      insights.push("✓ Quick response times suggest good pattern recognition speed");
    }
    
    // Accuracy analysis
    if (analysis.overallAccuracy < 50) {
      insights.push("⚠️ Lower accuracy in pattern recognition - may suggest difficulties with visual sequencing");
    } else if (analysis.overallAccuracy >= 75) {
      insights.push("✓ Strong pattern recognition abilities demonstrated");
    }
    
    // Pattern-specific analysis
    const { patternTypeAccuracy } = analysis;
    
    Object.keys(patternTypeAccuracy).forEach(type => {
      const typeData = patternTypeAccuracy[type];
      const typeAccuracy = (typeData.correct / typeData.total) * 100;
      
      if (type === 'sequence' && typeAccuracy < 50) {
        insights.push("⚠️ Difficulty with sequential patterns - common in dysgraphia");
      }
      if (type === 'directional' && typeAccuracy < 50) {
        insights.push("⚠️ Challenges with directional patterns - may relate to spatial orientation difficulties");
      }
      if (type === 'alphabetical' && typeAccuracy < 50) {
        insights.push("⚠️ Letter sequence difficulties observed - relevant to writing challenges");
      }
    });

    if (insights.length === 0) {
      insights.push("✓ Performance within typical ranges across all pattern types");
    }

    return insights;
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#2c3e50'
    },
    title: {
      fontSize: '28px',
      marginBottom: '10px',
      color: '#34495e'
    },
    subtitle: {
      fontSize: '16px',
      color: '#7f8c8d',
      marginBottom: '20px'
    },
    gameArea: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    },
    patternContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '30px',
      gap: '15px',
      flexWrap: 'wrap'
    },
    patternItem: {
      fontSize: '32px',
      padding: '15px',
      backgroundColor: '#ecf0f1',
      borderRadius: '8px',
      minWidth: '60px',
      textAlign: 'center',
      border: '2px solid #bdc3c7'
    },
    questionMark: {
      backgroundColor: '#e74c3c',
      color: 'white',
      fontWeight: 'bold'
    },
    optionsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    },
    option: {
      fontSize: '24px',
      padding: '20px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center'
    },
    optionHover: {
      backgroundColor: '#2980b9',
      transform: 'scale(1.05)'
    },
    selectedCorrect: {
      backgroundColor: '#27ae60',
      transform: 'scale(1.1)'
    },
    selectedIncorrect: {
      backgroundColor: '#e74c3c',
      transform: 'scale(1.1)'
    },
    startButton: {
      fontSize: '18px',
      padding: '15px 30px',
      backgroundColor: '#2ecc71',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'block',
      margin: '0 auto'
    },
    progressBar: {
      width: '100%',
      height: '20px',
      backgroundColor: '#ecf0f1',
      borderRadius: '10px',
      overflow: 'hidden',
      marginBottom: '20px'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#3498db',
      transition: 'width 0.3s ease'
    },
    scoreDisplay: {
      textAlign: 'center',
      fontSize: '18px',
      marginBottom: '20px',
      color: '#2c3e50'
    },
    analysisContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginTop: '20px'
    },
    analysisTitle: {
      fontSize: '24px',
      marginBottom: '20px',
      color: '#2c3e50',
      textAlign: 'center'
    },
    metric: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #ecf0f1'
    },
    insightsList: {
      listStyle: 'none',
      padding: '0'
    },
    insightItem: {
      padding: '10px 0',
      fontSize: '16px',
      lineHeight: '1.5'
    }
  };

  if (!gameStarted) {
    return (
      
      <div style={styles.container}>
         <NavigationHeader />  
        <div style={styles.header}>
          <h1 style={styles.title}>Pattern Recognition Assessment</h1>
          <p style={styles.subtitle}>
            This game assesses visual-spatial processing and pattern recognition skills
            that are relevant to understanding cognitive patterns associated with dysgraphia.
          </p>
        </div>
        <div style={styles.gameArea}>
          <p style={{ textAlign: 'center', marginBottom: '30px', fontSize: '16px', color: '#555' }}>
            You will be shown 8 different pattern types including sequences, shapes, numbers, and directions. 
            Complete each pattern by selecting the correct answer from the options provided.
          </p>
          <button style={styles.startButton} onClick={startGame}>
            Start Assessment
          </button>
        </div>
        </div>
       
    );
  }

  if (gameComplete) {
    const analysis = getAnalysis();
    const insights = getDysgraphiaInsights(analysis);

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Assessment Complete!</h1>
        </div>
        
        <div style={styles.analysisContainer}>
          <h2 style={styles.analysisTitle}>Performance Analysis</h2>
          
          <div style={styles.metric}>
            <span><strong>Overall Accuracy:</strong></span>
            <span>{analysis.overallAccuracy.toFixed(1)}% ({analysis.correctAnswers}/{analysis.totalQuestions})</span>
          </div>
          
          <div style={styles.metric}>
            <span><strong>Average Response Time:</strong></span>
            <span>{(analysis.averageResponseTime / 1000).toFixed(1)} seconds</span>
          </div>
          
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Pattern Type Performance:</h3>
            {Object.keys(analysis.patternTypeAccuracy).map(type => {
              const typeData = analysis.patternTypeAccuracy[type];
              const accuracy = (typeData.correct / typeData.total) * 100;
              const avgTime = analysis.patternTypeAvgTime[type].totalTime / analysis.patternTypeAvgTime[type].count;
              
              return (
                <div key={type} style={styles.metric}>
                  <span><strong>{type.charAt(0).toUpperCase() + type.slice(1)}:</strong></span>
                  <span>{accuracy.toFixed(0)}% ({(avgTime/1000).toFixed(1)}s avg)</span>
                </div>
              );
            })}
          </div>
          
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '15px' }}>Cognitive Insights:</h3>
            <ul style={styles.insightsList}>
              {insights.map((insight, index) => (
                <li key={index} style={styles.insightItem}>{insight}</li>
              ))}
            </ul>
          </div>
          
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#2c3e50', lineHeight: '1.6' }}>
              <strong>Note:</strong> This assessment provides insights into pattern recognition and visual-spatial processing. 
              For comprehensive dysgraphia evaluation, consult with educational psychologists or learning specialists 
              who can conduct thorough assessments including writing samples, fine motor skills, and academic history.
            </p>
          </div>
          
          <button 
            style={{...styles.startButton, marginTop: '20px'}} 
            onClick={() => window.location.reload()}
          >
            Take Assessment Again
          </button>
        </div>
      </div>
    );
  }

  return (
    
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Pattern Recognition Assessment</h1>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${(currentLevel / 8) * 100}%`
            }}
          />
        </div>
        <div style={styles.scoreDisplay}>
          Level {currentLevel} of 8 | Score: {score}/{currentLevel - 1}
        </div>
      </div>

      <div style={styles.gameArea}>
        <p style={{ textAlign: 'center', marginBottom: '30px', fontSize: '18px', color: '#555' }}>
          Complete the pattern by selecting the correct answer:
        </p>
        
        <div style={styles.patternContainer}>
          {currentPattern.map((item, index) => (
            <div 
              key={index} 
              style={{
                ...styles.patternItem,
                ...(item === '?' ? styles.questionMark : {})
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div style={styles.optionsContainer}>
          {options.map((option, index) => (
            <button
              key={index}
              style={{
                ...styles.option,
                ...(showFeedback && selectedAnswer === option
                  ? option === correctAnswer
                    ? styles.selectedCorrect
                    : styles.selectedIncorrect
                  : {})
              }}
              onClick={() => !showFeedback && handleAnswer(option)}
              disabled={showFeedback}
              onMouseOver={(e) => {
                if (!showFeedback) {
                  e.target.style.backgroundColor = '#2980b9';
                  e.target.style.transform = 'scale(1.05)';
                }
              }}
              onMouseOut={(e) => {
                if (!showFeedback) {
                  e.target.style.backgroundColor = '#3498db';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {showFeedback && (
          <div style={{
            textAlign: 'center',
            fontSize: '18px',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: selectedAnswer === correctAnswer ? '#d5f4e6' : '#ffeaa7',
            color: selectedAnswer === correctAnswer ? '#00b894' : '#fdcb6e'
          }}>
            {selectedAnswer === correctAnswer ? '✓ Correct!' : `✗ Incorrect. The answer was: ${correctAnswer}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternRecognitionGame;