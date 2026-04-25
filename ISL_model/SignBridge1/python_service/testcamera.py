import cv2
from function import get_detector, mediapipe_detection, extract_keypoints
import numpy as np

detector = get_detector()
cap = cv2.VideoCapture(0)

print("📷 Camera opened - show your hand! Press Q to quit")

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Camera read failed")
        break

    _, results = mediapipe_detection(frame, detector)
    keypoints = extract_keypoints(results)
    hand_detected = bool(np.any(keypoints != 0))

    color = (0, 255, 0) if hand_detected else (0, 0, 255)
    text = "HAND DETECTED ✓" if hand_detected else "No hand"
    cv2.putText(frame, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
    cv2.imshow("Hand Test", frame)

    print(f"Hand: {hand_detected}")

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()