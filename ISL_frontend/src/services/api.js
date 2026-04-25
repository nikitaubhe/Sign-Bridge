// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:8080/api';

// export const translateSign = async (imageData) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/translate`, {
//       image: imageData
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Translation error:', error);
//     throw error;
//   }
// };

// export const textToSign = async (text) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/text-to-sign`, {
//       text: text
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Text to sign error:', error);
//     throw error;
//   }
// };

// export const getHistory = async () => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/history`);
//     return response.data;
//   } catch (error) {
//     console.error('History fetch error:', error);
//     throw error;
//   }
// };


import axios from 'axios';

// 🔥 CHANGE BASE URL TO FLASK

const API_BASE_URL = 'http://127.0.0.1:5000';

export const translateText = async (text, lang) => {
  const response = await axios.post('http://localhost:5000/translate-text', {
    text: text,
    lang: lang
  });

  return response.data;
};

export const translateSign = async (imageData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/predict`, {
      frame: imageData, // 🔥 VERY IMPORTANT (must match Flask)
    });

    return response.data;
  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      message: 'Backend error',
    };
  }
};

// (OPTIONAL) You can keep this if you still use it
export const textToSign = async (text) => {
  console.warn("Text-to-sign not connected to Flask yet");
  return {
    success: false,
    message: "Not implemented",
  };
};

// (OPTIONAL) Not needed now
export const getHistory = async () => {
  return [];
};
