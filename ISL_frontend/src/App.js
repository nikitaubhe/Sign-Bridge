import React, { useState } from 'react';
import Camera from './components/Camera';
import TranslationOutput from './components/TranslationOutput';
import TextToSign from './components/TextToSign';
import './App.css';
import logo from './logo.png';

function App() {
  const [activeTab, setActiveTab] = useState('sign');
  const [translation, setTranslation] = useState({});
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 2500);
  };

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <div className="card">
          {/* Header */}
          
          <div className="card-header">
               <div className="header-horizontal">
                   <div className="logo-circle">
                     <img src={logo} alt="SignBridge Logo" className="app-logo" />
                   </div>
               <div className="header-text">
                  <h1>SignBridge</h1>
                  <p className="subtitle">Bridging sign and speech!</p>
               </div>
          </div>
</div>

          {/* Mode Switch */}
          {/* Mode Switch */}
    <div className="mode-switch">
  <button
    className={activeTab === 'sign' ? 'active' : ''}
    onClick={() => setActiveTab('sign')}
  >
    🎥 Sign → Text
  </button>
  <button
    className={activeTab === 'text' ? 'active' : ''}
    onClick={() => setActiveTab('text')}
  >
    ✏️ Text → Sign
  </button>
</div>


          {/* Content */}
          <div className="mode-content">
            {activeTab === 'sign' ? (
              <div className="mode active">
                <Camera onTranslation={setTranslation} showToast={showToast} />
                <TranslationOutput translation={translation} showToast={showToast} />
              </div>
            ) : (
              <div className="mode active">
                <TextToSign showToast={showToast} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`toast ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default App;
