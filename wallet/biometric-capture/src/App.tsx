import { useState } from "react";

// Type definitions
interface BiometricMetrics {
  sharpness: string;
  lighting: string;
  contrast: string;
  faceDetection: string;
  noiseLevel: string;
  resolution: string;
}

interface BiometricAnalysisResult {
  fidelityScore: number;
  metrics: BiometricMetrics;
}

interface QualityMetrics {
  sharpness: number;
  lighting: number;
  contrast: number;
  faceRegion: number;
  noiseLevel: number;
  resolution: number;
}

interface TrustComputationRequest {
  identity_id: string;
  agreement_rate: number;
  biometric_fidelity: number;
  witness_score: number;
}

interface TrustComputationResult {
  identity_id: string;
  trust_score: number;
}

// Comprehensive biometric image quality analyzer
class BiometricAnalyzer {
  static async analyzeFace(imageFile: File): Promise<BiometricAnalysisResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const analysis = this.performQualityAnalysis(imageData);
          resolve(analysis);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }
  
  static performQualityAnalysis(imageData: ImageData): BiometricAnalysisResult {
    const { data: pixels, width, height } = imageData;
    
    // 1. Blur/Sharpness Detection (Laplacian variance)
    const sharpness = this.calculateSharpness(pixels, width, height);
    
    // 2. Lighting Quality Assessment
    const lighting = this.assessLighting(pixels, width, height);
    
    // 3. Contrast Analysis
    const contrast = this.calculateContrast(pixels, width, height);
    
    // 4. Face Region Detection (simplified)
    const faceRegion = this.detectFaceRegion(pixels, width, height);
    
    // 5. Noise Level Assessment
    const noiseLevel = this.assessNoise(pixels, width, height);
    
    // 6. Resolution Quality
    const resolution = this.assessResolution(width, height);
    
    // Combine all metrics into final fidelity score
    const fidelityScore = this.computeFidelityScore({
      sharpness,
      lighting,
      contrast,
      faceRegion,
      noiseLevel,
      resolution
    });
    
    return {
      fidelityScore: Math.max(0, Math.min(1, fidelityScore)),
      metrics: {
        sharpness: sharpness.toFixed(3),
        lighting: lighting.toFixed(3),
        contrast: contrast.toFixed(3),
        faceDetection: faceRegion.toFixed(3),
        noiseLevel: noiseLevel.toFixed(3),
        resolution: resolution.toFixed(3)
      }
    };
  }
  
  static calculateSharpness(pixels: Uint8ClampedArray, width: number, height: number): number {
    // Laplacian edge detection for sharpness
    let variance = 0;
    let count = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Convert to grayscale
        const center = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        
        // Laplacian kernel application
        const neighbors = [
          (pixels[((y-1) * width + x) * 4] + pixels[((y-1) * width + x) * 4 + 1] + pixels[((y-1) * width + x) * 4 + 2]) / 3,
          (pixels[(y * width + (x-1)) * 4] + pixels[(y * width + (x-1)) * 4 + 1] + pixels[(y * width + (x-1)) * 4 + 2]) / 3,
          (pixels[(y * width + (x+1)) * 4] + pixels[(y * width + (x+1)) * 4 + 1] + pixels[(y * width + (x+1)) * 4 + 2]) / 3,
          (pixels[((y+1) * width + x) * 4] + pixels[((y+1) * width + x) * 4 + 1] + pixels[((y+1) * width + x) * 4 + 2]) / 3
        ];
        
        const laplacian = Math.abs(-4 * center + neighbors.reduce((a, b) => a + b, 0));
        variance += laplacian * laplacian;
        count++;
      }
    }
    
    const sharpnessValue = Math.sqrt(variance / count);
    return Math.min(sharpnessValue / 50, 1); // Normalize
  }
  
  static assessLighting(pixels: Uint8ClampedArray, width: number, height: number): number {
    let totalBrightness = 0;
    let darkPixels = 0;
    let brightPixels = 0;
    const totalPixels = (width * height);
    
    for (let i = 0; i < pixels.length; i += 4) {
      const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      totalBrightness += brightness;
      
      if (brightness < 50) darkPixels++;
      if (brightness > 200) brightPixels++;
    }
    
    const avgBrightness = totalBrightness / totalPixels;
    const darkRatio = darkPixels / totalPixels;
    const brightRatio = brightPixels / totalPixels;
    
    // Good lighting: moderate average brightness, low dark/bright ratios
    const brightnessScore = 1 - Math.abs(avgBrightness - 128) / 128;
    const exposureScore = 1 - Math.max(darkRatio, brightRatio) * 2;
    
    return (brightnessScore + exposureScore) / 2;
  }
  
  static calculateContrast(pixels: Uint8ClampedArray, width: number, height: number): number {
    let min = 255, max = 0;
    const histogram = new Array(256).fill(0);
    
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = Math.round((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
      histogram[gray]++;
      min = Math.min(min, gray);
      max = Math.max(max, gray);
    }
    
    // RMS contrast calculation
    let mean = 0;
    let totalPixels = width * height;
    
    for (let i = 0; i < 256; i++) {
      mean += i * histogram[i];
    }
    mean /= totalPixels;
    
    let variance = 0;
    for (let i = 0; i < 256; i++) {
      variance += histogram[i] * Math.pow(i - mean, 2);
    }
    variance /= totalPixels;
    
    const rmsContrast = Math.sqrt(variance);
    return Math.min(rmsContrast / 70, 1); // Normalize
  }
  
  static detectFaceRegion(pixels: Uint8ClampedArray, width: number, height: number): number {
    // Simplified face detection using skin color detection
    let skinPixels = 0;
    let faceRegionPixels = 0;
    
    // Focus on center region where face is likely to be
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const regionSize = Math.min(width, height) * 0.4;
    
    for (let y = Math.max(0, centerY - regionSize/2); y < Math.min(height, centerY + regionSize/2); y++) {
      for (let x = Math.max(0, centerX - regionSize/2); x < Math.min(width, centerX + regionSize/2); x++) {
        const idx = (y * width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        
        // Simple skin detection algorithm
        if (this.isSkinColor(r, g, b)) {
          skinPixels++;
        }
        faceRegionPixels++;
      }
    }
    
    const skinRatio = skinPixels / faceRegionPixels;
    return Math.min(skinRatio * 3, 1); // Boost skin detection score
  }
  
  static isSkinColor(r: number, g: number, b: number): boolean {
    // Simplified skin color detection
    return (
      r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 15 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15
    );
  }
  
  static assessNoise(pixels: Uint8ClampedArray, width: number, height: number): number {
    // Simple noise assessment using local variance
    let totalVariance = 0;
    let windowCount = 0;
    const windowSize = 3;
    
    for (let y = windowSize; y < height - windowSize; y += windowSize) {
      for (let x = windowSize; x < width - windowSize; x += windowSize) {
        const windowVariance = this.calculateWindowVariance(pixels, width, x, y, windowSize);
        totalVariance += windowVariance;
        windowCount++;
      }
    }
    
    const avgVariance = totalVariance / windowCount;
    const noiseScore = 1 - Math.min(avgVariance / 1000, 1); // Less variance = less noise
    return noiseScore;
  }
  
  static calculateWindowVariance(pixels: Uint8ClampedArray, width: number, centerX: number, centerY: number, size: number): number {
    let sum = 0;
    let sumSquared = 0;
    let count = 0;
    
    for (let dy = -size; dy <= size; dy++) {
      for (let dx = -size; dx <= size; dx++) {
        const idx = ((centerY + dy) * width + (centerX + dx)) * 4;
        const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        sum += gray;
        sumSquared += gray * gray;
        count++;
      }
    }
    
    const mean = sum / count;
    const variance = (sumSquared / count) - (mean * mean);
    return variance;
  }
  
  static assessResolution(width: number, height: number): number {
    const totalPixels = width * height;
    const megapixels = totalPixels / (1024 * 1024);
    
    // Biometric systems typically need at least 0.3MP for face recognition
    if (megapixels >= 2.0) return 1.0;
    if (megapixels >= 1.0) return 0.9;
    if (megapixels >= 0.5) return 0.8;
    if (megapixels >= 0.3) return 0.6;
    return 0.3;
  }
  
  static computeFidelityScore(metrics: QualityMetrics): number {
    // Weighted combination of all quality metrics
    const weights = {
      sharpness: 0.25,    // Critical for feature extraction
      lighting: 0.20,     // Important for consistent analysis
      contrast: 0.15,     // Helps with feature definition
      faceRegion: 0.20,   // Face detection confidence
      noiseLevel: 0.10,   // Noise affects accuracy
      resolution: 0.10    // Minimum quality threshold
    };
    
    return (
      metrics.sharpness * weights.sharpness +
      metrics.lighting * weights.lighting +
      metrics.contrast * weights.contrast +
      metrics.faceRegion * weights.faceRegion +
      metrics.noiseLevel * weights.noiseLevel +
      metrics.resolution * weights.resolution
    );
  }
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [identity, setIdentity] = useState<string>("");
  const [result, setResult] = useState<TrustComputationResult | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [biometricAnalysis, setBiometricAnalysis] = useState<BiometricAnalysisResult | null>(null);
  const [hoveredInput, setHoveredInput] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!file || !identity) return;
    
    setUploading(true);
    setBiometricAnalysis(null);
    
    try {
      // Perform comprehensive biometric analysis
      const analysis = await BiometricAnalyzer.analyzeFace(file);
      setBiometricAnalysis(analysis);
      
      const requestBody: TrustComputationRequest = {
        identity_id: identity,
        agreement_rate: 0.95,
        biometric_fidelity: analysis.fidelityScore, // Real biometric analysis
        witness_score: 0.9,
      };
      
      const res = await fetch("http://localhost:8001/compute-trust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      const trustResult: TrustComputationResult = await res.json();
      setResult(trustResult);
    } catch (error) {
      console.error("Failed to compute trust", error);
      alert("Biometric analysis failed. Please try with a different image.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setIdentity(e.target.value);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0B0B1A 0%, #1A0B2E 50%, #2D1B69 100%)",
      color: "#E8E3FF",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      padding: "2rem",
      fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative" as const,
      overflow: "hidden" as const,
      width: '100%'
    },
    header: {
      textAlign: "center" as const,
      marginBottom: "3rem",
      zIndex: 1,
      position: "relative" as const,
    },
    title: {
      fontSize: "3.5rem",
      fontWeight: 700 as const,
      background: "linear-gradient(135deg, #8A2BE2 0%, #FF6B9D 50%, #00BFFF 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "0.5rem",
      letterSpacing: "-0.02em",
    },
    subtitle: {
      fontSize: "1.2rem",
      color: "#B8B3E6",
      fontWeight: 300 as const,
      opacity: 0.8,
    },
    formContainer: {
      width: "100%",
      maxWidth: "500px",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      padding: "2.5rem",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(138, 43, 226, 0.1)",
      zIndex: 1,
      position: "relative" as const,
      marginBottom: "2rem",
    },
    formTitle: {
      fontSize: "1.5rem",
      fontWeight: 600 as const,
      color: "#E8E3FF",
      marginBottom: "2rem",
      textAlign: "center" as const,
      background: "linear-gradient(135deg, #FF6B9D 0%, #8A2BE2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    inputGroup: {
      marginBottom: "1.5rem",
    },
    label: {
      display: "block",
      fontSize: "0.9rem",
      fontWeight: 500 as const,
      color: "#B8B3E6",
      marginBottom: "0.5rem",
      letterSpacing: "0.02em",
      textTransform: "uppercase" as const,
    },
    input: {
      width: "100%",
      padding: "1rem 1.25rem",
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      color: "#E8E3FF",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      outline: "none",
      backdropFilter: "blur(10px)",
      fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
      boxSizing: "border-box" as const,
    },
    inputFocus: {
      borderColor: "rgba(138, 43, 226, 0.5)",
      boxShadow: "0 0 20px rgba(138, 43, 226, 0.3)",
      background: "rgba(255, 255, 255, 0.08)",
    },
    fileInput: {
      width: "100%",
      padding: "1rem 1.25rem",
      background: "rgba(255, 255, 255, 0.05)",
      border: "2px dashed rgba(255, 255, 255, 0.2)",
      borderRadius: "12px",
      color: "#B8B3E6",
      fontSize: "0.95rem",
      transition: "all 0.3s ease",
      outline: "none",
      backdropFilter: "blur(10px)",
      cursor: "pointer" as const,
      boxSizing: "border-box" as const,
    },
    fileInputHover: {
      borderColor: "rgba(255, 107, 157, 0.5)",
      background: "rgba(255, 255, 255, 0.08)",
    },
    button: {
      width: "100%",
      padding: "1.25rem 2rem",
      background: "linear-gradient(135deg, #8A2BE2 0%, #FF6B9D 100%)",
      border: "none",
      borderRadius: "12px",
      color: "#FFFFFF",
      fontSize: "1rem",
      fontWeight: 600 as const,
      letterSpacing: "0.02em",
      textTransform: "uppercase" as const,
      cursor: "pointer" as const,
      transition: "all 0.3s ease",
      boxShadow: "0 10px 30px rgba(138, 43, 226, 0.3)",
      position: "relative" as const,
      overflow: "hidden" as const,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonDisabled: {
      background: "rgba(255, 255, 255, 0.1)",
      cursor: "not-allowed" as const,
      boxShadow: "none",
    },
    loadingSpinner: {
      width: "20px",
      height: "20px",
      border: "2px solid rgba(255, 255, 255, 0.3)",
      borderTop: "2px solid #FFFFFF",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginRight: "0.5rem",
    },
    analysisContainer: {
      width: "100%",
      maxWidth: "500px",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      padding: "2rem",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 107, 157, 0.1)",
      zIndex: 1,
      position: "relative" as const,
      marginBottom: "2rem",
    },
    resultContainer: {
      width: "100%",
      maxWidth: "500px",
      background: "rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      padding: "2rem",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 255, 135, 0.1)",
      zIndex: 1,
      position: "relative" as const,
    },
    sectionTitle: {
      fontSize: "1.3rem",
      fontWeight: 600 as const,
      color: "#E8E3FF",
      marginBottom: "1.5rem",
      textAlign: "center" as const,
      background: "linear-gradient(135deg, #FF6B9D 0%, #8A2BE2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    resultTitle: {
      fontSize: "1.3rem",
      fontWeight: 600 as const,
      color: "#E8E3FF",
      marginBottom: "1.5rem",
      textAlign: "center" as const,
      background: "linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    metricItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.75rem 0",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    metricLabel: {
      color: "#B8B3E6",
      fontSize: "0.9rem",
      fontWeight: 500 as const,
    },
    metricValue: {
      color: "#E8E3FF",
      fontSize: "0.95rem",
      fontWeight: 600 as const,
      fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
    },
    fidelityScore: {
      fontSize: "1.8rem",
      fontWeight: 700 as const,
      background: "linear-gradient(135deg, #FF6B9D 0%, #8A2BE2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    trustScore: {
      fontSize: "1.5rem",
      fontWeight: 700 as const,
      background: "linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    badge: {
      padding: "0.5rem 1rem",
      borderRadius: "25px",
      fontWeight: 600 as const,
      fontSize: "0.85rem",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      border: "2px solid transparent",
      textAlign: "center" as const,
    },
    trustedBadge: {
      background: "linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)",
      color: "#0B0B1A",
    },
    lowTrustBadge: {
      background: "linear-gradient(135deg, #FF6B9D 0%, #FFA500 100%)",
      color: "#0B0B1A",
    },
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Advanced Biometric Analysis</h1>
          <p style={styles.subtitle}>Multi-Factor Quality Assessment</p>
        </div>

        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>Biometric Quality Scanner</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <div style={styles.label}>Identity Signature</div>
              <input
                type="text"
                placeholder="Enter identity ID"
                value={identity}
                onChange={handleIdentityChange}
                style={{
                  ...styles.input,
                  ...(hoveredInput === "identity" ? styles.inputFocus : {})
                }}
                onFocus={() => setHoveredInput("identity")}
                onBlur={() => setHoveredInput(null)}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.label}>Biometric Image</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  ...styles.fileInput,
                  ...(hoveredInput === "file" ? styles.fileInputHover : {})
                }}
                onMouseEnter={() => setHoveredInput("file")}
                onMouseLeave={() => setHoveredInput(null)}
              />
              {file && (
                <p style={{ 
                  marginTop: "0.5rem", 
                  fontSize: "0.85rem", 
                  color: "#00FF87",
                  fontWeight: 500
                }}>
                  ✓ {file.name} loaded ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || !identity || uploading}
              style={{
                ...styles.button,
                ...((!file || !identity || uploading) ? styles.buttonDisabled : {})
              }}
            >
              {uploading ? (
                <>
                  <div style={styles.loadingSpinner}></div>
                  Analyzing Biometrics...
                </>
              ) : (
                "◈ Perform Quality Analysis"
              )}
            </button>
          </form>
        </div>

        {biometricAnalysis && (
          <div style={styles.analysisContainer}>
            <h3 style={styles.sectionTitle}>✦ Biometric Quality Assessment</h3>
            
            <div style={{...styles.metricItem, borderBottom: "none", justifyContent: "center", paddingBottom: "1rem"}}>
              <div style={{ textAlign: "center" }}>
                <div style={styles.metricLabel}>Overall Fidelity Score</div>
                <div style={styles.fidelityScore}>{biometricAnalysis.fidelityScore.toFixed(3)}</div>
              </div>
            </div>
            
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Sharpness Quality</span>
              <span style={styles.metricValue}>{biometricAnalysis.metrics.sharpness}</span>
            </div>
            
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Lighting Assessment</span>
              <span style={styles.metricValue}>{biometricAnalysis.metrics.lighting}</span>
            </div>
            
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Contrast Analysis</span>
              <span style={styles.metricValue}>{biometricAnalysis.metrics.contrast}</span>
            </div>
            
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Face Detection</span>
              <span style={styles.metricValue}>{biometricAnalysis.metrics.faceDetection}</span>
            </div>
            
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Noise Level</span>
              <span style={styles.metricValue}>{biometricAnalysis.metrics.noiseLevel}</span>
            </div>
            
            <div style={{...styles.metricItem, borderBottom: "none"}}>
              <span style={styles.metricLabel}>Resolution Quality</span>
              <span style={styles.metricValue}>{biometricAnalysis.metrics.resolution}</span>
            </div>
          </div>
        )}

        {result && (
          <div style={styles.resultContainer}>
            <h3 style={styles.resultTitle}>✦ Trust Computation Complete</h3>
            
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Identity Verified</span>
              <span style={styles.metricValue}>{result.identity_id}</span>
            </div>
            
            <div style={{
              ...styles.metricItem, 
              borderBottom: "none", 
              justifyContent: "center", 
              flexDirection: "column", 
              gap: "1rem", 
              paddingTop: "1.5rem"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                width: "100%" 
              }}>
                <span style={styles.metricLabel}>Final Trust Score</span>
                <span style={styles.trustScore}>{result.trust_score.toFixed(3)}</span>
              </div>
              
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                {result.trust_score > 0.7 ? (
                  <div style={{...styles.badge, ...styles.trustedBadge}}>
                    ✦ Biometric Verified
                  </div>
                ) : (
                  <div style={{...styles.badge, ...styles.lowTrustBadge}}>
                    ⚠ Quality Threshold Not Met
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default App;