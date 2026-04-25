import numpy as np
from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout
import h5py

# ── Rebuild the exact same architecture your model was trained with ──
model = Sequential([
    LSTM(64, return_sequences=True, activation='relu', input_shape=(30, 63)),
    Dropout(0.2),
    LSTM(128, return_sequences=True, activation='relu'),
    Dropout(0.2),
    LSTM(64, return_sequences=False, activation='relu'),
    Dropout(0.2),
    Dense(64, activation='relu'),
    Dense(32, activation='relu'),
    Dense(6, activation='softmax')   # 6 = number of actions: A,B,C,D,E,F
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# ── Load weights by layer name (bypass config issues) ──
model.load_weights('model.h5', by_name=False, skip_mismatch=False)

model.save('model_fixed.h5')
print('✅ Saved model_fixed.h5 successfully!')
print(model.summary())