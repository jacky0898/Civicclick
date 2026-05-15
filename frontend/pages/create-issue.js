import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Toast from '../components/Toast';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';

const MAX_SIZE_MB = 5;
const ISSUE_TYPES = ['Civic', 'Tourist', 'Safety Hazard', 'Infrastructure', 'Sanitation'];
const PRIORITIES  = ['High — Unsafe', 'Medium — Needs Attention', 'Low — Minor'];

export default function CreateIssue() {
  const router = useRouter();
  const { user, ready } = useAuth({ requireAuth: true });

  const [form, setForm] = useState({ title: '', description: '', issueType: '', priority: '', lat: '', lng: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [imageMode, setImageMode] = useState('upload');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const roleError = ready && user && user.role !== 'citizen' ? 'Only citizens can report issues.' : '';
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setToast({ message: 'Only JPEG and PNG files are allowed', type: 'error' }); e.target.value = ''; return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setToast({ message: `File size must not exceed ${MAX_SIZE_MB}MB`, type: 'error' }); e.target.value = ''; return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch { setCameraError('Camera access denied. Please allow camera permission.'); }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImageFile(file); setImagePreview(URL.createObjectURL(blob)); stopCamera();
    }, 'image/jpeg', 0.92);
  }, [stopCamera]);

  const clearImage = () => {
    setImageFile(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    stopCamera();
  };

  const switchMode = (mode) => { clearImage(); setImageMode(mode); setCameraError(''); };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setToast({ message: 'Geolocation not supported', type: 'error' }); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() })),
      () => setToast({ message: 'Could not get location', type: 'error' })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { setToast({ message: 'Please provide a photo of the issue', type: 'error' }); return; }
    setLoading(true);
    try {
      const data = new FormData();
      const enrichedTitle = form.issueType ? `[${form.issueType}] ${form.title}` : form.title;
      data.append('title', enrichedTitle);
      data.append('description', form.description);
      data.append('lat', form.lat);
      data.append('lng', form.lng);
      data.append('image', imageFile);
      await api.post('/issues', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setToast({ message: '✅ Issue reported! Thank you for keeping the community safe.', type: 'success' });
      setTimeout(() => router.push('/dashboard'), 1800);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create issue', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full border border-sky-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400 transition-all bg-white/80';
  const labelClass = 'block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide';

  if (!ready) return null;

  return (
    <div
      className="min-h-screen flex items-start justify-center py-10 px-4"
      style={{ background: 'linear-gradient(160deg, #f0f9ff 0%, #f0fdfa 60%, #f8fafc 100%)' }}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div
        className="w-full max-w-lg rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(14,165,233,0.12)',
          boxShadow: '0 8px 40px rgba(14,165,233,0.1), 0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🚨</span>
            <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
          </div>
          <p className="text-sm text-sky-600 font-medium mt-0.5">
            Report issues to help citizens and tourists stay safe across Goa
          </p>
        </div>

        {roleError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            ⚠️ {roleError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Issue Title</label>
            <input name="title" value={form.title} onChange={handleChange} required className={inputClass} placeholder="e.g. Broken streetlight near tourist beach" />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className={inputClass} placeholder="Describe the issue clearly — location details help volunteers find it faster." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Issue Type</label>
              <select name="issueType" value={form.issueType} onChange={handleChange} className={inputClass}>
                <option value="">Select type...</option>
                {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
                <option value="">Select priority...</option>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className={labelClass}>Photo Evidence</label>
            <div className="flex gap-2 mb-3">
              {[{ key: 'upload', icon: '📁', label: 'Upload' }, { key: 'camera', icon: '📸', label: 'Live Camera' }].map(({ key, icon, label }) => (
                <button key={key} type="button" onClick={() => switchMode(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    imageMode === key ? 'text-white border-transparent' : 'bg-white text-gray-600 border-sky-100 hover:border-sky-300'
                  }`}
                  style={imageMode === key ? { background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)' } : {}}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-sky-100">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button type="button" onClick={clearImage} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs px-2 py-1 rounded-lg">✕ Remove</button>
              </div>
            ) : imageMode === 'upload' ? (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-sky-200 rounded-2xl cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all">
                <span className="text-3xl mb-1">📁</span>
                <span className="text-sm text-gray-500">Click to upload a photo</span>
                <span className="text-xs text-gray-400 mt-0.5">JPEG or PNG · max 5MB</span>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="rounded-2xl overflow-hidden border border-sky-100 bg-black">
                {cameraError ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2 px-4 text-center">
                    <span className="text-2xl">🚫</span>
                    <p className="text-sm text-red-400">{cameraError}</p>
                    <button type="button" onClick={startCamera} className="text-xs text-sky-400 hover:underline mt-1">Try again</button>
                  </div>
                ) : cameraActive ? (
                  <div className="relative">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-56 object-cover" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                      <button type="button" onClick={capturePhoto} className="w-14 h-14 rounded-full bg-white border-4 border-sky-200 hover:border-sky-400 shadow-lg transition-all active:scale-95 flex items-center justify-center">
                        <span className="w-10 h-10 rounded-full block" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)' }} />
                      </button>
                    </div>
                    <button type="button" onClick={stopCamera} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white text-xs px-2 py-1 rounded-lg">✕ Close</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-36 gap-2 cursor-pointer hover:bg-gray-900 transition-colors" onClick={startCamera}>
                    <span className="text-4xl">📸</span>
                    <span className="text-sm text-gray-300">Tap to open camera</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Latitude</label>
              <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} required className={inputClass} placeholder="15.2993" />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} required className={inputClass} placeholder="74.1240" />
            </div>
          </div>

          <button type="button" onClick={useMyLocation}
            className="w-full border border-sky-200 text-sky-600 text-sm py-2.5 rounded-xl hover:bg-sky-50 transition-all font-medium">
            📍 Use My Current Location
          </button>

          <button type="submit" disabled={loading || !!roleError}
            className="w-full text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)', boxShadow: '0 4px 16px rgba(14,165,233,0.35)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading & Submitting...
              </span>
            ) : '🚨 Submit Issue Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
