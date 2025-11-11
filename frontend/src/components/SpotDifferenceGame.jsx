import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SpotDifferenceGame = () => {
  const [currentTask, setCurrentTask] = useState(0);
  const [responses, setResponses] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [gameState, setGameState] = useState('start'); // start, testing, results
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
const navigate = useNavigate();
  
const handleBackToDashboard = () => {
    navigate('/parent-dashboard');
  };
  const tasks = [
    {
      id: 'letter_reversal',
      title: 'Letter Recognition',
      instruction: 'Click on all the letters that are backwards or upside down',
      type: 'click_multiple',
      content: [
        { id: 0, text: 'b', correct: false },
        { id: 1, text: 'd', correct: true, style: { transform: 'scaleX(-1)' } }, // mirrored d
        { id: 2, text: 'p', correct: false },
        { id: 3, text: 'q', correct: true, style: { transform: 'scaleX(-1)' } }, // mirrored q
        { id: 4, text: 'n', correct: false },
        { id: 5, text: 'u', correct: true }, // upside down n
        { id: 6, text: 'm', correct: false },
        { id: 7, text: 'w', correct: true }  // upside down m
      ]
    },
    {
      id: 'word_spacing',
      title: 'Word Spacing',
      instruction: 'Click on sentences that have INCORRECT spacing between words',
      type: 'click_multiple',
      content: [
        { id: 0, text: 'The cat is big', correct: false },
        { id: 1, text: 'I  like   dogs', correct: true },
        { id: 2, text: 'Today is sunny', correct: false },
        { id: 3, text: 'We are  going   home', correct: true }
      ]
    },
    {
      id: 'letter_size',
      title: 'Letter Size Consistency', 
      instruction: 'Click on words where letters are NOT the same size',
      type: 'click_multiple',
      content: [
        { id: 0, text: 'hello', correct: false },
        { id: 1, text: 'WoRLd', correct: true, isVariableSize: true },
        { id: 2, text: 'school', correct: false },
        { id: 3, text: 'FrIeNd', correct: true, isVariableSize: true },
        { id: 4, text: 'happy', correct: false },
        { id: 5, text: 'GaMe', correct: true, isVariableSize: true }
      ]
    },
    {
      id: 'line_alignment',
      title: 'Line Alignment',
      instruction: 'Click on sentences that are NOT aligned properly on the line',
      type: 'click_multiple',
      content: [
        { id: 0, text: 'This is aligned', correct: false },
        { id: 1, text: 'This is off', correct: true, style: { transform: 'translateY(-8px)' } },
        { id: 2, text: 'Properly aligned text', correct: false },
        { id: 3, text: 'Uneven baseline', correct: true, style: { transform: 'translateY(6px)' } }
      ]
    },
    {
      id: 'mirror_writing',
      title: 'Mirror Writing Detection',
      instruction: 'Click on words that are written backwards (mirror writing)',
      type: 'click_multiple', 
      content: [
        { id: 0, text: 'cat', correct: false },
        { id: 1, text: 'tac', correct: true, style: { transform: 'scaleX(-1)' } }, // mirror of 'cat'
        { id: 2, text: 'dog', correct: false },
        { id: 3, text: 'god', correct: true, style: { transform: 'scaleX(-1)' } }, // mirror of 'dog'
        { id: 4, text: 'sun', correct: false },
        { id: 5, text: 'nus', correct: true, style: { transform: 'scaleX(-1)' } }, // mirror of 'sun'
        { id: 6, text: 'run', correct: false },
        { id: 7, text: 'nur', correct: true, style: { transform: 'scaleX(-1)' } }  // mirror of 'run'
      ]
    }
  ];

  const startAssessment = () => {
    setGameState('testing');
    setCurrentTask(0);
    setResponses([]);
    setSelectedItems([]);
    setStartTime(Date.now());
    setTaskStartTime(Date.now());
  };

  const handleItemClick = (item, itemIndex) => {
    const task = tasks[currentTask];
    const clickTime = Date.now() - taskStartTime;
    const itemId = `${task.id}-${item.id}`;

    setSelectedItems(prev => {
      const isSelected = prev.includes(itemId);
      
      if (isSelected) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });

    setResponses(prev => {
      const existingIndex = prev.findIndex(r => 
        r.taskId === task.id && r.itemId === item.id
      );
      
      if (existingIndex >= 0) {
        // Remove if already selected
        return prev.filter((_, i) => i !== existingIndex);
      } else {
        // Add new response
        return [...prev, {
          taskId: task.id,
          itemId: item.id,
          correct: item.correct,
          timeToClick: clickTime
        }];
      }
    });
  };

  const nextTask = () => {
    if (currentTask < tasks.length - 1) {
      setCurrentTask(prev => prev + 1);
      setSelectedItems([]);
      setTaskStartTime(Date.now());
    } else {
      setGameState('results');
    }
  };

  const renderVariableSizeText = (text) => {
    const sizes = ['12px', '18px', '14px', '20px', '16px', '22px'];
    return text.split('').map((letter, index) => (
      <span key={index} style={{ fontSize: sizes[index % sizes.length] }}>
        {letter}
      </span>
    ));
  };

  const getDysgraphiaAssessment = () => {
    const taskResults = tasks.map(task => {
      const taskResponses = responses.filter(r => r.taskId === task.id);
      const correctItems = task.content.filter(item => item.correct);
      const correctResponses = taskResponses.filter(r => r.correct);
      const incorrectResponses = taskResponses.filter(r => !r.correct);
      
      const accuracy = correctItems.length > 0 ? 
        (correctResponses.length / correctItems.length) * 100 : 0;
      
      return {
        taskId: task.id,
        title: task.title,
        accuracy,
        correctFound: correctResponses.length,
        totalCorrect: correctItems.length,
        falsePositives: incorrectResponses.length,
        avgResponseTime: taskResponses.length > 0 ? 
          taskResponses.reduce((sum, r) => sum + r.timeToClick, 0) / taskResponses.length : 0
      };
    });

    // Calculate overall dysgraphia indicators
    const letterReversalScore = taskResults.find(r => r.taskId === 'letter_reversal')?.accuracy || 0;
    const spacingScore = taskResults.find(r => r.taskId === 'word_spacing')?.accuracy || 0;
    const sizeConsistencyScore = taskResults.find(r => r.taskId === 'letter_size')?.accuracy || 0;
    const alignmentScore = taskResults.find(r => r.taskId === 'line_alignment')?.accuracy || 0;
    const mirrorWritingScore = taskResults.find(r => r.taskId === 'mirror_writing')?.accuracy || 0;

    // Dysgraphia risk assessment based on research criteria
    const riskFactors = [];
    
    if (letterReversalScore < 60) {
      riskFactors.push('Letter reversal difficulties');
    }
    
    if (spacingScore < 50) {
      riskFactors.push('Word spacing challenges');
    }
    
    if (sizeConsistencyScore < 70) {
      riskFactors.push('Letter size inconsistency');
    }
    
    if (alignmentScore < 50) {
      riskFactors.push('Line alignment problems');
    }
    
    if (mirrorWritingScore < 75) {
      riskFactors.push('Mirror writing detection issues');
    }

    let dysgraphiaRisk = 'Low';
    let recommendation = 'Writing skills appear to be developing typically.';

    if (riskFactors.length >= 4) {
      dysgraphiaRisk = 'High';
      recommendation = 'Multiple indicators suggest significant dysgraphia risk. Comprehensive evaluation by occupational therapist or educational specialist recommended.';
    } else if (riskFactors.length >= 2) {
      dysgraphiaRisk = 'Moderate';
      recommendation = 'Some writing difficulties noted. Monitor progress and consider additional support or screening.';
    }

    return {
      taskResults,
      overallScores: {
        letterReversal: letterReversalScore,
        spacing: spacingScore,
        sizeConsistency: sizeConsistencyScore,
        alignment: alignmentScore,
        mirrorWriting: mirrorWritingScore
      },
      riskFactors,
      dysgraphiaRisk,
      recommendation
    };
  };

  // Button hover effect handlers
  const handleButtonHover = (e, hoverColor) => {
    e.target.style.backgroundColor = hoverColor;
  };

  const handleButtonLeave = (e, originalColor) => {
    e.target.style.backgroundColor = originalColor;
  };

  // Navigation Header Component
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

  if (gameState === 'start') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <NavigationHeader />
        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '20px' }}>Dysgraphia Assessment Tool</h1>
          <p style={{ fontSize: '18px', color: '#7f8c8d', marginBottom: '30px' }}>
            Interactive Screening for Writing Difficulties
          </p>
          
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto 30px', fontSize: '16px', lineHeight: '1.6' }}>
            <h3>This assessment tests core dysgraphia symptoms:</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Letter Reversals:</strong> Identifying backwards letters (b/d, p/q)</li>
              <li><strong>Word Spacing:</strong> Recognizing improper spacing between words</li>
              <li><strong>Letter Size:</strong> Detecting inconsistent letter sizing</li>
              <li><strong>Line Alignment:</strong> Spotting text that doesn't sit on the baseline</li>
              <li><strong>Mirror Writing:</strong> Identifying backwards/mirrored text</li>
            </ul>
            <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#e74c3c' }}>
              Each task tests specific visual-motor skills that are affected in dysgraphia.
            </p>
          </div>

          <button 
            onClick={startAssessment}
            style={{
              fontSize: '20px',
              padding: '15px 30px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => handleButtonHover(e, '#c0392b')}
            onMouseLeave={(e) => handleButtonLeave(e, '#e74c3c')}
          >
            Start Dysgraphia Assessment
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const assessment = getDysgraphiaAssessment();

    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <NavigationHeader />
        <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
          Dysgraphia Assessment Results
        </h1>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h2 style={{ color: '#34495e', marginBottom: '20px' }}>Core Writing Skills Assessment</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>Letter Recognition</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{assessment.overallScores.letterReversal.toFixed(0)}%</p>
              <small style={{ color: '#856404' }}>Detecting reversed letters</small>
            </div>
            
            <div style={{ padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '6px', border: '1px solid #bee5eb' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#0c5460' }}>Word Spacing</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{assessment.overallScores.spacing.toFixed(0)}%</p>
              <small style={{ color: '#0c5460' }}>Recognizing spacing errors</small>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#d4edda', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#155724' }}>Size Consistency</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{assessment.overallScores.sizeConsistency.toFixed(0)}%</p>
              <small style={{ color: '#155724' }}>Detecting size variations</small>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '6px', border: '1px solid #f5c6cb' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#721c24' }}>Line Alignment</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{assessment.overallScores.alignment.toFixed(0)}%</p>
              <small style={{ color: '#721c24' }}>Spotting alignment issues</small>
            </div>

            <div style={{ padding: '15px', backgroundColor: '#e2e3e5', borderRadius: '6px', border: '1px solid #d6d8db' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#383d41' }}>Mirror Writing</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{assessment.overallScores.mirrorWriting.toFixed(0)}%</p>
              <small style={{ color: '#383d41' }}>Identifying mirrored text</small>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#34495e', marginBottom: '20px' }}>Dysgraphia Risk Assessment</h2>
          
          <div style={{ 
            padding: '25px', 
            borderRadius: '10px', 
            backgroundColor: assessment.dysgraphiaRisk === 'High' ? '#f8d7da' : assessment.dysgraphiaRisk === 'Moderate' ? '#fff3cd' : '#d4edda',
            border: `3px solid ${assessment.dysgraphiaRisk === 'High' ? '#dc3545' : assessment.dysgraphiaRisk === 'Moderate' ? '#ffc107' : '#28a745'}`,
            marginBottom: '25px'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              fontSize: '24px',
              color: assessment.dysgraphiaRisk === 'High' ? '#721c24' : assessment.dysgraphiaRisk === 'Moderate' ? '#856404' : '#155724'
            }}>
              Dysgraphia Risk: {assessment.dysgraphiaRisk}
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '18px',
              lineHeight: '1.5',
              color: assessment.dysgraphiaRisk === 'High' ? '#721c24' : assessment.dysgraphiaRisk === 'Moderate' ? '#856404' : '#155724'
            }}>
              {assessment.recommendation}
            </p>
          </div>

          {assessment.riskFactors.length > 0 && (
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>Identified Risk Factors:</h3>
              <ul style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', lineHeight: '1.6' }}>
                {assessment.riskFactors.map((factor, index) => (
                  <li key={index} style={{ margin: '8px 0', fontSize: '16px', color: '#495057' }}>
                    <strong>{factor}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '1px solid #bbdefb' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Next Steps:</h4>
            <ul style={{ margin: '10px 0', paddingLeft: '20px', color: '#1565c0' }}>
              <li>Share these results with teachers and educational specialists</li>
              <li>Consider occupational therapy evaluation if risk is moderate or high</li>
              <li>Implement writing support strategies in educational settings</li>
              <li>Monitor progress with follow-up assessments</li>
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              onClick={handleBackToDashboard}
              style={{
                fontSize: '16px',
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => handleButtonHover(e, '#5a6268')}
              onMouseLeave={(e) => handleButtonLeave(e, '#6c757d')}
            >
              Back to Dashboard
            </button>
            <button 
              onClick={() => {
                setGameState('start');
                setCurrentTask(0);
                setResponses([]);
                setSelectedItems([]);
              }}
              style={{
                fontSize: '16px',
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => handleButtonHover(e, '#0056b3')}
              onMouseLeave={(e) => handleButtonLeave(e, '#007bff')}
            >
              Take Assessment Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Testing state
  const task = tasks[currentTask];
  const taskResponses = responses.filter(r => r.taskId === task.id);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <NavigationHeader />
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '8px' }}>
          Task {currentTask + 1} of {tasks.length}: {task.title}
        </h2>
        <p style={{ color: '#7f8c8d', fontSize: '16px', marginBottom: '10px' }}>
          {task.instruction}
        </p>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', margin: '15px 0' }}>
          <div style={{ 
            width: `${((currentTask + 1) / tasks.length) * 100}%`, 
            height: '100%', 
            backgroundColor: '#007bff', 
            borderRadius: '4px' 
          }}></div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{
          border: '2px solid #007bff',
          borderRadius: '6px',
          padding: '30px',
          backgroundColor: 'white',
          minHeight: '200px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-around',
          gap: '20px'
        }}>
          {task.content.map((item, index) => {
            const itemId = `${task.id}-${item.id}`;
            const isSelected = selectedItems.includes(itemId);
            
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item, index)}
                style={{
                  padding: '15px 20px',
                  fontSize: task.id === 'letter_reversal' ? '32px' : '18px',
                  fontWeight: 'bold',
                  backgroundColor: isSelected ? '#28a745' : '#f8f9fa',
                  color: isSelected ? 'white' : '#333',
                  border: `2px solid ${isSelected ? '#28a745' : '#dee2e6'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                  minWidth: task.id === 'word_spacing' || task.id === 'line_alignment' ? '200px' : 'auto',
                  textAlign: 'center',
                  position: 'relative',
                  ...item.style
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = '#e9ecef';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = '#f8f9fa';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {item.isVariableSize ? renderVariableSizeText(item.text) : item.text}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#6c757d', marginBottom: '15px' }}>
            Selected: {taskResponses.length} items | Click items to select/deselect
          </p>
          
          <button 
            onClick={nextTask}
            style={{
              fontSize: '16px',
              padding: '12px 30px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => handleButtonHover(e, '#1e7e34')}
            onMouseLeave={(e) => handleButtonLeave(e, '#28a745')}
          >
            {currentTask < tasks.length - 1 ? 'Next Task' : 'Complete Assessment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpotDifferenceGame;