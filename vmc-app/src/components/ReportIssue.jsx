import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import {
    Camera, MapPin, Send, ArrowLeft, Image as ImageIcon,
    Navigation, X, RefreshCw, CheckCircle, Upload
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { submitComplaint } from '../api';
import './ReportIssue.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const selectedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) { onLocationSelect(e.latlng); },
    });
    return null;
};

const ReportIssue = () => {
    const navigate = useNavigate();

    // Form state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted]       = useState(false);
    const [submitError, setSubmitError]   = useState('');
    const [category, setCategory]         = useState('');
    const [description, setDescription]   = useState('');

    // Map state
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationText, setLocationText] = useState('');
    const [loadingGPS, setLoadingGPS] = useState(false);
    const [mapCenter] = useState([22.3072, 73.1812]);
    const mapRef = useRef(null);

    // Camera / photo state
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [capturedPhoto, setCapturedPhoto] = useState(null); // base64 string
    const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back cam
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // ── Map helpers ──────────────────────────────────────────────────────────
    const handleLocationSelect = async (latlng) => {
        setSelectedLocation(latlng);
        setLocationText(`${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
            );
            const data = await res.json();
            if (data.display_name) {
                setLocationText(data.display_name.split(',').slice(0, 3).join(', '));
            }
        } catch { /* keep coordinates */ }
    };

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
        setLoadingGPS(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                handleLocationSelect(latlng);
                setLoadingGPS(false);
                if (mapRef.current) mapRef.current.setView([latlng.lat, latlng.lng], 16);
            },
            () => { alert('Unable to retrieve your location.'); setLoadingGPS(false); }
        );
    };

    // ── Camera helpers ───────────────────────────────────────────────────────
    const startCamera = useCallback(async (facing = facingMode) => {
        setCameraError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            setCameraError('Camera access denied. Please allow camera permission in your browser settings.');
        }
    }, [facingMode]);

    const openCamera = async () => {
        setCapturedPhoto(null);
        setCameraOpen(true);
        // slight delay to let modal mount
        setTimeout(() => startCamera(facingMode), 100);
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    const closeCamera = () => {
        stopCamera();
        setCameraOpen(false);
        setCameraError('');
    };

    const snapPhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(dataUrl);
        stopCamera();
    };

    const retakePhoto = () => {
        setCapturedPhoto(null);
        startCamera(facingMode);
    };

    const confirmPhoto = () => {
        closeCamera();
        // capturedPhoto stays set — displayed as preview
    };

    const flipCamera = async () => {
        const next = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(next);
        stopCamera();
        setTimeout(() => startCamera(next), 100);
    };

    const removePhoto = () => setCapturedPhoto(null);

    // File upload handler
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setCapturedPhoto(ev.target.result);
        reader.readAsDataURL(file);
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError('');
        try {
            const formData = new FormData();
            formData.append('category', category);
            formData.append('description', description);
            formData.append('locationText', locationText);
            if (selectedLocation) {
                formData.append('lat', selectedLocation.lat);
                formData.append('lng', selectedLocation.lng);
            }
            // Attach photo — convert base64 to Blob if captured from camera
            if (capturedPhoto) {
                const res = await fetch(capturedPhoto);
                const blob = await res.blob();
                formData.append('photo', blob, 'photo.jpg');
            }
            await submitComplaint(formData);
            setSubmitted(true);
            setTimeout(() => navigate('/app'), 3000);
        } catch (err) {
            setSubmitError(err.message || 'Submission failed. Try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Success screen ───────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="report-page-container flex-center">
                <div className="success-card glass-panel animate-fade-in">
                    <div className="success-icon-wrapper">
                        <Send size={48} className="success-icon pulse" />
                    </div>
                    <h2>Issue Reported Successfully!</h2>
                    <p>Thank you for helping keep Vadodara clean and safe. Our team is on it.</p>
                    <p className="text-muted text-sm mt-4">Redirecting you to the home page...</p>
                </div>
            </div>
        );
    }

    // ── Main form ────────────────────────────────────────────────────────────
    return (
        <div className="report-page-container">
            {/* Camera Modal */}
            {cameraOpen && (
                <div className="camera-modal-overlay" onClick={closeCamera}>
                    <div className="camera-modal glass-panel" onClick={e => e.stopPropagation()}>
                        <button className="camera-close-btn" onClick={closeCamera}>
                            <X size={20} />
                        </button>

                        <h3 className="camera-modal-title">
                            <Camera size={18} /> Take a Photo
                        </h3>

                        {cameraError ? (
                            <div className="camera-error">
                                <p>{cameraError}</p>
                                <button className="btn btn-secondary mt-2" onClick={() => fileInputRef.current?.click()}>
                                    <Upload size={16} /> Upload from Gallery
                                </button>
                            </div>
                        ) : capturedPhoto ? (
                            /* Preview of snapped photo */
                            <div className="camera-preview-wrapper">
                                <img src={capturedPhoto} alt="Captured" className="camera-preview-img" />
                                <div className="camera-actions">
                                    <button className="btn btn-secondary" onClick={retakePhoto}>
                                        <RefreshCw size={16} /> Retake
                                    </button>
                                    <button className="btn btn-primary" onClick={confirmPhoto}>
                                        <CheckCircle size={16} /> Use Photo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Live viewfinder */
                            <div className="camera-viewfinder-wrapper">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="camera-video"
                                />
                                <div className="camera-actions">
                                    <button className="btn btn-secondary" onClick={flipCamera} title="Flip Camera">
                                        <RefreshCw size={16} /> Flip
                                    </button>
                                    <button className="snap-btn" onClick={snapPhoto}>
                                        <div className="snap-inner" />
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                                        <Upload size={16} /> Gallery
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Hidden canvas for snap */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                </div>
            )}

            {/* Hidden file input (for gallery upload from camera modal too) */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
            />

            <div className="report-header text-center">
                <button className="back-btn glass-panel" onClick={() => navigate('/app')}>
                    <ArrowLeft size={20} /> Back
                </button>
                <h1 className="hero-title">Report an <span className="text-gradient">Issue</span></h1>
                <p className="text-muted">Provide details below to alert the Vadodara Municipal Corporation.</p>
            </div>

            <div className="form-container glass-panel animate-fade-in">
                <form onSubmit={handleSubmit}>

                    {/* Category */}
                    <div className="form-group">
                        <label>Issue Category</label>
                        <select
                            required
                            className="glass-input"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="">Select a category...</option>
                            <option value="garbage">Garbage Collection</option>
                            <option value="pothole">Pothole Detection</option>
                            <option value="light">Street Light Issue</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Map */}
                    <div className="form-group">
                        <label>
                            <MapPin size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                            Pin Location on Map
                        </label>
                        <p className="map-hint">Click anywhere on the map to select the issue location.</p>
                        <div className="map-wrapper">
                            <MapContainer center={mapCenter} zoom={13} className="report-map" ref={mapRef}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <MapClickHandler onLocationSelect={handleLocationSelect} />
                                {selectedLocation && <Marker position={selectedLocation} icon={selectedIcon} />}
                            </MapContainer>
                        </div>
                        <button
                            type="button"
                            className={`btn btn-secondary get-location-btn mt-2 ${loadingGPS ? 'loading' : ''}`}
                            onClick={handleGetCurrentLocation}
                            disabled={loadingGPS}
                        >
                            <Navigation size={16} />
                            {loadingGPS ? 'Getting Location...' : 'Use My Current Location'}
                        </button>
                        {locationText && (
                            <div className="selected-location-badge">
                                <MapPin size={14} />
                                <span>{locationText}</span>
                            </div>
                        )}
                        <input
                            type="text"
                            value={locationText}
                            onChange={e => setLocationText(e.target.value)}
                            placeholder="Or type address manually..."
                            className="glass-input"
                            style={{ marginTop: '0.75rem' }}
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Describe the issue in detail..."
                            rows="4"
                            required
                            className="glass-input resize-none"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Photo Upload — with camera */}
                    <div className="form-group">
                        <label>
                            <Camera size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                            Photo Evidence
                        </label>

                        {capturedPhoto ? (
                            /* Photo preview */
                            <div className="photo-preview-wrapper">
                                <img src={capturedPhoto} alt="Issue" className="photo-preview" />
                                <div className="photo-preview-actions">
                                    <button type="button" className="btn btn-secondary" onClick={openCamera}>
                                        <RefreshCw size={15} /> Retake
                                    </button>
                                    <button type="button" className="btn-remove" onClick={removePhoto}>
                                        <X size={15} /> Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Upload / camera buttons */
                            <div className="upload-area glass-input text-center">
                                <ImageIcon size={32} className="text-muted mb-2" />
                                <p className="text-sm" style={{ marginBottom: '1rem' }}>
                                    Take a photo or upload from gallery
                                </p>
                                <div className="upload-btns">
                                    <button type="button" className="btn btn-primary" onClick={openCamera}>
                                        <Camera size={17} /> Open Camera
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                                        <Upload size={17} /> Upload Photo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {submitError && (
                        <div className="submit-error">{submitError}</div>
                    )}
                    <button
                        type="submit"
                        className={`submit-btn btn btn-primary ${isSubmitting ? 'pulse' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Report</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportIssue;
