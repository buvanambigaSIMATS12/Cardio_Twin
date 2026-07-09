import numpy as np
import matplotlib.pyplot as plt
import scipy.signal as signal
import os

os.makedirs("ecg_samples", exist_ok=True)

def generate_ecg(filename, is_abnormal=False):
    # Simulated ECG parameters
    fs = 250
    t = np.arange(0, 4, 1.0/fs)
    
    # Heart rate ~75 bpm -> 1.25 beats per second
    # We will generate spikes using a scipy.signal.sawtooth modified
    
    ecg = np.zeros_like(t)
    bpm = 75 if not is_abnormal else 110 # Tachycardia
    beat_interval = int(fs * 60 / bpm)
    
    for i in range(0, len(t), beat_interval):
        if i + int(0.2*fs) < len(t):
            # P wave
            ecg[i:i+int(0.08*fs)] += np.hanning(int(0.08*fs)) * 0.1
            # QRS complex
            q_start = i+int(0.1*fs)
            if q_start+15 < len(t):
                ecg[q_start:q_start+5] -= np.linspace(0, 0.2, 5)
                ecg[q_start+5:q_start+10] += np.linspace(0, 1.0, 5)
                ecg[q_start+10:q_start+15] -= np.linspace(0, 0.8, 5)
            # T wave
            if i+int(0.35*fs) < len(t):
                ecg[i+int(0.2*fs):i+int(0.35*fs)] += np.hanning(int(0.15*fs)) * 0.2
                
    if is_abnormal:
        # Add noise and irregular beats
        ecg += np.random.normal(0, 0.05, len(t))
        ecg[int(1.5*fs):int(1.5*fs)+20] += np.random.normal(0, 0.5, 20) # PVC
        
    else:
        # Normal baseline noise
        ecg += np.random.normal(0, 0.01, len(t))

    plt.figure(figsize=(10, 3))
    plt.plot(t, ecg, color='red', linewidth=1.5)
    plt.grid(True, which='both', linestyle='--', linewidth=0.5, color='pink')
    plt.gca().set_facecolor('#fffafa')
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(f"ecg_samples/{filename}", dpi=150, bbox_inches='tight')
    plt.close()

if __name__ == "__main__":
    generate_ecg("normal_ecg.png", is_abnormal=False)
    generate_ecg("abnormal_afib_ecg.png", is_abnormal=True)
    print("Generated 2 ECG samples in c:\\apps\\cardio_twin\\ecg_samples\\")
