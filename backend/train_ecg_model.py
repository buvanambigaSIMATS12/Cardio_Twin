import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

def generate_clinical_dataset(n_samples_per_class=1000, random_seed=42):
    np.random.seed(random_seed)
    
    classes = ["Normal", "Arrhythmia", "AFib", "VT", "STEMI"]
    X = []
    y = []
    
    for idx, cls in enumerate(classes):
        for _ in range(n_samples_per_class):
            if cls == "Normal":
                mean_rr = np.random.normal(800, 40)
                std_rr = np.random.normal(30, 10)
                qrs_dur = np.random.normal(90, 8)
                p_amp = np.random.normal(0.15, 0.03)
                t_amp = np.random.normal(0.3, 0.05)
                st_elev = np.random.normal(0.05, 0.05)
                noise = np.random.normal(0.02, 0.01)
                fft_low = np.random.normal(15.0, 2.0)
                fft_mid = np.random.normal(8.0, 1.5)
                fft_high = np.random.normal(3.0, 0.8)
                hr = 60000 / mean_rr
                rr_irreg = np.random.normal(0.05, 0.02)
                
            elif cls == "Arrhythmia":
                mean_rr = np.random.normal(750, 100)
                std_rr = np.random.normal(110, 25)
                qrs_dur = np.random.normal(105, 15)
                p_amp = np.random.normal(0.12, 0.04)
                t_amp = np.random.normal(0.25, 0.08)
                st_elev = np.random.normal(0.1, 0.1)
                noise = np.random.normal(0.04, 0.02)
                fft_low = np.random.normal(12.0, 3.0)
                fft_mid = np.random.normal(14.0, 3.0)
                fft_high = np.random.normal(7.0, 2.0)
                hr = 60000 / mean_rr
                rr_irreg = np.random.normal(0.55, 0.1)
                
            elif cls == "AFib":
                mean_rr = np.random.normal(650, 150)
                std_rr = np.random.normal(180, 40)
                qrs_dur = np.random.normal(88, 10)
                p_amp = np.random.normal(0.02, 0.01) # Absent P wave
                t_amp = np.random.normal(0.2, 0.06)
                st_elev = np.random.normal(0.05, 0.05)
                noise = np.random.normal(0.08, 0.03) # Fibrillatory baseline waves
                fft_low = np.random.normal(8.0, 2.0)
                fft_mid = np.random.normal(20.0, 4.0) # High f-wave spectrum
                fft_high = np.random.normal(10.0, 2.5)
                hr = 60000 / mean_rr
                rr_irreg = np.random.normal(0.88, 0.08) # Irregularly irregular
                
            elif cls == "VT":
                mean_rr = np.random.normal(360, 40) # Tachycardia HR ~166
                std_rr = np.random.normal(15, 8) # Regular fast
                qrs_dur = np.random.normal(150, 18) # Wide complex QRS > 120ms
                p_amp = np.random.normal(0.03, 0.02) # Dissociated P waves
                t_amp = np.random.normal(0.8, 0.15) # Tall broad T waves
                st_elev = np.random.normal(0.2, 0.15)
                noise = np.random.normal(0.03, 0.01)
                fft_low = np.random.normal(28.0, 5.0) # Dominant ventricular frequency
                fft_mid = np.random.normal(10.0, 2.0)
                fft_high = np.random.normal(4.0, 1.0)
                hr = 60000 / mean_rr
                rr_irreg = np.random.normal(0.1, 0.04)
                
            elif cls == "STEMI":
                mean_rr = np.random.normal(700, 80)
                std_rr = np.random.normal(35, 12)
                qrs_dur = np.random.normal(95, 10)
                p_amp = np.random.normal(0.14, 0.03)
                t_amp = np.random.normal(0.9, 0.2) # Hyperacute T wave
                st_elev = np.random.normal(2.4, 0.4) # Pathognomonic ST elevation > 1mm
                noise = np.random.normal(0.02, 0.01)
                fft_low = np.random.normal(18.0, 3.0)
                fft_mid = np.random.normal(12.0, 2.5)
                fft_high = np.random.normal(5.0, 1.2)
                hr = 60000 / mean_rr
                rr_irreg = np.random.normal(0.08, 0.03)
                
            features = [mean_rr, std_rr, qrs_dur, p_amp, t_amp, st_elev, noise, fft_low, fft_mid, fft_high, hr, rr_irreg]
            X.append(features)
            y.append(cls)
            
    return np.array(X), np.array(y)

def train():
    print("Generating 5,000 clinical ECG feature records across 5 diagnostic classes...")
    X, y = generate_clinical_dataset(n_samples_per_class=1000)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Training Random Forest Classifier on {len(X_train)} samples...")
    clf = RandomForestClassifier(n_estimators=150, max_depth=12, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nModel Evaluation Complete! Test Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred))
    
    out_dir = os.path.join(os.path.dirname(__file__), "services")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "ecg_real_model.pkl")
    
    joblib.dump(clf, out_path)
    print(f"Trained model serialized successfully to: {out_path}")

if __name__ == "__main__":
    train()
