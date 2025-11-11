import React, { useState, useEffect, useRef } from 'react';

const MemoryMatchGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [gameLevel, setGameLevel] = useState(1);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Cognitive analysis data
  const [analysisData, setAnalysisData] = useState({
    cardFlips: [],
    reactionTimes: [],
    errorPatterns: [],
    memoryStrength: 0,
    attentionLevel: 0,
    processingSpeed: 0,
    workingMemory: 0
  });

  const cardClickTimeRef = useRef(null);

  const cardSymbols = {
    1: ['🎈', '🎯', '🎪', '🎨', '🎭', '🎸'], // 6 pairs (12 cards)
    2: ['🎈', '🎯', '🎪', '🎨', '🎭', '🎸', '🎹', '🎲'], // 8 pairs (16 cards)
    3: ['🎈', '🎯', '🎪', '🎨', '🎭', '🎸', '🎹', '🎲', '🎳', '🎮'] // 10 pairs (20 cards)
  };

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '2.5rem',
      color: '#2c3e50',
      margin: '0 0 10px 0',
      fontWeight: 'bold'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#7f8c8d',
      margin: 0
    },
    gameControls: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },
    levelButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '25px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: '#3498db',
      color: 'white'
    },
    activeLevel: {
      backgroundColor: '#e74c3c',
      transform: 'scale(1.05)'
    },
    gameStats: {
      display: 'flex',
      justifyContent: 'center',
      gap: '30px',
      marginBottom: '30px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '15px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      flexWrap: 'wrap'
    },
    statItem: {
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: '0 0 5px 0'
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#7f8c8d',
      margin: 0,
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    gameBoard: {
      display: 'grid',
      gap: '15px',
      justifyContent: 'center',
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    card: {
      width: '80px',
      height: '80px',
      backgroundColor: '#ecf0f1',
      border: '3px solid #bdc3c7',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      userSelect: 'none'
    },
    cardFlipped: {
      backgroundColor: '#fff',
      borderColor: '#3498db',
      transform: 'rotateY(180deg)'
    },
    cardMatched: {
      backgroundColor: '#2ecc71',
      borderColor: '#27ae60',
      color: 'white'
    },
    analysisSection: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginTop: '30px'
    },
    analysisTitle: {
      fontSize: '1.8rem',
      color: '#2c3e50',
      marginBottom: '20px',
      textAlign: 'center'
    },
    analysisGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    scoreCard: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      textAlign: 'center',
      border: '2px solid #e9ecef'
    },
    scoreTitle: {
      fontSize: '0.9rem',
      color: '#6c757d',
      marginBottom: '10px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    scoreValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    scoreDescription: {
      fontSize: '0.8rem',
      color: '#6c757d',
      lineHeight: '1.4'
    },
    button: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '25px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    completionMessage: {
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#d4edda',
      borderRadius: '10px',
      marginBottom: '20px',
      border: '2px solid #c3e6cb'
    }
  };

  const initializeGame = (level) => {
    const symbols = cardSymbols[level];
    const shuffledCards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setGameStarted(false);
    setGameCompleted(false);
    setShowAnalysis(false);
    setStartTime(null);
    setEndTime(null);
    setAnalysisData({
      cardFlips: [],
      reactionTimes: [],
      errorPatterns: [],
      memoryStrength: 0,
      attentionLevel: 0,
      processingSpeed: 0,
      workingMemory: 0
    });
  };

  const handleCardClick = (clickedCard) => {
    if (flippedCards.length === 2 || clickedCard.isFlipped || clickedCard.isMatched) return;
    
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    const currentTime = Date.now();
    const reactionTime = cardClickTimeRef.current ? currentTime - cardClickTimeRef.current : 0;
    cardClickTimeRef.current = currentTime;

    // Record flip data for analysis
    setAnalysisData(prev => ({
      ...prev,
      cardFlips: [...prev.cardFlips, {
        cardId: clickedCard.id,
        symbol: clickedCard.symbol,
        timestamp: currentTime,
        reactionTime,
        moveNumber: moves + 1
      }],
      reactionTimes: [...prev.reactionTimes, reactionTime]
    }));

    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(card => 
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      if (newFlippedCards[0].symbol === newFlippedCards[1].symbol) {
        // Match found
        setTimeout(() => {
          const matchedIds = [newFlippedCards[0].id, newFlippedCards[1].id];
          setMatchedCards(prev => [...prev, ...matchedIds]);
          setCards(prev => prev.map(card => 
            matchedIds.includes(card.id) ? { ...card, isMatched: true } : card
          ));
          setFlippedCards([]);
        }, 500);
      } else {
        // No match - record error pattern
        setAnalysisData(prev => ({
          ...prev,
          errorPatterns: [...prev.errorPatterns, {
            cards: newFlippedCards,
            timestamp: currentTime,
            moveNumber: moves + 1
          }]
        }));

        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.some(flipped => flipped.id === card.id) 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const calculateCognitiveAnalysis = () => {
    const { cardFlips, reactionTimes, errorPatterns } = analysisData;
    const totalTime = endTime - startTime;
    const accuracy = matchedCards.length / (matchedCards.length + errorPatterns.length * 2);
    
    // Memory Strength (based on accuracy and error patterns)
    const memoryStrength = Math.max(0, Math.min(100, accuracy * 100 - errorPatterns.length * 5));
    
    // Processing Speed (based on average reaction time)
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 1000;
    const processingSpeed = Math.max(0, Math.min(100, 100 - (avgReactionTime - 500) / 20));
    
    // Attention Level (based on consistency of performance)
    const reactionVariance = reactionTimes.length > 1 
      ? reactionTimes.reduce((acc, time) => acc + Math.pow(time - avgReactionTime, 2), 0) / reactionTimes.length
      : 0;
    const attentionLevel = Math.max(0, Math.min(100, 100 - Math.sqrt(reactionVariance) / 50));
    
    // Working Memory (based on moves efficiency)
    const optimalMoves = cards.length / 2;
    const workingMemory = Math.max(0, Math.min(100, (optimalMoves / moves) * 100));

    setAnalysisData(prev => ({
      ...prev,
      memoryStrength: Math.round(memoryStrength),
      processingSpeed: Math.round(processingSpeed),
      attentionLevel: Math.round(attentionLevel),
      workingMemory: Math.round(workingMemory)
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#2ecc71';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getScoreInterpretation = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  useEffect(() => {
    initializeGame(gameLevel);
  }, [gameLevel]);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setGameCompleted(true);
      setEndTime(Date.now());
    }
  }, [matchedCards, cards]);

  useEffect(() => {
    if (gameCompleted && endTime) {
      calculateCognitiveAnalysis();
      setShowAnalysis(true);
    }
  }, [gameCompleted, endTime]);

  const getGridColumns = () => {
    switch(gameLevel) {
      case 1: return 'repeat(4, 1fr)';
      case 2: return 'repeat(4, 1fr)';
      case 3: return 'repeat(5, 1fr)';
      default: return 'repeat(4, 1fr)';
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🧠 Memory Match</h1>
        <p style={styles.subtitle}>Test your memory and cognitive abilities while we analyze your performance</p>
      </div>

      <div style={styles.gameControls}>
        {[1, 2, 3].map(level => (
          <button
            key={level}
            style={{
              ...styles.levelButton,
              ...(gameLevel === level ? styles.activeLevel : {})
            }}
            onClick={() => setGameLevel(level)}
            onMouseEnter={(e) => {
              if (gameLevel !== level) {
                e.target.style.backgroundColor = '#2980b9';
                e.target.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (gameLevel !== level) {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            Level {level} ({cardSymbols[level].length * 2} cards)
          </button>
        ))}
      </div>

      <div style={styles.gameStats}>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>{moves}</div>
          <div style={styles.statLabel}>Moves</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>{matchedCards.length / 2}</div>
          <div style={styles.statLabel}>Pairs Found</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statNumber}>
            {gameStarted && !gameCompleted && startTime 
              ? formatTime(Date.now() - startTime) 
              : gameCompleted && startTime && endTime 
                ? formatTime(endTime - startTime)
                : '0:00'}
          </div>
          <div style={styles.statLabel}>Time</div>
        </div>
      </div>

      <div style={{...styles.gameBoard, gridTemplateColumns: getGridColumns()}}>
        {cards.map(card => (
          <div
            key={card.id}
            style={{
              ...styles.card,
              ...(card.isFlipped ? styles.cardFlipped : {}),
              ...(card.isMatched ? styles.cardMatched : {})
            }}
            onClick={() => handleCardClick(card)}
            onMouseEnter={(e) => {
              if (!card.isFlipped && !card.isMatched) {
                e.target.style.backgroundColor = '#d5dbdb';
                e.target.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!card.isFlipped && !card.isMatched) {
                e.target.style.backgroundColor = '#ecf0f1';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            {card.isFlipped || card.isMatched ? card.symbol : '❓'}
          </div>
        ))}
      </div>

      {gameCompleted && (
        <div style={styles.completionMessage}>
          <h2 style={{color: '#155724', margin: '0 0 10px 0'}}>🎉 Congratulations!</h2>
          <p style={{margin: 0, color: '#155724'}}>
            Game completed in {moves} moves and {formatTime(endTime - startTime)}!
          </p>
        </div>
      )}

      {showAnalysis && (
        <div style={styles.analysisSection}>
          <h2 style={styles.analysisTitle}>📊 Cognitive Performance Analysis</h2>
          
          <div style={styles.analysisGrid}>
            <div style={styles.scoreCard}>
              <div style={styles.scoreTitle}>Memory Strength</div>
              <div style={{...styles.scoreValue, color: getScoreColor(analysisData.memoryStrength)}}>
                {analysisData.memoryStrength}%
              </div>
              <div style={styles.scoreDescription}>
                {getScoreInterpretation(analysisData.memoryStrength)} - 
                Ability to remember card positions and patterns
              </div>
            </div>

            <div style={styles.scoreCard}>
              <div style={styles.scoreTitle}>Processing Speed</div>
              <div style={{...styles.scoreValue, color: getScoreColor(analysisData.processingSpeed)}}>
                {analysisData.processingSpeed}%
              </div>
              <div style={styles.scoreDescription}>
                {getScoreInterpretation(analysisData.processingSpeed)} - 
                Speed of visual processing and decision making
              </div>
            </div>

            <div style={styles.scoreCard}>
              <div style={styles.scoreTitle}>Attention Level</div>
              <div style={{...styles.scoreValue, color: getScoreColor(analysisData.attentionLevel)}}>
                {analysisData.attentionLevel}%
              </div>
              <div style={styles.scoreDescription}>
                {getScoreInterpretation(analysisData.attentionLevel)} - 
                Consistency and focus throughout the game
              </div>
            </div>

            <div style={styles.scoreCard}>
              <div style={styles.scoreTitle}>Working Memory</div>
              <div style={{...styles.scoreValue, color: getScoreColor(analysisData.workingMemory)}}>
                {analysisData.workingMemory}%
              </div>
              <div style={styles.scoreDescription}>
                {getScoreInterpretation(analysisData.workingMemory)} - 
                Efficiency in using memory strategies
              </div>
            </div>
          </div>

          <div style={{textAlign: 'center', marginTop: '20px'}}>
            <button
              style={styles.button}
              onClick={() => initializeGame(gameLevel)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2980b9';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.transform = 'scale(1)';
              }}
            >
              Play Again
            </button>
          </div>

          <div style={{
            marginTop: '30px', 
            padding: '20px', 
            backgroundColor: '#fff3cd', 
            borderRadius: '10px',
            border: '2px solid #ffeaa7'
          }}>
            <h3 style={{color: '#856404', marginTop: 0}}>🔍 Performance Insights</h3>
            <p style={{color: '#856404', lineHeight: '1.6', margin: 0}}>
              <strong>Total Moves:</strong> {moves} | <strong>Errors:</strong> {analysisData.errorPatterns.length} | 
              <strong>Average Reaction Time:</strong> {analysisData.reactionTimes.length > 0 
                ? Math.round(analysisData.reactionTimes.reduce((a, b) => a + b, 0) / analysisData.reactionTimes.length) 
                : 0}ms
              <br/><br/>
              This analysis helps identify patterns in memory, attention, and processing that may indicate learning strengths or areas for improvement. 
              Consistent practice with memory games can help strengthen cognitive abilities over time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatchGame;