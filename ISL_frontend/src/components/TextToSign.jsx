
// import '../avatar-renderer';
// import React, { useState, useEffect } from 'react';

// const TextToSign = ({ showToast }) => {
//   const [text, setText] = useState('');

//   const [language, setLanguage] = useState('en');

//   // 🔥 Initialize Avatar
//   useEffect(() => {
//     if (window.AvatarRenderer) {
//       window.AvatarRenderer.init();
//     }
//   }, []);

//   // 🔥 Play Animation (supports full phrase)
//   const handlePlay = async () => {
//     if (!text) {
//       showToast("⚠️ Please enter text");
//       return;
//     }

//     if (!window.AvatarRenderer) {
//       showToast("⚠️ Avatar not loaded");
//       return;
//     }

//     // Try full phrase first
//     window.AvatarRenderer.playAnimation(text.toLowerCase());
//     showToast(`Playing: ${text}`);
//   };

//   const suggestions = [
//     "hello",
//     "hi",
//     "good evening",
//     "how are u",
//     "i am fine",
//     "i need water",
//     "thank you",
//     "i am sorry",
//     'i am sorry',
//     'i dont know',
//     'lets go for lunch',
//     'nice to meet you',
//     'take care',
//     'shall i help you',
//     'welcome',
//     'what time is it',
//     'where is your home',
//     'how are you'

//   ];

//   return (
//     <div className="text-to-sign-container">

//       {/* 🎭 AVATAR */}
//       <div className="avatar-container">
//         <div id="avatar-canvas-container"></div>

//         <span id="avatar-status" className="avatar-status">
//           🟢 Avatar Ready
//         </span>
//       </div>

//       {/* ✏️ INPUT + BUTTON */}
//       <div style={{ marginBottom: "10px" }}>
//         <select
//           value={language}
//           onChange={(e) => setLanguage(e.target.value)}
//           className="text-input"
//         >
//           <option value="en">English</option>
//           <option value="hi">Hindi</option>
//           <option value="mr">Marathi</option>
//         </select>
//       </div>

//       <div className="input-row">
//         <input
//           type="text"
//           placeholder="Type a word or phrase (e.g., Hello, Thank You)..."
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           className="text-input"
//         />

//         <button className="play-btn" onClick={handlePlay}>
//           <span class="icon">▶</span>
//           <span class="text">Play Sign</span>
//         </button>
//       </div>

//       {/* 💡 AVAILABLE SIGNS */}
//       <div className="suggestions-container">
//         <p className="suggestions-title">AVAILABLE SIGNS</p>

//         <div className="suggestions">
//           {suggestions.map((word, index) => (
//             <button key={index} onClick={() => setText(word)}>
//               {word}
//             </button>
//           ))}
//         </div>
//       </div>

//     </div>
//   );
// };

// export default TextToSign;




import React, { useState, useEffect } from 'react';
import '../avatar-renderer';
import { translateText } from '../services/api'; // ✅ IMPORTANT

const TextToSign = ({ showToast }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en');
  const [displayText, setDisplayText] = useState('');

  // 🔥 Initialize Avatar
  useEffect(() => {
    if (window.AvatarRenderer) {
      window.AvatarRenderer.init();
    }
  }, []);

  // 🔥 Play Animation with Translation
  const handlePlay = async () => {
    if (!text) {
      showToast("⚠️ Please enter text");
      return;
    }

    window.selectedLanguage = language;
    window.displayText = displayText || text;

    let finalText = text;

    try {
      // 🔥 Translate if not English
      if (language !== 'en') {
        const res = await translateText(text, 'en');
        console.log("Translated:", res);

        finalText = res.translated_text || text;
      }

      if (!window.AvatarRenderer) {
        showToast("⚠️ Avatar not loaded");
        return;
      }

      window.AvatarRenderer.playAnimation(finalText.toLowerCase());
      showToast(
        language === 'hi'
          ? `👉 दिखाया जा रहा है: ${displayText || finalText}`
          : language === 'mr'
            ? `👉 दाखवत आहे: ${displayText || finalText}`
            : `👉 Showing: ${finalText}`
      );

    } catch (err) {
      console.error(err);
      showToast("❌ Translation failed");
    }
  };

  // const suggestions = [
  //   "hello",
  //   "hi",
  //   "good evening",
  //   "how are u",
  //   "i am fine",
  //   "i need water",
  //   "thank you",
  //   "i am sorry",
  //   "i dont know",
  //   "lets go for lunch",
  //   "nice to meet you",
  //   "take care",
  //   "shall i help you",
  //   "welcome",
  //   "what time is it",
  //   "where is your home",
  //   "how are you"
  // ];

  const translations = {
    en: {
      hello: "hello",
      hi: "hi",
      "good evening": "good evening",
      "how are u": "how are u",
      "i am fine": "i am fine",
      "i need water": "i need water",
      "thank you": "thank you",
      "i am sorry": "i am sorry",
      "i dont know": "i dont know",
      "lets go for lunch": "lets go for lunch",
      "nice to meet you": "nice to meet you",
      "take care": "take care",
      "shall i help you": "shall i help you",
      "welcome": "welcome",
      "what time is it": "what time is it",
      "where is your home": "where is your home",
      "how are you": "how are you"
    },

    hi: {
      hello: "नमस्ते",
      hi: "हाय",
      "good evening": "शुभ संध्या",
      "how are u": "आप कैसे हैं",
      "i am fine": "मैं ठीक हूँ",
      "i need water": "मुझे पानी चाहिए",
      "thank you": "धन्यवाद",
      "i am sorry": "मुझे माफ करें",
      "i dont know": "मुझे नहीं पता",
      "lets go for lunch": "चलो दोपहर के भोजन के लिए चलते हैं",
      "nice to meet you": "आपसे मिलकर अच्छा लगा",
      "take care": "ध्यान रखना",
      "shall i help you": "क्या मैं आपकी मदद करूं",
      "welcome": "स्वागत है",
      "what time is it": "अभी क्या समय है",
      "where is your home": "आपका घर कहाँ है",
      "how are you": "आप कैसे हैं"
    },

    mr: {
      hello: "नमस्कार",
      hi: "हाय",
      "good evening": "शुभ संध्या",
      "how are u": "तू कसा आहेस",
      "i am fine": "मी ठीक आहे",
      "i need water": "मला पाणी पाहिजे",
      "thank you": "धन्यवाद",
      "i am sorry": "मला माफ करा",
      "i dont know": "मला माहित नाही",
      "lets go for lunch": "चला जेवायला जाऊया",
      "nice to meet you": "तुमची भेट घेऊन आनंद झाला",
      "take care": "काळजी घ्या",
      "shall i help you": "मी मदत करू का",
      "welcome": "स्वागत आहे",
      "what time is it": "आत्ता किती वाजले आहेत",
      "where is your home": "तुमचं घर कुठे आहे",
      "how are you": "तुम्ही कसे आहात"
    }
  };

  return (
    <div className="text-to-sign-container">

      {/* 🎭 AVATAR */}
      <div className="avatar-container">
        <div id="avatar-canvas-container"></div>
        <span id="avatar-status" className="avatar-status">
          🟢 Avatar Ready
        </span>
      </div>

      {/* 🌐 LANGUAGE SELECT */}
      <div className="language-container">
        <label className="language-label">🌐 Select Language</label>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language-select"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
        </select>
      </div>

      {/* ✏️ INPUT */}
      <div className="input-row">
        <input
          type="text"
          placeholder="Type a word or phrase..."
          value={displayText || text}
          onChange={(e) => setText(e.target.value)}
          className="text-input"
        />

        <button className="play-btn" onClick={handlePlay}>
          <span className="icon">▶</span>
          <span className="text">Play Sign</span>
        </button>
      </div>

      {/* 💡 SUGGESTIONS */}
      <div className="suggestions-container">
        <p className="suggestions-title">AVAILABLE SIGNS</p>

        <div className="suggestions">
          {Object.keys(translations.en).map((key, index) => (
            <button
              key={index}
              onClick={() => {
                setText(key);
                setDisplayText(translations[language][key]);
              }}
            >
              {translations[language][key]}
            </button>
          ))}

        </div>
      </div>

    </div>
  );
};

export default TextToSign;
