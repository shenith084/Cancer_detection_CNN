import React, { useState } from 'react';
import { Upload, Activity, FileText, AlertCircle, CheckCircle, Brain, X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Demo Mode Toggle
  const [demoMode, setDemoMode] = useState(false);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file (JPEG/PNG).");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    // --- DEMO MODE LOGIC ---
    if (demoMode) {
      setTimeout(() => {
        // Simulate a random result
        const outcomes = [
          { prediction: 'Glioma Tumor', confidence: '98.5%' },
          { prediction: 'Meningioma Tumor', confidence: '92.1%' },
          { prediction: 'No Tumor', confidence: '99.9%' }
        ];
        const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        setResult(randomOutcome);
        setIsAnalyzing(false);
      }, 2000); // Fake 2 second delay
      return;
    }

    // --- REAL BACKEND LOGIC ---
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError("Could not connect to the AI model. Make sure 'python server.py' is running in a separate terminal.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">NeuroScan AI</span>
          </div>

          {/* Demo Mode Toggle */}
          <button 
            onClick={() => setDemoMode(!demoMode)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            {demoMode ? <ToggleRight className="w-8 h-8 text-indigo-600" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
            {demoMode ? "Demo Mode: ON" : "Demo Mode: OFF"}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Brain Tumor Detection System</h1>
          <p className="text-slate-600">Upload an MRI scan to analyze it with your deep learning model.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* LEFT: Upload Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div 
              className={`
                border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center transition-all
                ${preview ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {!preview ? (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-medium text-slate-900">Drag & Drop MRI Scan</p>
                  <p className="text-sm text-slate-500 mb-6">or click to browse</p>
                  <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-lg transition-colors">
                    Choose File
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e.target.files[0])} />
                  </label>
                </div>
              ) : (
                <div className="relative w-full h-full p-2">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  <button onClick={resetAnalysis} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-white text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={analyzeImage}
              disabled={!selectedFile || isAnalyzing}
              className={`
                w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                ${!selectedFile || isAnalyzing 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:-translate-y-1'}
              `}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" /> Run Diagnosis
                </>
              )}
            </button>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Connection Failed</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Results Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" /> Analysis Results
            </h2>

            {!result ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Activity className="w-12 h-12 mb-3 opacity-20" />
                <p>No results yet</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Main Prediction Box */}
                <div className={`p-6 rounded-xl border-l-8 ${
                  result.prediction === 'No Tumor' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex items-center gap-4 mb-2">
                    {result.prediction === 'No Tumor' 
                      ? <CheckCircle className="w-8 h-8 text-green-600" /> 
                      : <AlertCircle className="w-8 h-8 text-red-600" />
                    }
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{result.prediction}</h3>
                      <p className="text-slate-600 font-medium">Confidence: {result.confidence}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs uppercase font-bold text-slate-400">Scan Type</span>
                    <p className="text-lg font-semibold text-slate-800">MRI / T1-Weighted</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs uppercase font-bold text-slate-400">Processing Time</span>
                    <p className="text-lg font-semibold text-slate-800">
                      {demoMode ? 'Simulated' : '0.45s'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-100">
                  <strong>Note:</strong> This is an AI-generated result. Please consult a medical professional for verification.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}