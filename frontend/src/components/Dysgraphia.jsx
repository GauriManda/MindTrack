import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import "./Dysgraphia.css"; // move styles here

const Dysgraphia = () => {
  const questions = [
    {
      question: "1. Do you often mix up similar-looking letters (b, d, p, q)?",
      options: ["Yes", "No"],
      answer: "Yes",
    },
    {
      question: "2. Is your handwriting often difficult to read?",
      options: ["Yes", "No"],
      answer: "Yes",
    },
    {
      question: "3. Do you struggle to keep writing on a straight line?",
      options: ["Yes", "No"],
      answer: "Yes",
    },
    {
      question: "4. Do you often forget how to form certain letters?",
      options: ["Yes", "No"],
      answer: "Yes",
    },
    {
      question: "5. Do you write letters or numbers in reverse (like 3 as Ɛ)?",
      options: ["Yes", "No"],
      answer: "Yes",
    },
    {
      question: "6. Do you take much longer to complete written tasks?",
      options: ["Yes", "No"],
      answer: "Yes",
    },
    {
      question: "7. Do you find spacing between words and letters inconsistent?",
      options: ["Yes", "No"],
      answer: "Yes",
    },
    {
      question: "8. Do you often feel hand pain or discomfort while writing?",
      options: ["Yes", "No"],
      answer: "Yes",
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    let timer;
    if (!showResult) {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showResult]);

  const handleAnswer = (selected) => {
    if (selected === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  useEffect(() => {
    if (showResult) {
      const ctx = document.getElementById("scoreChart").getContext("2d");
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Likely Symptoms", "No Symptoms"],
          datasets: [
            {
              data: [score, questions.length - score],
              backgroundColor: ["#dc3545", "#28a745"],
            },
          ],
        },
      });
    }
  }, [showResult]);

  const getMessage = () => {
    if (score >= questions.length * 0.7) {
      return "⚠️ Signs of dysgraphia observed. Consider professional assessment.";
    } else if (score >= questions.length * 0.4) {
      return "ℹ️ Some difficulties noted. Extra writing support may help.";
    } else {
      return "✅ Writing ability seems fine.";
    }
  };

  return (
    <div className="containerr">
      <h1>✍️ Dysgraphia Screening Test</h1>

      {!showResult ? (
        <>
          <p className="timer">🕑 Time: {formatTime(time)}</p>
          <p className="question">{questions[currentQuestion].question}</p>
          <div className="options">
            {questions[currentQuestion].options.map((opt, idx) => (
              <button key={idx} onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="resultSection">
          <canvas id="scoreChart"></canvas>
          <p className="result">
            Score: {score}/{questions.length} – {getMessage()}
          </p>
          <p className="timer">Total Time: {formatTime(time)}</p>
        </div>
      )}
    </div>
  );
};

export default Dysgraphia;
