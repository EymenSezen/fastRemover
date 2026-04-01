import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 1.8;
const SHAKE_COOLDOWN = 1000; // ms

export function useShakeDetector(onShake) {
  const lastShakeTime = useRef(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const totalForce = Math.sqrt(x * x + y * y + z * z);

      if (totalForce > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTime.current > SHAKE_COOLDOWN) {
          lastShakeTime.current = now;
          onShake();
        }
      }
    });

    return () => subscription?.remove();
  }, [onShake]);
}
