// import React, { useRef, useState } from 'react';
// import Webcam from 'react-webcam';
// import { translateSign } from '../services/api';

// const Camera = ({ onTranslation, showToast }) => {
//   const webcamRef = useRef(null);
//   const [isCapturing, setIsCapturing] = useState(false);

//   const captureAndTranslate = async () => {
//     if (webcamRef.current) {
//       setIsCapturing(true);
//       const imageSrc = webcamRef.current.getScreenshot();

//       try {
//         const result = await translateSign(imageSrc);
//         onTranslation(result);
//         showToast('✅ Translation successful!');
//       } catch (error) {
//         console.error('Translation failed:', error);
//         onTranslation({ error: 'Translation failed. Please try again.' });
//         showToast('❌ Translation failed');
//       } finally {
//         setIsCapturing(false);
//       }
//     }
//   };

//   return (
//     <div className="camera-container">
//       <div className="section-label">🎥 Camera Feed</div>
//       <div className="video-wrapper">
//         <Webcam
//           ref={webcamRef}
//           screenshotFormat="image/jpeg"
//           width="100%"
//           height="auto"
//           className="video-stream"
//         />
//       </div>

//       <button
//         onClick={captureAndTranslate}
//         disabled={isCapturing}
//         className="capture-btn"
//       >
//         {isCapturing ? (
//           <>
//             <span className="spinner"></span>
//             Translating...
//           </>
//         ) : (
//           <>
//             <span className="btn-icon">📸</span>
//             Capture & Translate
//           </>
//         )}
//       </button>
//     </div>
//   );
// };

// export default Camera;




import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { translateSign } from '../services/api';

const Camera = ({ onTranslation, showToast }) => {
  const webcamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(true);

  // ✅ send frame
  const sendFrameToBackend = useCallback(async (imageSrc) => {
    try {
      const result = await translateSign(imageSrc);
      console.log('🔍 Backend response:', result); // ADD THIS

      if (result.success && !result.requiresMoreFrames) {
        if (result.predictedSign) {
          onTranslation(result);
        } else {
          // clear UI when no prediction
          onTranslation({
            predictedSign: "",
            mappedWord: "",
            confidence: 0
          });
        }
      }

    } catch (error) {
      console.error('Error sending frame:', error);
      showToast('❌ Backend error');
    }
  }, [onTranslation, showToast]);

  // ✅ continuous capture
  useEffect(() => {
    let interval;

    if (isStreaming) {
      interval = setInterval(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            sendFrameToBackend(imageSrc);
          }
        }
      }, 300); // ⚡ slower = better performance
    }

    return () => {
      if (interval) clearInterval(interval);
    };

  }, [isStreaming, sendFrameToBackend]);

  // ✅ reset function (INSIDE component)
  const resetModel = async () => {
    try {
      await fetch('http://127.0.0.1:5000/reset', {
        method: 'POST',
      });
      showToast('🔄 Reset successful');
    } catch (error) {
      console.error('Reset failed:', error);
      showToast('❌ Reset failed');
    }
  };

  // ✅ RETURN MUST BE INSIDE COMPONENT
  return (
    <div className="camera-container">
      <div className="section-label">🎥 Camera Feed</div>

      <div className="video-wrapper">
        <span className="system-status">🟢 System Ready</span>

        {isStreaming ? (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.9}
            width={640}
            height={480}
            className="video-stream"
            mirrored={false}
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user"
            }}
          />
        ) : (
          <div className="camera-stopped">⏸ Camera Stopped</div>
        )}
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className="capture-btn"
        >
          {isStreaming ? '⏸ Stop' : '▶️ Start'}
        </button>

        <button
          onClick={resetModel}
          className="capture-btn"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default Camera;