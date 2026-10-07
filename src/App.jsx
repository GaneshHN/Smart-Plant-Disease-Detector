
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const navItems = [
    { key: 'home', label: 'Home', href: '#home' },
    { key: 'detect', label: 'Detect', href: '#detect-disease' },
    { key: 'features', label: 'Features', href: '#features' },
    { key: 'about', label: 'About', href: '#about-project' },
    { key: 'contact', label: 'Contact', href: '#contact' },
];
const features = [
    { title: 'Easy to Use', description: 'Simple and intuitive interface anyone can use in the field.' },
    { title: 'Fast Results', description: 'Get disease identification in seconds with clear guidance.' },
    { title: 'Works on Mobile', description: 'Scan crops directly from your phone while in the field.' },
    { title: 'Helpful Suggestions', description: 'Clear treatment and prevention advice for each disease.' },
    { title: 'Accurate Detection', description: 'Reliable identification trained on thousands of real leaf samples.' },
    { title: 'Free to Use', description: 'No subscriptions or hidden fees, just helpful disease detection.' },
];

const i18n = {
    en: {
        nav: {
            home: 'Home',
            detect: 'Detect',
            features: 'Features',
            about: 'About',
            contact: 'Contact',
        },
        hero: {
            title: "Know Your Plants' Health",
            subtitle: 'Take a photo of any leaf and get instant disease detection with clear treatment advice. Simple, accurate, and built for farmers.',
            start: 'Start Scanning',
            learn: 'Learn More',
        },
        detection: {
            title: 'Scan Your Plants',
            description: 'Take a photo of any leaf to check for disease.',
            upload: 'Upload Photo',
            camera: 'Take Photo',
            analyze: 'Check for Disease',
            reset: 'Upload New Photo',
            checkAnother: 'Check Another Plant',
            analyzing: 'Analyzing your photo...',
            noImage: 'Please upload an image first.',
            invalidFormat: 'Unsupported file format. Use JPG, PNG or WEBP.',
            tooLarge: 'Image is too large. Use a file under 6MB.',
            sample: 'Use Sample Tomato Leaf',
            sampleError: 'Unable to load the sample image. Try again later.',
        },
        history: {
            title: 'Detection History',
            empty: 'No past scans yet. Your results will show here once you analyze an image.',
            report: 'Download PDF',
        },
        weather: {
            title: 'Weather Check',
            placeholder: 'Enter city or town',
            button: 'Fetch Weather',
            loading: 'Loading weather...',
            error: 'Unable to get weather for this location.',
            current: 'Current Weather',
        },
        login: {
            title: 'Local Login',
            signup: 'Sign Up',
            signin: 'Log In',
            name: 'Name',
            email: 'Email',
            password: 'Password',
            submit: 'Submit',
            logout: 'Logout',
            successSignup: 'Signup successful! You are now logged in.',
            successLogin: 'Login successful!',
            invalidCredentials: 'Invalid credentials. Please try again.',
        },
        voice: {
            title: 'Voice Assistant',
            listen: 'Start Listening',
            stop: 'Stop Listening',
            statusListening: 'Listening… speak now',
            notSupported: 'Voice recognition not supported in this browser.',
        },
        chat: {
            title: 'AI Chat Assistant',
            placeholder: 'Ask about plant disease care...',
            send: 'Send',
        },
        assistant: {
            prompt: 'Hi there! Ask me about crop health or disease care.',
        },
    },
    kn: {
        nav: {
            home: 'ಮುಖಪುಟ',
            detect: 'ಗುಣಿಸು',
            features: 'ವೈಶಿಷ್ಟ್ಯಗಳು',
            about: 'ಬಗ್ಗೆ',
            contact: 'ಸಂಪರ್ಕ',
        },
        hero: {
            title: 'ನಿಮ್ಮ ಫಸಲಿನ ಆರೋಗ್ಯ ತಿಳಿದುಕೊಳ್ಳಿ',
            subtitle: 'ಯಾವುದೇ ಎಲೆ ಫೋಟೊ ತೆಗೆದು તરทัน ಕಾಯಿಲೆ ಗುರುತಿಸಿ. ಸರಳ, ನಿಖರ ಮತ್ತು ರೈತರಿಗೆ ಸೂಕ್ತ.',
            start: 'ಸ್ಕ್ಯಾನ್ ಪ್ರಾರಂಭಿಸಿ',
            learn: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
        },
        detection: {
            title: 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
            description: 'ಯಾವುದೇ ಎಲೆ ಫೋಟೊ ತೆಗೆದು ಕಾಯಿಲೆ ಪರಿಶೀಲಿಸಿ.',
            upload: 'ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ',
            camera: 'ಕ್ಯಾಮೆರಾ ಬಳಸಿ',
            analyze: 'ರೋಗ ಪರಿಶೀಲಿಸಿ',
            reset: 'ಹೊಸ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ',
            checkAnother: 'ಮತ್ತೊಂದು ಗಿಡ ಪರಿಶೀಲಿಸಿ',
            analyzing: 'ನಿಮ್ಮ ಫೋಟೋ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
            noImage: 'ದಯವಿಟ್ಟು ಮೊದಲಿಗೆ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ.',
            invalidFormat: 'ಅಮಾನ್ಯ ಫೈಲ್ ಸ್ವರೂಪ. JPG, PNG ಅಥವಾ WEBP ಬಳಸಿ.',
            tooLarge: 'ಚಿತ್ರವು ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ. 6MB ಗಿಂತ ಕಡಿಮೆ ಬಳಸಿ.',
            sample: 'ಟೊಮ್ಯಾಟೋ ಎಲೆ ಮಾದರಿಯನ್ನು ಬಳಸಿರಿ',
            sampleError: 'ಮಾದರಿ ಚಿತ್ರವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾದೇ ಇಲ್ಲ. ನಂತರ ಪ್ರಯತ್ನಿಸಿ.',
        },
        history: {
            title: 'ಪ್ರಿವಾಸ್ ಸಂರೇಖೆ',
            empty: 'ಇನ್ನೀಗ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್ ಇಲ್ಲ. ನಿಮ್ಮ ಫಲಿತಾಂಶಗಳು ಇಲ್ಲಿ ತೋರಿಸಲಾಗುತ್ತದೆ.',
            report: 'PDF ಡೌನ್‌ಲೋಡ್',
        },
        weather: {
            title: 'ಹವಾಮಾನ ಪರಿಶೀಲನೆ',
            placeholder: 'ನಗರ ಅಥವಾ ಪಟ್ಟಣವನ್ನು ನಮೂದಿಸಿ',
            button: 'ಹವಾಮಾನ ಪಡೆಯಿರಿ',
            loading: 'ಹವಾಮಾನ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
            error: 'ಈ ಸ್ಥಳಕ್ಕೆ ಹವಾಮಾನ ಪಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ.',
            current: 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ',
        },
        login: {
            title: 'ಸ್ಪರ್ಧಾತ್ಮಕ ಲಾಗಿನ್',
            signup: 'ಸೈನ್ ಅಪ್',
            signin: 'ಲಾಗಿನ್',
            name: 'ಹೆಸರು',
            email: 'ಇಮೇಲ್',
            password: 'ಪಾಸ್‌ವರ್ಡ್',
            submit: 'ಸಲ್ಲಿಸಿ',
            logout: 'ಲಾಗ್ ಔಟ್',
            successSignup: 'ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ನೀವು ಲಾಗಿನ್ ಆಗಿದ್ದೀರಿ.',
            successLogin: 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ!',
            invalidCredentials: 'ಅಮಾನ್ಯ ವಿವರಗಳು. دوبارہ ಪ್ರಯತ್ನಿಸಿ.',
        },
        voice: {
            title: 'ವಾಯ್ಸ್ ಸಹಾಯಕ',
            listen: 'ಶ್ರವಣ ಪ್ರಾರಂಭಿಸಿ',
            stop: 'ನಿಲ್ಲಿಸಿ',
            statusListening: 'ಶ್ರವಣ ಮಾಡಲಾಗುತ್ತಿದೆ… ಈಗ ಮಾತನಾಡಿ',
            notSupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ವಾಯ್ಸ್ గుర్తಿಸುವುದು ಬೆಂಬಲಿಸಲಾಗಿಲ್ಲ.',
        },
        chat: {
            title: 'ಎಐ ಚಾಟ್ ಸಹಾಯಕ',
            placeholder: 'ಎಲೆ ರೋಗದ ಆರೈಕೆ ಕುರಿತು ಕೇಳಿ...',
            send: 'ಕಳುಹಿಸಿ',
        },
        assistant: {
            prompt: 'ನಮಸ್ಕಾರ! ಫಸಲಿನ ಆರೋಗ್ಯ ಅಥವಾ ಕಾಯಿಲೆ ಆರೈಕೆಯ ಬಗ್ಗೆ ಕೇಳಿ.',
        },
    },
};

