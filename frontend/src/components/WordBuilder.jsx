import React, { useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WordBuilder = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [gameState, setGameState] = useState('start'); // start, playing, results
  const [results, setResults] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [wordStartTime, setWordStartTime] = useState(null);

  const inputRef = useRef(null);
const navigate = useNavigate();
  
const handleBackToDashboard = () => {
    navigate('/parent-dashboard');
  };
  // Progressive word building levels
  const levels = [
    {
      id: 'simple_words',
      title: 'Simple 3-Letter Words',
      instruction: 'Type these simple words exactly as shown',
      words: ['cat', 'dog', 'sun', 'run', 'big', 'red'],
      difficulty: 1
    },
    {
      id: 'reversible_letters',
      title: 'Tricky Letters Challenge',
      instruction: 'Be careful with these letters - type exactly as shown!',
      words: ['bed', 'bad', 'pod', 'bid', 'dip', 'pad'],
      difficulty: 2
    },
    {
      id: 'longer_words',
      title: 'Longer Words',
      instruction: 'Ready for bigger challenges? Type these words carefully',
      words: ['happy', 'school', 'friend', 'playing', 'rainbow'],
      difficulty: 3
    },
    {
      id: 'sentences',
      title: 'Super Sentences',
      instruction: 'Final challenge - type these sentences with perfect spacing!',
      words: [
        'The cat is big.',
        'I like to run.',
        'My friend is happy.',
        'We play outside.'
      ],
      difficulty: 4
    }
  ];

  const startGame = () => {
    setGameState('playing');
    setCurrentLevel(0);
    setCurrentWordIndex(0);
    setUserInput('');
    setResults([]);
    setStartTime(Date.now());
    setWordStartTime(Date.now());
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
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
        onMouseEnter={(e) => handleButtonHover(e, '#5a6268')}
        onMouseLeave={(e) => handleButtonLeave(e, '#6c757d')}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
    </div>
  );

  const getCurrentWord = () => {
    if (!levels[currentLevel]) return '';
    return levels[currentLevel].words[currentWordIndex] || '';
  };

  const analyzeWord = (typed, expected) => {
    const completionTime = Date.now() - wordStartTime;
    
    // Calculate accuracy
    let correct = 0;
    const maxLength = Math.max(typed.length, expected.length);
    for (let i = 0; i < expected.length; i++) {
      if (typed[i] === expected[i]) {
        correct++;
      }
    }
    const accuracy = expected.length > 0 ? (correct / expected.length) * 100 : 0;

    // Count letter reversals (b/d, p/q)
    let reversals = 0;
    const reversalPairs = [['b', 'd'], ['d', 'b'], ['p', 'q'], ['q', 'p']];
    
    for (let i = 0; i < Math.min(typed.length, expected.length); i++) {
      const typedChar = typed[i];
      const expectedChar = expected[i];
      
      for (let pair of reversalPairs) {
        if (pair[0] === expectedChar && pair[1] === typedChar) {
          reversals++;
        }
      }
    }

    // Count total errors
    let errors = 0;
    for (let i = 0; i < maxLength; i++) {
      if (typed[i] !== expected[i]) {
        errors++;
      }
    }

    return {
      expected,
      typed,
      accuracy,
      completionTime,
      reversals,
      errors,
      level: currentLevel,
      wordIndex: currentWordIndex
    };
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submitWord();
    }
  };

  const submitWord = () => {
    const currentWord = getCurrentWord();
    if (!currentWord || !userInput.trim()) return;

    const analysis = analyzeWord(userInput, currentWord);
    setResults(prev => [...prev, analysis]);

    // Move to next word
    const currentLevelWords = levels[currentLevel].words;
    if (currentWordIndex + 1 < currentLevelWords.length) {
      setCurrentWordIndex(prev => prev + 1);
      setUserInput('');
      setWordStartTime(Date.now());
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      // Level complete
      if (currentLevel + 1 < levels.length) {
        setCurrentLevel(prev => prev + 1);
        setCurrentWordIndex(0);
        setUserInput('');
        setWordStartTime(Date.now());
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      } else {
        // Game complete
        setGameState('results');
      }
    }
  };

  const calculateOverallResults = () => {
    if (results.length === 0) return null;

    const totalWords = results.length;
    const avgAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / totalWords;
    const totalReversals = results.reduce((sum, r) => sum + r.reversals, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
    const avgTime = results.reduce((sum, r) => sum + r.completionTime, 0) / totalWords;

    // Performance feedback
    let performanceLevel = 'Great!';
    let feedback = 'Excellent typing skills! Keep up the great work!';
    let badgeColor = '#28a745';

    const reversalRate = (totalReversals / totalWords) * 100;
    const avgTimeSeconds = avgTime / 1000;
    const errorRate = (totalErrors / totalWords);

    // Simple scoring system
    let score = 0;
    if (reversalRate > 10) score += 2;
    if (avgAccuracy < 70) score += 2;
    if (avgTimeSeconds > 12) score += 1;
    if (errorRate > 2) score += 1;

    if (score >= 4) {
      performanceLevel = 'Keep Practicing!';
      feedback = 'You did your best! Practice makes perfect - try again to improve your score!';
      badgeColor = '#dc3545';
    } else if (score >= 2) {
      performanceLevel = 'Good Job!';
      feedback = 'Nice work! A little more practice and you\'ll be a typing champion!';
      badgeColor = '#ffc107';
    } else if (score >= 1) {
      performanceLevel = 'Well Done!';
      feedback = 'Great job! You\'re getting really good at this!';
      badgeColor = '#17a2b8';
    }

    return {
      totalWords,
      avgAccuracy,
      totalReversals,
      totalErrors,
      avgTime: avgTimeSeconds,
      reversalRate,
      errorRate,
      performanceLevel,
      feedback,
      badgeColor
    };
  };

  if (gameState === 'start') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
         <NavigationHeader />
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '10px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
        }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>
            🎮 Word Builder Game
          </h1>
          <p style={{ fontSize: '18px', color: '#7f8c8d', marginBottom: '30px' }}>
            Fun Typing Challenge for Everyone!
          </p>
          
          <div style={{ 
            textAlign: 'left', 
            maxWidth: '600px', 
            margin: '0 auto 30px', 
            fontSize: '16px', 
            lineHeight: '1.6' 
          }}>
            <h3>🎯 Game Levels:</h3>
            <div style={{ marginTop: '20px' }}>
              {levels.map((level, index) => (
                <div key={level.id} style={{ 
                  marginBottom: '15px', 
                  padding: '15px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>
                    🏆 Level {index + 1}: {level.title}
                  </h4>
                  <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>
                    {level.instruction}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '8px',
              border: '1px solid #bbdefb'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>🎪 What Makes This Fun:</h4>
              <ul style={{ margin: '5px 0', paddingLeft: '20px', color: '#1565c0' }}>
                <li>Track your typing speed</li>
                <li>Challenge yourself with tricky letters</li>
                <li>Complete progressively harder levels</li>
                <li>See your improvement over time</li>
                <li>Fun performance badges</li>
              </ul>
            </div>
          </div>

          <button 
            onClick={startGame}
            style={{
              fontSize: '20px',
              padding: '15px 30px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            🚀 Start Playing!
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const analysis = calculateOverallResults();
    
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
          🎉 Game Complete!
        </h1>

        {analysis && (
          <>
           
            {/* Performance Stats */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '10px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
              marginBottom: '20px' 
            }}>
              <h2 style={{ color: '#34495e', marginBottom: '20px' }}>
                📊 Your Game Stats
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px', 
                marginBottom: '25px' 
              }}>
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#e3f2fd', 
                  borderRadius: '6px', 
                  border: '1px solid #bbdefb',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>📝</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1565c0' }}>Words Completed</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>
                    {analysis.totalWords}
                  </p>
                </div>
                
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#e8f5e8', 
                  borderRadius: '6px', 
                  border: '1px solid #c8e6c9',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>🎯</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>Accuracy Score</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>
                    {analysis.avgAccuracy.toFixed(1)}%
                  </p>
                </div>

                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#fff3e0', 
                  borderRadius: '6px', 
                  border: '1px solid #ffcc02',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>🔄</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#ef6c00' }}>Letter Mix-ups</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>
                    {analysis.totalReversals}
                  </p>
                </div>

                <div style={{ 
                  padding: '15px', 
                  backgroundColor: '#f3e5f5', 
                  borderRadius: '6px', 
                  border: '1px solid #e1bee7',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>⚡</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#7b1fa2' }}>Avg Speed</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>
                    {analysis.avgTime.toFixed(1)}s
                  </p>
                </div>
              </div>
            </div>

            {/* Word Details */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '10px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
            }}>
              <h2 style={{ color: '#34495e', marginBottom: '20px' }}>
                📋 Your Word Journey
              </h2>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ 
                        padding: '12px', 
                        textAlign: 'left', 
                        borderBottom: '2px solid #dee2e6' 
                      }}>
                        Target Word
                      </th>
                      <th style={{ 
                        padding: '12px', 
                        textAlign: 'left', 
                        borderBottom: '2px solid #dee2e6' 
                      }}>
                        What You Typed
                      </th>
                      <th style={{ 
                        padding: '12px', 
                        textAlign: 'left', 
                        borderBottom: '2px solid #dee2e6' 
                      }}>
                        Score
                      </th>
                      <th style={{ 
                        padding: '12px', 
                        textAlign: 'left', 
                        borderBottom: '2px solid #dee2e6' 
                      }}>
                        Speed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f8f9fa' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>
                          {result.expected}
                        </td>
                        <td style={{ 
                          padding: '10px', 
                          fontFamily: 'monospace',
                          color: result.typed === result.expected ? '#28a745' : '#dc3545'
                        }}>
                          {result.typed}
                          {result.typed === result.expected && ' ✅'}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {result.accuracy.toFixed(0)}%
                        </td>
                        <td style={{ padding: '10px' }}>
                          {(result.completionTime / 1000).toFixed(1)}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            onClick={() => {
              setGameState('start');
              setCurrentLevel(0);
              setCurrentWordIndex(0);
              setUserInput('');
              setResults([]);
            }}
            style={{
              fontSize: '16px',
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            🎮 Play Again!
          </button>
        </div>
      </div>
    );
  }

  // Playing state
  const currentWord = getCurrentWord();
  const currentLevelData = levels[currentLevel];
  const levelProgress = ((currentWordIndex) / currentLevelData.words.length) * 100;
  const overallProgress = ((currentLevel * 100 + levelProgress) / levels.length);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '8px' }}>
          🎯 Level {currentLevel + 1}: {currentLevelData.title}
        </h2>
        <p style={{ color: '#7f8c8d', fontSize: '16px', marginBottom: '15px' }}>
          {currentLevelData.instruction}
        </p>
        
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>
            Level Progress: {currentWordIndex + 1}/{currentLevelData.words.length} words
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            <div style={{ 
              width: `${levelProgress}%`, 
              height: '100%', 
              backgroundColor: '#28a745', 
              borderRadius: '4px' 
            }}></div>
          </div>
          
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '5px' }}>
            Overall Game: {currentLevel + 1}/{levels.length} levels
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: '#e9ecef', 
            borderRadius: '4px'
          }}>
            <div style={{ 
              width: `${overallProgress}%`, 
              height: '100%', 
              backgroundColor: '#007bff', 
              borderRadius: '4px' 
            }}></div>
          </div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h3 style={{ color: '#495057', marginBottom: '20px', fontSize: '24px' }}>
            ✨ Type this word:
          </h3>
          <div style={{ 
            fontSize: '40px', 
            fontWeight: 'bold', 
            color: '#2c3e50', 
            marginBottom: '30px',
            fontFamily: 'Georgia, serif',
            letterSpacing: '2px'
          }}>
            {currentWord}
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type the word here..."
            style={{
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto',
              display: 'block',
              padding: '15px',
              fontSize: '20px',
              border: '3px solid #007bff',
              borderRadius: '8px',
              textAlign: 'center',
              outline: 'none',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={submitWord}
            disabled={!userInput.trim()}
            style={{
              fontSize: '18px',
              padding: '15px 30px',
              backgroundColor: userInput.trim() ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: userInput.trim() ? 'pointer' : 'not-allowed',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              marginRight: '10px'
            }}
          >
            ✅ Submit Word
          </button>

          <button 
            onClick={() => {
              setUserInput('');
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
            style={{
              fontSize: '18px',
              padding: '15px 30px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            🗑️ Clear
          </button>
        </div>

        {results.length > 0 && (
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>
              🎯 Recent Results:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {results.slice(-3).map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: result.accuracy === 100 ? '#d4edda' : '#f8d7da',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    border: `1px solid ${result.accuracy === 100 ? '#c3e6cb' : '#f5c6cb'}`
                  }}
                >
                  <strong>{result.expected}</strong> → {result.typed}
                  {result.accuracy === 100 && ' ✅'}
                  <br />
                  <small>
                    {result.accuracy.toFixed(0)}% • {(result.completionTime / 1000).toFixed(1)}s
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordBuilder;