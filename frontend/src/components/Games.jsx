import React, { useState } from 'react';
import MemoryMatchGame from './MemoryMatchGame';
import { useNavigate } from "react-router-dom";
import PatternRecognitionGame from './PatternRecognitionGame';
import SpotDifferenceGame from './SpotDifferenceGame';
import WordBuilder from './WordBuilder';


const Games = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

const navigate = useNavigate();

  const gameCategories = [
    {
      id: 1,
      title: "Memory & Cognitive",
      icon: "🧠",
      description: "Boost memory and cognitive skills",
      color: "#6366f1",
      games: [
        { name: "Memory Match", route: "/memory-match", icon: "🃏", difficulty: "Easy" },
        { name: "Pattern Recognition", route: "/pattern-recognition", icon: "🔲", difficulty: "Medium" },
        { name: "Sequence Memory", route: "/games/sequence-memory", icon: "🔢", difficulty: "Medium" },
        { name: "Word Recall", route: "/games/word-recall", icon: "📝", difficulty: "Hard" },
        { name: "Visual Memory", route: "/games/visual-memory", icon: "👁️", difficulty: "Easy" },
        { name: "Working Memory", route: "/games/working-memory", icon: "⚙️", difficulty: "Hard" }
      ]
    },
    {
      id: 2,
      title: "Attention & Focus",
      icon: "🎯",
      description: "Improve concentration and focus abilities",
      color: "#10b981",
      games: [
        { name: "Spot the Difference", route: "/spot-difference", icon: "🔍", difficulty: "Easy" },
        { name: "Color Focus", route: "/games/color-focus", icon: "🌈", difficulty: "Medium" },
        { name: "Moving Target", route: "/games/moving-target", icon: "🎪", difficulty: "Hard" },
        { name: "Dual N-Back", route: "/games/dual-n-back", icon: "⚡", difficulty: "Hard" },
        { name: "Sustained Attention", route: "/games/sustained-attention", icon: "⏱️", difficulty: "Medium" },
        { name: "Selective Attention", route: "/games/selective-attention", icon: "🎨", difficulty: "Easy" }
      ]
    },
    {
      id: 3,
      title: "Problem Solving",
      icon: "🧩",
      description: "Enhance logical thinking and problem-solving",
      color: "#f59e0b",
      games: [
        { name: "Logic Puzzles", route: "/games/logic-puzzles", icon: "🔧", difficulty: "Medium" },
        { name: "Tower of Hanoi", route: "/games/tower-hanoi", icon: "🗼", difficulty: "Hard" },
        { name: "Sudoku", route: "/games/sudoku", icon: "📊", difficulty: "Medium" },
        { name: "Brain Teasers", route: "/games/brain-teasers", icon: "💡", difficulty: "Hard" },
        { name: "Pattern Solver", route: "/pattern-solver", icon: "🔣", difficulty: "Easy" },
        { name: "Math Challenges", route: "/games/math-challenges", icon: "➕", difficulty: "Medium" }
      ]
    },
    {
      id: 4,
      title: "Language & Vocabulary",
      icon: "📚",
      description: "Develop language and communication skills",
      color: "#8b5cf6",
      games: [
        { name: "Word Builder", route: "/word-builder", icon: "🔤", difficulty: "Easy" },
        { name: "Crossword Puzzle", route: "/games/crossword", icon: "📋", difficulty: "Medium" },
        { name: "Anagram Solver", route: "/games/anagram-solver", icon: "🔀", difficulty: "Medium" },
        { name: "Vocabulary Quiz", route: "/games/vocabulary-quiz", icon: "❓", difficulty: "Easy" },
        { name: "Word Association", route: "/games/word-association", icon: "🔗", difficulty: "Hard" },
        { name: "Rhyme Time", route: "/games/rhyme-time", icon: "🎵", difficulty: "Easy" }
      ]
    },
    {
      id: 5,
      title: "Processing Speed",
      icon: "⚡",
      description: "Improve reaction time and processing speed",
      color: "#ef4444",
      games: [
        { name: "Reaction Test", route: "/games/reaction-test", icon: "⏰", difficulty: "Easy" },
        { name: "Speed Sorting", route: "/games/speed-sorting", icon: "📦", difficulty: "Medium" },
        { name: "Quick Math", route: "/games/quick-math", icon: "🔢", difficulty: "Medium" },
        { name: "Flash Cards", route: "/games/flash-cards", icon: "⚡", difficulty: "Easy" },
        { name: "Rapid Fire", route: "/games/rapid-fire", icon: "🎯", difficulty: "Hard" },
        { name: "Speed Reading", route: "/games/speed-reading", icon: "📖", difficulty: "Hard" }
      ]
    },
    {
      id: 6,
      title: "Executive Function",
      icon: "🎖️",
      description: "Strengthen planning and decision-making skills",
      color: "#06b6d4",
      games: [
        { name: "Task Switcher", route: "/games/task-switcher", icon: "🔄", difficulty: "Medium" },
        { name: "Planning Maze", route: "/games/planning-maze", icon: "🗺️", difficulty: "Hard" },
        { name: "Inhibition Control", route: "/games/inhibition-control", icon: "🛑", difficulty: "Medium" },
        { name: "Multi-Task Manager", route: "/games/multi-task", icon: "📋", difficulty: "Hard" },
        { name: "Decision Tree", route: "/games/decision-tree", icon: "🌳", difficulty: "Easy" },
        { name: "Strategic Thinking", route: "/games/strategic-thinking", icon: "♟️", difficulty: "Hard" }
      ]
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#2196F3';
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const getCategoryGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    return gradients[index % gradients.length];
  };

  const styles = {
    container: {
      width: '100%',
      minHeight: '100vh',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      background: '#f8fafc',
      padding: 0,
      margin: 0,
      boxSizing: 'border-box'
    },
    header: {
      textAlign: 'center',
      padding: '40px 20px',
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      marginBottom: 0
    },
    headerTitle: {
      fontSize: '2.2rem',
      color: '#2d3748',
      marginBottom: '12px',
      fontWeight: '600',
      margin: '0 0 12px 0'
    },
    headerDescription: {
      fontSize: '1.1rem',
      color: '#64748b',
      margin: 0,
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '30px',
      padding: '50px 40px',
      background: '#f8fafc',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    categoryCard: {
      borderRadius: '20px',
      padding: '32px 28px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
      border: '2px solid transparent',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
      color: 'white',
      height: '280px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
    categoryIcon: {
      fontSize: '4rem',
      marginBottom: '20px',
      display: 'block'
    },
    categoryTitle: {
      fontSize: '1.5rem',
      marginBottom: '12px',
      fontWeight: '600',
      lineHeight: '1.3',
      margin: '0 0 12px 0'
    },
    categoryDescription: {
      marginBottom: '20px',
      lineHeight: '1.4',
      fontSize: '1.05rem',
      opacity: '0.9',
      margin: '0 0 20px 0'
    },
    gamesCount: {
      background: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(10px)',
      color: 'inherit',
      padding: '8px 16px',
      borderRadius: '18px',
      fontSize: '0.9rem',
      fontWeight: '600',
      display: 'inline-block',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    gamesSection: {
      padding: '40px',
      minHeight: '100vh',
      background: '#f8fafc'
    },
    gamesSectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '40px',
      padding: '24px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      maxWidth: '1000px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    backButton: {
      background: '#6366f1',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    selectedCategoryInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    selectedCategoryIcon: {
      fontSize: '2.5rem'
    },
    selectedCategoryTitle: {
      fontSize: '1.5rem',
      color: '#2d3748',
      margin: '0 0 4px 0',
      fontWeight: '600'
    },
    selectedCategoryDescription: {
      color: '#64748b',
      margin: 0,
      fontSize: '0.95rem'
    },
    gamesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      marginBottom: '30px',
      maxWidth: '1000px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    gameCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '28px 24px',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      border: '2px solid transparent',
      position: 'relative',
      height: '180px',
      justifyContent: 'space-between',
      cursor: 'pointer'
    },
    gameIcon: {
      fontSize: '3.5rem',
      transition: 'transform 0.3s ease',
      marginBottom: '12px'
    },
    gameInfo: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    },
    gameTitle: {
      fontSize: '1.25rem',
      margin: 0,
      fontWeight: '600',
      lineHeight: '1.3',
      color: '#2d3748'
    },
    difficultyBadge: {
      color: 'white',
      padding: '6px 14px',
      borderRadius: '16px',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'inline-block'
    },
    footer: {
      marginTop: '40px',
      padding: '30px',
      background: '#f8fafc'
    },
    progressSection: {
      background: 'white',
      padding: '32px 24px',
      borderRadius: '16px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    progressTitle: {
      fontSize: '1.6rem',
      color: '#2d3748',
      marginBottom: '12px',
      fontWeight: '600',
      margin: '0 0 12px 0'
    },
    progressDescription: {
      color: '#64748b',
      fontSize: '1rem',
      marginBottom: '20px',
      maxWidth: '400px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    progressButton: {
      background: '#6366f1',
      color: 'white',
      textDecoration: 'none',
      padding: '12px 24px',
      borderRadius: '20px',
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'inline-block',
      border: 'none',
      cursor: 'pointer'
    }
  };

  return (
    
    <div style={styles.container}>
        
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🎮 Brain Training Games</h1>
        <p style={styles.headerDescription}>
          Choose from various categories to enhance your cognitive abilities
        </p>
      </div>

      {!selectedCategory ? (
        // Categories Grid View
        <div style={styles.categoriesGrid}>
          {gameCategories.map((category, index) => (
            <div 
              key={category.id} 
              style={{
                ...styles.categoryCard,
                background: getCategoryGradient(index),
                color: index === 5 ? '#2d3748' : 'white'
              }}
              onClick={() => handleCategoryClick(category)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px)';
                e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={styles.categoryIcon}>{category.icon}</div>
              <h2 style={styles.categoryTitle}>{category.title}</h2>
              <p style={styles.categoryDescription}>{category.description}</p>
              <div style={styles.gamesCount}>
                {category.games.length} Games
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Games Grid View for Selected Category
        <div style={styles.gamesSection}>
          <div style={styles.gamesSectionHeader}>
            <button 
              style={styles.backButton}
              onClick={handleBackToCategories}
              onMouseEnter={(e) => {
                e.target.style.background = '#4f46e5';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#6366f1';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ← Back to Categories
            </button>
            <div style={styles.selectedCategoryInfo}>
              <span style={styles.selectedCategoryIcon}>{selectedCategory.icon}</span>
              <div>
                <h2 style={styles.selectedCategoryTitle}>{selectedCategory.title}</h2>
                <p style={styles.selectedCategoryDescription}>{selectedCategory.description}</p>
              </div>
            </div>
          </div>

          <div style={styles.gamesGrid}>
            {selectedCategory.games.map((game, index) => (
              <div 
                key={index} 
                style={styles.gameCard}
                onClick={() => navigate(game.route)} 
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-8px)';
                  e.target.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15)';
                  e.target.style.borderColor = '#6366f1';
                  const icon = e.target.querySelector('.game-icon');
                  if (icon) icon.style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  e.target.style.borderColor = 'transparent';
                  const icon = e.target.querySelector('.game-icon');
                  if (icon) icon.style.transform = 'scale(1)';
                }}
              >
                <div className="game-icon" style={styles.gameIcon}>{game.icon}</div>
                <div style={styles.gameInfo}>
                  <h3 style={styles.gameTitle}>{game.name}</h3>
                  <span 
                    style={{
                      ...styles.difficultyBadge,
                      backgroundColor: getDifficultyColor(game.difficulty)
                    }}
                  >
                    {game.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.progressSection}>
          <h3 style={styles.progressTitle}>🏆 Your Progress</h3>
          <p style={styles.progressDescription}>
            Track your improvement across all game categories
          </p>
          <button 
            style={styles.progressButton}
            onClick={() => alert('Progress page coming soon!')}
            onMouseEnter={(e) => {
              e.target.style.background = '#4f46e5';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#6366f1';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            View Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default Games;