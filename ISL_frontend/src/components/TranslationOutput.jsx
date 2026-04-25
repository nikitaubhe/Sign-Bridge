
import React from 'react';

const TranslationOutput = ({ translation, showToast }) => {

  const speakText = () => {
    let text = translation.mappedWord || translation.predictedSign;

    if (text) {
      // 🔥 REMOVE EMOJIS
      const cleanText = text.replace(/[^\w\s]/gi, '').trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1;

      window.speechSynthesis.speak(utterance);
      showToast('🔊 Speaking...');
    }
  };

  return (
    <div className="translation-container">

      <div className="section-label">💬 Translation</div>

      {/* 🔥 NEW CARD UI */}
      <div className="stats-container">

        {/* Predicted Sign */}
        <div className="stat-card">
          <p>PREDICTED SIGN</p>
          <h2>
            {translation.predictedSign
              ? (translation.mappedWord || translation.predictedSign)
              : '--'}
          </h2>
        </div>

        {/* Confidence */}
        <div className="stat-card">
          <p>CONFIDENCE</p>
          <h2>
            {translation.confidence
              ? (translation.confidence * 100).toFixed(0)
              : 0}%
          </h2>
        </div>

      </div>

      {/* 🔊 Speak Button */}
      {translation.predictedSign && (
        <button onClick={speakText} className="capture-btn" style={{ marginTop: "10px" }}>
          🔊 Speak
        </button>
      )}

      {/* ❌ Error Handling */}
      {translation.error && (
        <div style={{ marginTop: "10px", color: "red" }}>
          ⚠️ {translation.error}
        </div>
      )}

    </div>
  );
};

export default TranslationOutput;