const t = (lang, path, fallback = '') => {
    const keys = path.split('.');
    return keys.reduce((current, key) => current?.[key], i18n[lang]) || fallback || path;
};

const sampleLeafImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Tomato_leaf_early_blight.jpg/640px-Tomato_leaf_early_blight.jpg';

const MAX_IMAGE_SIZE = 6 * 1024 * 1024;

function getFeatureIcon(title) {
    const commonProps = { className: 'h-6 w-6 text-green-700' };
    switch (title) {
        case 'Easy to Use':
            return (<svg {...commonProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
        case 'Fast Results':
            return (<svg {...commonProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth={2} /><polyline points="12 6 12 12 16 14" strokeWidth={2} /></svg>);
        case 'Works on Mobile':
            return (<svg {...commonProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="6" y="2" width="12" height="20" rx="2" strokeWidth={2} /><path strokeWidth={2} d="M12 18h.01" /></svg>);
        case 'Helpful Suggestions':
            return (<svg {...commonProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={2} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
        case 'Accurate Detection':
            return (<svg {...commonProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12" strokeWidth={2} /></svg>);
        case 'Free to Use':
            return (<svg {...commonProps} viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth={2} /></svg>);
        default:
            return null;
    }
}

const diseaseDatabase = {
    'Powdery Mildew': {
        confidence: 94,
        symptoms: 'White powdery coating on leaves, yellowing',
        treatment: 'Apply sulfur-based fungicide or neem oil. Ensure proper air circulation.',
        prevention: 'Maintain humidity below 85%. Avoid overhead watering. Space plants properly.',
    },
    'Leaf Blight': {
        confidence: 87,
        symptoms: 'Brown spots with yellow halos, spreading lesions',
        treatment: 'Remove affected leaves. Apply copper fungicide. Improve drainage.',
        prevention: 'Crop rotation. Use disease-resistant varieties. Sanitize tools.',
    },
    'Rust': {
        confidence: 91,
        symptoms: 'Rusty-orange pustules on leaf undersides',
        treatment: 'Apply sulfur or rust-specific fungicide. Remove infected leaves.',
        prevention: 'Improve air circulation. Avoid wetting foliage. Regular inspection.',
    },
    'Healthy': {
        confidence: 98,
        symptoms: 'No visible disease symptoms detected',
        treatment: 'Continue regular monitoring and maintenance.',
        prevention: 'Maintain healthy watering schedule. Monitor for early signs.',
    },
};

function DiseaseDetectionSection({ language, onSaveHistory, userName, onDownloadReport }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const supportedTypes = useMemo(() => ['image/jpeg', 'image/png', 'image/webp'], []);

    const clearPreview = useCallback(() => {
        setFile(null);
        setResult(null);
        setError('');
        setLoading(false);
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }
    }, [preview]);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const processFile = useCallback((incomingFile) => {
        if (!incomingFile) {
            return;
        }

        if (!supportedTypes.includes(incomingFile.type)) {
            setError(t(language, 'detection.invalidFormat'));
            return;
        }

        if (incomingFile.size > MAX_IMAGE_SIZE) {
            setError(t(language, 'detection.tooLarge'));
            return;
        }

        setError('');
        setResult(null);
        setDragActive(false);

        const objectUrl = URL.createObjectURL(incomingFile);
        setPreview(objectUrl);
        setFile(incomingFile);
    }, [language, supportedTypes]);

    const handleFileChange = useCallback((event) => {
        const incomingFile = event.target.files?.[0];
        if (incomingFile) {
            processFile(incomingFile);
        }
    }, [processFile]);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
        const incomingFile = event.dataTransfer.files?.[0];
        if (incomingFile) {
            processFile(incomingFile);
        }
    }, [processFile]);

    const loadSampleLeaf = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(sampleLeafImageUrl);
            if (!response.ok) {
                throw new Error('Sample request failed');
            }
            const blob = await response.blob();
            const sampleFile = new File([blob], 'tomato-leaf.jpg', { type: blob.type || 'image/jpeg' });
            processFile(sampleFile);
        } catch (err) {
            setError(t(language, 'detection.sampleError'));
        } finally {
            setLoading(false);
        }
    }, [language, processFile]);

    const handleAnalyze = useCallback(async () => {
        if (!file) {
            setError(t(language, 'detection.noImage'));
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('leafImage', file);
            const response = await fetch('/api/predict', {
                method: 'POST',
                body: formData,
            });

            const text = await response.text();
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch (parseErr) {
                // If backend returned non-JSON (HTML 404 or empty), throw helpful error
                throw new Error(`Invalid JSON response from API (status ${response.status})`);
            }

            if (!response.ok) {
                throw new Error(data?.error || response.statusText || `Server error (${response.status})`);
            }

            const confidence = Math.round((Number(data.confidence) || 0) * 100);
            const disease = data.disease || 'Unknown';
            const finalResult = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                disease,
                confidence,
                symptoms: data.symptoms || 'Brown circular spots on leaves',
                treatment: data.treatment || 'Apply copper fungicide and reduce leaf moisture.',
                prevention: data.prevention || 'Avoid overwatering and maintain airflow.',
                message: data.message || '',
                image: preview,
            };

            setResult(finalResult);
            onSaveHistory(finalResult);
        } catch (err) {
            const fallbackDisease = Object.keys(diseaseDatabase)[Math.floor(Math.random() * Object.keys(diseaseDatabase).length)];
            setError(`API error: ${err.message}. Showing fallback result.`);
            const fallbackResult = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                disease: fallbackDisease,
                confidence: diseaseDatabase[fallbackDisease].confidence,
                symptoms: diseaseDatabase[fallbackDisease].symptoms,
                treatment: diseaseDatabase[fallbackDisease].treatment,
                prevention: diseaseDatabase[fallbackDisease].prevention,
                message: 'Using fallback prediction because the backend is in mock mode or returned an error.',
                image: preview,
            };
            setResult(fallbackResult);
            onSaveHistory(fallbackResult);
        } finally {
            setLoading(false);
        }
    }, [file, onSaveHistory, preview, language]);

    const handleReset = useCallback(() => {
        clearPreview();
    }, [clearPreview]);

    return (
        <section id="detect-disease" className="mt-16 py-12">
            <div className="space-y-3 mb-8">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">{t(language, 'detection.title')}</h2>
                <p className="text-gray-600 dark:text-gray-300">{t(language, 'detection.description')}</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                    {!preview ? (
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'} `}
                        >
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">Drag a photo here</p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">or click to upload</p>
                                </div>
                            </div>
                            <div className="absolute inset-0 rounded-2xl" onClick={() => fileInputRef.current?.click()} />
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                            <img src={preview} alt="Leaf preview" className="h-auto w-full" />
                        </div>
                    )}

                    {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

                    {preview ? (
                        <div className="space-y-3">
                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? t(language, 'detection.analyzing') : t(language, 'detection.analyze')}
                            </button>
                            <button onClick={handleReset} className="w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900">
                                {t(language, 'detection.reset')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3 flex-wrap">
                            <button onClick={() => fileInputRef.current?.click()} className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
                                {t(language, 'detection.upload')}
                            </button>
                            <button onClick={() => cameraInputRef.current?.click()} className="rounded-lg border border-green-600 bg-white px-6 py-3 font-semibold text-green-600 transition hover:bg-green-50 dark:border-green-500 dark:bg-gray-950 dark:text-green-300 dark:hover:bg-gray-900">
                                📷 {t(language, 'detection.camera')}
                            </button>
                            <button onClick={loadSampleLeaf} disabled={loading} className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900">
                                {t(language, 'detection.sample')}
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    {loading && (
                        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-950">
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, 'detection.analyzing')}</p>
                            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className="h-full w-full animate-[progress_2.5s_ease-in-out] rounded-full bg-green-600" />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Please wait while we check your leaf.</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-950">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">RESULT</p>
                                            <h3 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{result.disease}</h3>
                                        </div>
                                        {preview && <img src={preview} alt="Uploaded leaf" className="h-24 w-24 flex-shrink-0 rounded-xl border border-gray-200 object-cover dark:border-gray-700" />}
                                    </div>

                                    {result.message && (
                                        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200">
                                            <strong>Note:</strong> {result.message}
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Confidence</p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                <div className="h-full rounded-full bg-green-600" style={{ width: `${result.confidence}%`, transition: 'width 1s ease-out' }} />
                                            </div>
                                            <span className="text-lg font-bold text-green-600 dark:text-green-400">{result.confidence}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-950">
                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">SYMPTOMS</p>
                                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{result.symptoms}</p>
                                </div>
                                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-950">
                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">TREATMENT</p>
                                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{result.treatment}</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-950">
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">PREVENTION</p>
                                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{result.prevention}</p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button onClick={handleReset} className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
                                    {t(language, 'detection.checkAnother')}
                                </button>
                                <button onClick={() => onDownloadReport(result)} disabled={!result} className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900">
                                    Download Report
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function Counter({ value, duration = 1200 }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const delta = value - start;
        const startTime = performance.now();
        let rafId;
        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            setCount(Math.floor(start + delta * progress));
            if (progress < 1) rafId = requestAnimationFrame(step);
        };
        rafId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafId);
    }, [value, duration]);
    return <span className="text-3xl font-bold text-green-600">{count}</span>;
}

function StatisticsSection() {
    const stats = {
        totalScans: 12840,
        healthy: 8420,
        diseases: 4420,
        accuracy: 92,
    };

    const accuracyData = [{ name: 'accuracy', value: stats.accuracy, fill: '#16A34A' }];

    return (
        <section id="dashboard-stats" className="py-12 mt-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Dashboard</h2>
                    <p className="text-gray-600 dark:text-gray-300">Key metrics — quick overview of scans and model performance.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Scans</p>
                            <div className="mt-3 flex items-baseline gap-3">
                                <Counter value={stats.totalScans} />
                                <span className="text-xs text-green-600 font-semibold">+12% MoM</span>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" /><path strokeWidth={2} d="M8 7V5a4 4 0 018 0v2" /></svg>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.06 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Healthy Plants</p>
                            <div className="mt-3">
                                <Counter value={stats.healthy} />
                                <div className="text-xs text-gray-500">Currently healthy</div>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={2} d="M20 6L9 17l-5-5" /></svg>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.12 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Diseases Detected</p>
                            <div className="mt-3">
                                <Counter value={stats.diseases} />
                                <div className="text-xs text-orange-600">Recent detections</div>
                            </div>
                        </div>
                        <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={2} d="M12 2v20" /><path strokeWidth={2} d="M5 11h14" /></svg>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.18 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-md flex flex-col items-center justify-center"
                >
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">AI Accuracy</p>
                    <div className="mt-3 w-full flex items-center gap-4">
                        <div className="w-24 h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart innerRadius="70%" outerRadius="100%" data={accuracyData} startAngle={90} endAngle={-270}>
                                    <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={8} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">{stats.accuracy}%</div>
                            <div className="text-xs text-gray-500">Model validation accuracy</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function AboutProjectTabs() {
    const [activeTab, setActiveTab] = useState('diseases');

    const content = {
        diseases: {
            title: 'Plant Diseases',
            content: 'Plant diseases are caused by pathogens like fungi, bacteria, viruses, and nematodes. Fungal diseases (powdery mildew, leaf blight) are most common, affecting crop yield and quality. Early detection is crucial - visible symptoms like spots, discoloration, or wilting indicate infection has already started. AgroAI helps identify diseases before severe damage occurs.'
        },
        biology: {
            title: 'Plant Biology',
            content: 'Plant leaves are living organs that photosynthesize sunlight into energy. Disease symptoms appear as changes in leaf tissue - discoloration, necrosis (tissue death), lesions, or abnormal growth. Understanding leaf structure and symptom patterns helps in accurate disease identification. Healthy leaves show uniform color and texture, while diseased leaves display characteristic patterns specific to each disease.'
        },
        ai: {
            title: 'Artificial Intelligence',
            content: 'AI enables machines to learn from examples and recognize patterns. In agriculture, AI models are trained on thousands of labeled leaf images - both healthy and diseased. The model learns to identify visual patterns associated with each disease. Once trained, it can instantly classify new leaf images with high accuracy, providing farmers with quick disease diagnosis.'
        },
        cnn: {
            title: 'CNN Image Classification',
            content: 'Convolutional Neural Networks (CNN) are specialized for image analysis. They use filters to detect features like edges, textures, and shapes at different scales. A CNN trained on leaf images learns to recognize disease-specific patterns - particular lesion colors, spot distributions, or texture changes. This hierarchical feature learning makes CNNs highly effective for plant disease detection.'
        },
        agriculture: {
            title: 'Agriculture Applications',
            content: 'AgroAI brings AI to real-world farming. Farmers can photograph suspicious leaves directly in their fields using smartphones. The system instantly provides disease identification, treatment recommendations, and prevention strategies. This mobile-first approach reduces crop losses, improves decision-making, supports sustainable practices, and helps new farmers learn disease management.'
        }
    };

    const tabs = ['diseases', 'biology', 'ai', 'cnn', 'agriculture'];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === tab
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {content[tab].title}
                    </button>
                ))}
            </div>
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8"
            >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{content[activeTab].title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-7">{content[activeTab].content}</p>
            </motion.div>
        </div>
    );
}

function ProjectTimeline() {
    const events = [
        { year: 'Q1 2024', title: 'Project Started', description: 'Research began on plant disease datasets and CNN architectures' },
        { year: 'Q2 2024', title: 'Data Collection', description: 'Gathered 5000+ labeled leaf images across common diseases' },
        { year: 'Q3 2024', title: 'Model Training', description: 'Trained CNN model achieving 92% accuracy on validation set' },
        { year: 'Q4 2024', title: 'Mobile Development', description: 'Built React-based web interface for farmers and students' },
        { year: 'Q1 2025', title: 'Beta Launch', description: 'Released to 100+ test users with live feedback' },
        { year: 'Q2 2025', title: 'Public Release', description: 'Launched AgroAI as free tool for global farming community' },
    ];

    return (
        <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Development Timeline</h3>
            <div className="space-y-6">
                {events.map((event, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex gap-4 md:gap-6"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-green-600 flex-shrink-0 mt-2" />
                            {index !== events.length - 1 && <div className="w-1 h-16 bg-gray-300 dark:bg-gray-700 mt-2" />}
                        </div>
                        <div className="pb-8">
                            <p className="text-sm font-semibold text-green-600">{event.year}</p>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{event.title}</h4>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">{event.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function TechnologyStack() {
    const stack = [
        { category: 'Frontend', tools: ['React 18', 'Tailwind CSS', 'Framer Motion', 'Recharts'] },
        { category: 'Build', tools: ['Vite', 'PostCSS', 'Autoprefixer'] },
        { category: 'ML/Data', tools: ['Python', 'TensorFlow', 'CNN Models', 'Image Processing'] },
        { category: 'Deployment', tools: ['Node.js', 'npm', 'Responsive Design'] },
    ];

    return (
        <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">Technology Stack</h3>
            <div className="grid md:grid-cols-2 gap-6">
                {stack.map((category) => (
                    <motion.div
                        key={category.category}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
                    >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{category.category}</h4>
                        <div className="flex flex-wrap gap-2">
                            {category.tools.map((tool) => (
                                <span key={tool} className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                                    {tool}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function WorkflowDiagram() {
    const steps = [
        { icon: '📸', label: 'Capture', description: 'User takes photo' },
        { icon: '⬆️', label: 'Upload', description: 'Image sent to server' },
        { icon: '🔍', label: 'Preprocess', description: 'Resize & normalize' },
        { icon: '🧠', label: 'CNN Model', description: 'Run inference' },
        { icon: '📊', label: 'Analyze', description: 'Get prediction' },
        { icon: '💬', label: 'Response', description: 'Show results' },
    ];

    return (
        <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">How AgroAI Works</h3>
            <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 flex flex-col items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50">
                                <div className="text-2xl mb-1">{step.icon}</div>
                                <p className="text-xs font-semibold text-green-700 dark:text-green-400">{step.label}</p>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 max-w-20">{step.description}</p>
                        </motion.div>
                        {index !== steps.length - 1 && (
                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                                className="hidden md:block w-8 h-1 bg-gray-300 dark:bg-gray-700 origin-left"
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300"><strong>Result:</strong> Disease identification with confidence score, symptoms, treatment, and prevention advice</p>
            </div>
        </div>
    );
}

function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('en');

    // Auth / user
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState('login');
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authName, setAuthName] = useState('');

    // History
    const [history, setHistory] = useState(() => {
        try {
            const raw = localStorage.getItem('agro_history');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    });

    // Weather
    const [weatherCity, setWeatherCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState(null);

    // Voice assistant
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    // Chat assistant
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', content: i18n[language].assistant.prompt },
    ]);
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    useEffect(() => {
        // persist history
        try { localStorage.setItem('agro_history', JSON.stringify(history)); } catch (e) { }
    }, [history]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('agro_user');
            if (raw) setUser(JSON.parse(raw));
        } catch (e) { }
    }, []);

    // Save history item (called by DiseaseDetectionSection)
    const saveHistory = (item) => {
        setHistory((s) => [item, ...s].slice(0, 200));
    };

    // Download PDF report using jsPDF
    const downloadReport = (item) => {
        try {
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            doc.setFontSize(18);
            doc.text('AgroAI — Disease Report', 40, 50);
            doc.setFontSize(12);
            doc.text(`Date: ${item.date}`, 40, 80);
            doc.text(`User: ${item.user || '—'}`, 40, 100);
            doc.text(`Disease: ${item.disease}`, 40, 120);
            doc.text(`Confidence: ${item.confidence}%`, 40, 140);
            doc.text('Symptoms:', 40, 170);
            doc.text(item.symptoms || '—', 40, 190, { maxWidth: 520 });
            doc.text('Treatment:', 40, 230);
            doc.text(item.treatment || '—', 40, 250, { maxWidth: 520 });
            doc.text('Prevention:', 40, 290);
            doc.text(item.prevention || '—', 40, 310, { maxWidth: 520 });
            if (item.image) {
                try {
                    doc.addImage(item.image, 'JPEG', 40, 340, 200, 140);
                } catch (e) {
                    // ignore image errors
                }
            }
            doc.save(`agroai-report-${item.id || Date.now()}.pdf`);
        } catch (e) {
            console.error('PDF export failed', e);
        }
    };

    // Weather fetch (open-meteo, no key)
    const fetchWeather = async () => {
        if (!weatherCity) return;
        setWeatherLoading(true);
        setWeatherError(null);
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(weatherCity)}&count=1`);
            const geo = await geoRes.json();
            if (!geo.results || !geo.results.length) throw new Error('Location not found');
            const { latitude, longitude, name, country } = geo.results[0];
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const wJson = await wRes.json();
            setWeather({ location: `${name}, ${country}`, temperature: wJson.current_weather?.temperature ?? '—', description: `Wind ${wJson.current_weather?.windspeed ?? '—'} km/h` });
        } catch (e) {
            setWeatherError(e.message || 'Failed');
        } finally {
            setWeatherLoading(false);
        }
    };

    // Simple auth (localStorage)
    const handleAuthSubmit = (e) => {
        e?.preventDefault();
        if (authMode === 'signup') {
            const newUser = { name: authName, email: authEmail };
            localStorage.setItem('agro_user', JSON.stringify(newUser));
            setUser(newUser);
            setAuthEmail(''); setAuthPassword(''); setAuthName('');
            alert(i18n[language].login.successSignup);
        } else {
            try {
                const raw = localStorage.getItem('agro_user');
                const stored = raw ? JSON.parse(raw) : null;
                if (stored && stored.email === authEmail) {
                    setUser(stored);
                    alert(i18n[language].login.successLogin);
                } else {
                    alert(i18n[language].login.invalidCredentials);
                }
            } catch (e) { alert(i18n[language].login.invalidCredentials); }
        }
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('agro_user');
    };

    // Voice assistant (Web Speech API)
    const recognitionRef = useRef(null);
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return alert('Speech recognition not supported in this browser');
        const rec = new SpeechRecognition();
        rec.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
        rec.interimResults = false;
        rec.onresult = (ev) => {
            const t = ev.results[0][0].transcript;
            setTranscript(t);
            setChatMessages((m) => [...m, { role: 'user', content: t }]);
        };
        rec.onend = () => { setIsListening(false); }
        rec.start();
        recognitionRef.current = rec;
        setIsListening(true);
    };
    const stopListening = () => {
        try { recognitionRef.current?.stop(); } catch (e) { }
        setIsListening(false);
    };

    // Chat assistant (simple simulated replies)
    const handleChatSubmit = (e) => {
        e?.preventDefault();
        if (!chatInput) return;
        const userMsg = { role: 'user', content: chatInput };
        setChatMessages((m) => [...m, userMsg]);
        setChatInput('');
        setTimeout(() => {
            let reply = 'Sorry, I could not find an answer.';
            const q = userMsg.content.toLowerCase();
            if (q.includes('water') || q.includes('watering')) reply = 'Water in the morning to reduce fungal risk.';
            else if (q.includes('pesticide') || q.includes('fungicide')) reply = 'Use recommended products and follow label instructions.';
            else if (q.includes('weather') && weather) reply = `Current ${weather.location}: ${weather.temperature}°C — ${weather.description}`;
            else reply = 'Try scanning a leaf and I can help interpret the result.';
            setChatMessages((m) => [...m, { role: 'assistant', content: reply }]);
        }, 700);
    };
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 overflow-x-hidden">
            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="mx-auto max-w-7xl px-6 py-4 sm:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-lg">
                            🌱
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">AgroAI</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Plant Disease Detector</p>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {navItems.map((item) => (
                            <a key={item.key} href={item.href} className="text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition">
                                {t(language, `nav.${item.key}`)}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                            <option value="en">EN</option>
                            <option value="kn">KN</option>
                        </select>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
                {/* Hero Section */}
                <section id="home" className="py-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="space-y-4 mb-8">
                            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                                Know Your Plants' Health
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Take a photo of any leaf and get instant disease detection with clear treatment advice. Simple, accurate, and built for farmers.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="#detect-disease" className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                                Start Scanning
                            </a>
                            <a href="#features" className="px-8 py-3 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-900 transition">
                                Learn More
                            </a>
                        </div>
                    </motion.div>
                </section>

                {/* Authentication */}
                <LoginSection language={language} user={user} authMode={authMode} authEmail={authEmail} authPassword={authPassword} authName={authName} setAuthMode={setAuthMode} setAuthEmail={setAuthEmail} setAuthPassword={setAuthPassword} setAuthName={setAuthName} handleAuthSubmit={handleAuthSubmit} handleLogout={handleLogout} />

                {/* Weather */}
                <WeatherSection language={language} weatherCity={weatherCity} setWeatherCity={setWeatherCity} weather={weather} weatherLoading={weatherLoading} weatherError={weatherError} fetchWeather={fetchWeather} />

                {/* Disease Detection */}
                <DiseaseDetectionSection language={language} onSaveHistory={saveHistory} weatherLocation={weather?.location} userName={user?.name} onDownloadReport={downloadReport} />

                {/* Statistics */}
                <StatisticsSection language={language} />

                {/* History & Reports */}
                <HistorySection language={language} history={history} onDownloadReport={downloadReport} />

                {/* Voice Assistant */}
                <VoiceAssistantCard language={language} isListening={isListening} transcript={transcript} onStartListening={startListening} onStopListening={stopListening} userName={user?.name} />

                {/* Chat Assistant */}
                <ChatAssistantSection language={language} chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} handleChatSubmit={handleChatSubmit} />

                {/* How It Works Section */}
                <section id="how-it-works" className="py-12 mt-16">
                    <div className="text-center space-y-3 mb-10">
                        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">How It Works</h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Simple steps to diagnose and protect your crops.</p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { num: '1', title: 'Take Photo', desc: 'Capture any plant leaf from your garden or field.' },
                            { num: '2', title: 'Upload Image', desc: 'Share your photo with our AI analyzer.' },
                            { num: '3', title: 'Get Results', desc: 'Receive instant disease identification.' },
                            { num: '4', title: 'Take Action', desc: 'Follow clear treatment and prevention advice.' },
                        ].map((step) => (
                            <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold mb-4">
                                    {step.num}
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="py-12 mt-16">
                    <div className="text-center space-y-3 mb-10">
                        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Why Farmers Choose AgroAI</h2>
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Built with practical features for real farming needs.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-md transition"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex-shrink-0">
                                        {getFeatureIcon(feature.title)}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Trusted Section */}
                <section className="py-12 mt-16 rounded-xl border border-gray-200 dark:border-gray-800 bg-green-50 dark:bg-green-900/10 p-8">
                    <div className="text-center space-y-8">
                        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Trusted by Farmers & Students</h2>
                        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {[
                                { name: 'Raj Kumar', role: 'Cotton Farmer', quote: 'AgroAI helped me catch disease early and save my crop this season.' },
                                { name: 'Priya Singh', role: 'Agriculture Student', quote: 'Simple and accurate. Exactly what I needed for my studies.' },
                                { name: 'Vikram Patel', role: 'Vegetable Grower', quote: "Best tool I've used for quick disease identification in the field." },
                            ].map((testimonial) => (
                                <div key={testimonial.name} className="rounded-lg bg-white dark:bg-gray-800 p-6 text-left shadow-sm">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Project Section */}
                <section id="about-project" className="py-12 mt-16">
                    <div className="space-y-12">
                        {/* Header */}
                        <div className="text-center space-y-3">
                            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">About This Project</h2>
                            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Understand the science and technology behind AgroAI</p>
                        </div>

                        {/* Education Content Tabs */}
                        <AboutProjectTabs />

                        {/* Timeline */}
                        <ProjectTimeline />

                        {/* Technology Stack */}
                        <TechnologyStack />

                        {/* Workflow Diagram */}
                        <WorkflowDiagram />
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-12 mt-16">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
                        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">Get Started Today</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                            Join thousands of farmers protecting their crops with smarter disease detection.
                        </p>
                        <a href="mailto:hello@agroai.com" className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                            Contact Us
                        </a>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-8 mt-12">
                <div className="mx-auto max-w-7xl px-6 sm:px-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-lg">🌱</span>
                        <p className="font-semibold text-gray-900 dark:text-white">AgroAI</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Smart Plant Disease Detection for Farmers & Students
                    </p>
                    <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
                        <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition">Privacy</a>
                        <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition">Terms</a>
                        <a href="#" className="hover:text-green-600 dark:hover:text-green-400 transition">Support</a>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-600">© 2024 AgroAI. All rights reserved.</p>
                </div>
            </footer>
        </div >
    );
}

function LoginSection({ language, user, authMode, authEmail, authPassword, authName, setAuthMode, setAuthEmail, setAuthPassword, setAuthName, handleAuthSubmit, handleLogout }) {
    return (
        <section className="py-12 mt-16 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t(language, 'login.title')}</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{user ? `Logged in as ${user.name}` : 'Create a local account to save history and generate reports.'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        className="rounded-full border border-green-600 bg-green-50 px-5 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 transition"
                    >
                        {authMode === 'login' ? t(language, 'login.signup') : t(language, 'login.signin')}
                    </button>
                </div>
            </div>

            {!user ? (
                <form onSubmit={handleAuthSubmit} className="mt-8 grid gap-4 md:grid-cols-3">
                    {authMode === 'signup' && (
                        <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <span>{t(language, 'login.name')}</span>
                            <input value={authName} onChange={(e) => setAuthName(e.target.value)} type="text" className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" required />
                        </label>
                    )}
                    <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <span>{t(language, 'login.email')}</span>
                        <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} type="email" className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" required />
                    </label>
                    <label className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <span>{t(language, 'login.password')}</span>
                        <input value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} type="password" className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" required />
                    </label>
                    <div className="md:col-span-3 flex flex-wrap items-center gap-3">
                        <button type="submit" className="rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
                            {t(language, 'login.submit')}
                        </button>
                        {user && (
                            <button type="button" onClick={handleLogout} className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">
                                {t(language, 'login.logout')}
                            </button>
                        )}
                    </div>
                </form>
            ) : (
                <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-300">
                    You are logged in and can save scans locally in your browser.
                </div>
            )}
        </section>
    );
}

function WeatherSection({ language, weatherCity, setWeatherCity, weather, weatherLoading, weatherError, fetchWeather }) {
    return (
        <section className="py-12 mt-16 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t(language, 'weather.title')}</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Get quick weather details for any farming location.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={weatherCity}
                        onChange={(e) => setWeatherCity(e.target.value)}
                        placeholder={t(language, 'weather.placeholder')}
                        className="rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                    <button onClick={fetchWeather} className="rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
                        {t(language, 'weather.button')}
                    </button>
                </div>
            </div>
            <div className="mt-8 rounded-2xl border border-gray-200 bg-green-50 p-6 dark:border-gray-700 dark:bg-green-950/10">
                {weatherLoading ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300">{t(language, 'weather.loading')}</p>
                ) : weatherError ? (
                    <p className="text-sm text-red-700 dark:text-red-300">{weatherError}</p>
                ) : weather ? (
                    <div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{t(language, 'weather.current')}</p>
                        <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{weather.location}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{weather.temperature}°C • {weather.description}</p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300">Enter a city name and press the button to load weather data.</p>
                )}
            </div>
        </section>
    );
}

function HistorySection({ language, history, onDownloadReport }) {
    return (
        <section className="py-12 mt-16 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t(language, 'history.title')}</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Review your recent scans and export them as PDF reports.</p>
                </div>
            </div>
            {history.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                    {t(language, 'history.empty')}
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</p>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{entry.disease}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Confidence: {entry.confidence}%</p>
                                </div>
                                <button onClick={() => onDownloadReport(entry)} className="rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900">
                                    {t(language, 'history.report')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function VoiceAssistantCard({ language, isListening, transcript, onStartListening, onStopListening, userName }) {
    return (
        <section className="py-12 mt-16 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t(language, 'voice.title')}</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Speak to AgroAI for quick farming advice.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <button onClick={onStartListening} className="rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
                        {t(language, 'voice.listen')}
                    </button>
                    <button onClick={onStopListening} className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800">
                        {t(language, 'voice.stop')}
                    </button>
                </div>
            </div>
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">{isListening ? t(language, 'voice.statusListening') : t(language, 'assistant.prompt')}</p>
                <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">{transcript || 'No voice input yet.'}</p>
                {userName && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Logged in as {userName}</p>}
            </div>
        </section>
    );
}

function ChatAssistantSection({ language, chatMessages, chatInput, setChatInput, handleChatSubmit }) {
    return (
        <section className="py-12 mt-16 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t(language, 'chat.title')}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Type a question and get AI-guided advice for your crop.</p>
            </div>
            <div className="space-y-4">
                {chatMessages.map((message, index) => (
                    <div key={index} className={`rounded-2xl p-4 ${message.role === 'assistant' ? 'bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-200' : 'bg-green-50 text-gray-900 dark:bg-green-950 dark:text-green-200'}`}>
                        <p className="text-sm font-semibold">{message.role === 'assistant' ? 'AgroAI' : 'You'}</p>
                        <p className="mt-2 text-sm">{message.content}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleChatSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t(language, 'chat.placeholder')}
                    className="flex-1 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                <button type="submit" className="rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
                    {t(language, 'chat.send')}
                </button>
            </form>
        </section>
    );
}

export default App;
