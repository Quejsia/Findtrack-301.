import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Category, ItemType } from '../types';
import { Camera, RefreshCw, Sparkles, Upload, Loader2, AlertCircle, Key } from 'lucide-react';
import { auth } from '../firebase';

interface SubmissionFormProps {
  onSubmit: (itemData: {
    type: ItemType;
    title: string;
    description: string;
    category: Category;
    location: string;
    contactName: string;
    contactInfo: string;
    date: string;
    imageUrl?: string;
    securityQuestion?: string;
  }) => Promise<void>;
  onClose: () => void;
  defaultContactName?: string;
}

const CATEGORIES: Category[] = ['electronics', 'keys', 'wallet', 'documents', 'clothing', 'jewelry', 'bags', 'others'];

export default function SubmissionForm({ onSubmit, onClose, defaultContactName = "" }: SubmissionFormProps) {
  const { t } = useTranslation();
  // Form States
  const [type, setType] = useState<ItemType>('lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('others');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState(defaultContactName);
  const [contactInfo, setContactInfo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16)); // local datetime-local format format
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [securityQuestion, setSecurityQuestion] = useState('');

  // System States
  const [scanningImage, setScanningImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert uploaded image to base64 and invoke backend Gemini analyzer
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = 8 * 1024 * 1024; // 8MB Max size
    if (file.size > maxSizeBytes) {
      setScanError('Image size exceeds 8MB. Please select a smaller file.');
      return;
    }

    setScanError(null);
    setScanningImage(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const resultStr = reader.result as string;
      setImageUrl(resultStr); // Preview the image directly

      // Extract raw base64 data and mimeType
      const prefix = "base64,";
      const base64Index = resultStr.indexOf(prefix);
      if (base64Index !== -1) {
        const rawBase64 = resultStr.substring(base64Index + prefix.length);
        const mimeType = resultStr.substring(resultStr.indexOf("data:") + 5, resultStr.indexOf(";"));

        try {
          const token = await auth.currentUser?.getIdToken();
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({
              imageBase64: rawBase64,
              mimeType: mimeType,
            }),
          });

          if (!response.ok) {
            throw new Error('Our AI model could not process this image.');
          }

          const parsedAnalysis = await response.json();
          
          // Auto-fill form values returned from Gemini model!
          if (parsedAnalysis.title) setTitle(parsedAnalysis.title);
          if (parsedAnalysis.category) setCategory(parsedAnalysis.category as Category);
          if (parsedAnalysis.description) setDescription(parsedAnalysis.description);
          if (parsedAnalysis.suggestedLocation) setLocation(parsedAnalysis.suggestedLocation);

        } catch (error) {
          console.error('Exception on image analysis:', error);
          setScanError('Failed to run AI feature matching on photo. Standard input mode active.');
        } finally {
          setScanningImage(false);
        }
      }
    };

    reader.onerror = () => {
      setScanError('Critical file reader breakdown.');
      setScanningImage(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim() || !location.trim() || !contactName.trim() || !contactInfo.trim()) {
      setFormError('Please fill in all mandatory field parameters.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        title,
        description,
        category,
        location,
        contactName,
        contactInfo,
        date: new Date(date).toISOString(),
        imageUrl: imageUrl, // Holds base64 photo structure
        securityQuestion: securityQuestion.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Form submit exception:', err);
      setFormError(err instanceof Error ? err.message : 'Database sync failed. Please review values.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xl" id="submission-form">
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/50 pb-4 mb-5">
        <div>
          <h2 className="font-sans text-lg font-bold text-slate-1000">{t('generated.string_509')}</h2>
          <p className="font-sans text-xs text-on-surface-variant">Add an item to the registry database helper system.</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface-variant transition"
        >
          <span className="sr-only">Close</span>
          &times;
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Toggle Lost / Found */}
        <div id="type-selector">
          <label className="block text-xs font-bold font-sans text-on-surface uppercase tracking-wider mb-2">
            Is this item Lost or Found?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`flex items-center justify-center py-2.5 rounded-xl font-sans text-xs font-bold border transition ${
                type === 'lost'
                  ? 'bg-error-container/20 border-rose-300 text-error ring-2 ring-rose-100'
                  : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {t('report.lostItem')}
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`flex items-center justify-center py-2.5 rounded-xl font-sans text-xs font-bold border transition ${
                type === 'found'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-100'
                  : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {t('report.foundItem')}
            </button>
          </div>
        </div>

        {/* AI Photo Scan Section */}
        <div className="relative rounded-xl border border-dashed border-primary/30 bg-primary-container/10 p-4" id="ai-photo-scanner">
          <div className="flex items-start justify-between gap-3/2 mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <h4 className="font-sans text-xs font-bold text-on-surface leading-tight">
                Gemini AI Image Autofill (Saves Time)
              </h4>
            </div>

            {scanningImage && (
              <span className="flex items-center space-x-1.5 font-sans text-[10px] font-bold text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Scanning pixels...</span>
              </span>
            )}
          </div>

          <p className="font-sans text-[11px] text-on-surface-variant mb-3 leading-relaxed">
            Upload an image of the item. Gemini will automatically write a title, categorize it, and compose description features for you!
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center cursor-pointer py-4 px-2 hover:bg-primary-container/10 rounded-xl border border-outline-variant bg-surface-container-lowest transition"
          >
            {imageUrl ? (
              <div className="flex items-center space-x-3 w-full px-3">
                <img
                  src={imageUrl}
                  alt="Submission preview"
                  className="h-14 w-14 object-cover rounded-md border border-outline-variant"
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-sans text-xs font-bold text-primary truncate">Photo Attachment Uploaded</p>
                  <p className="font-sans text-[10px] text-on-surface-variant">Click to change or replace photo</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-6 w-6 text-primary-dim mb-1" />
                <span className="font-sans text-xs font-semibold text-on-surface">Click to upload photo</span>
                <span className="font-sans text-[9px] text-on-surface-variant mt-0.5">PNG, JPG up to 8MB</span>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {scanError && (
            <div className="flex items-center text-rose-600 text-[10px] font-sans mt-2 space-x-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{scanError}</span>
            </div>
          )}
        </div>

        {/* Regular Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div id="form-field-title">
            <label className="block text-xs font-bold font-sans text-slate-750 uppercase tracking-wider mb-1.5">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('generated.string_532')}
              className="shadow-sm w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-sans text-xs font-medium text-on-surface focus:border-primary/30 focus:outline-none"
              required
            />
          </div>

          <div id="form-field-category">
            <label className="block text-xs font-bold font-sans text-slate-750 uppercase tracking-wider mb-1.5">
              Category <span className="text-error">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="shadow-sm w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-sans text-xs font-semibold text-on-surface focus:border-primary/30 focus:outline-none capitalize"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div id="form-field-location">
            <label className="block text-xs font-bold font-sans text-slate-750 uppercase tracking-wider mb-1.5">
              Location lost/found <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('generated.string_533')}
              className="shadow-sm w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-sans text-xs font-medium text-on-surface focus:border-primary/30 focus:outline-none"
              required
            />
          </div>

          <div id="form-field-date">
            <label className="block text-xs font-bold font-sans text-slate-750 uppercase tracking-wider mb-1.5">
              Date & Time Event <span className="text-error">*</span>
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="shadow-sm w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-sans text-xs font-semibold text-on-surface focus:border-primary/30 focus:outline-none"
              required
            />
          </div>
        </div>

        <div id="form-field-description">
          <label className="block text-xs font-bold font-sans text-slate-755 uppercase tracking-wider mb-1.5">
            Detailed Description <span className="text-error">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t('generated.string_534')}
            className="shadow-sm w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-sans text-xs font-medium text-on-surface focus:border-primary/30 focus:outline-none leading-relaxed"
            required
          />
        </div>

        <div id="form-field-security-question" className="bg-surface-container border border-outline-variant/60 rounded-xl p-4">
          <label className="block text-xs font-bold font-sans text-slate-750 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span><Key className="h-4 w-4 inline mr-1" /> "Prove It" Security Verification Question (Optional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              placeholder={t('generated.string_535')}
              className={`w-full rounded-xl border px-4 py-3 font-sans text-xs font-medium text-on-surface focus:outline-none transition-colors ${
                securityQuestion.trim().length >= 4 
                  ? 'border-emerald-500 bg-emerald-50 focus:border-emerald-500 pr-10' 
                  : 'border-outline-variant bg-surface-container-lowest focus:border-primary/30'
              }`}
            />
            {securityQuestion.trim().length >= 4 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-bold pointer-events-none">
                ✓
              </div>
            )}
          </div>
          <p className="font-sans text-[10px] text-on-surface-variant mt-1.5 leading-relaxed">
            Prevent fraudulent claims. If another user claims this item, they will be prompted to answer this verification question first.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div id="form-field-contact-name">
            <label className="block text-xs font-bold font-sans text-slate-750 uppercase tracking-wider mb-1.5">
              Your name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder={t('generated.string_536')}
              className="shadow-sm w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-sans text-xs font-medium text-on-surface focus:border-primary/30 focus:outline-none"
              required
            />
          </div>

          <div id="form-field-contact-info">
            <label className="block text-xs font-bold font-sans text-slate-750 uppercase tracking-wider mb-1.5">
              Contact Email / Phone <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder={t('generated.string_537')}
              className="shadow-sm w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-sans text-xs font-medium text-on-surface focus:border-primary/30 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Global form issues feedback */}
        {formError && (
          <div className="flex items-center text-xs text-error bg-error-container/20 border border-error/30 rounded-xl p-3 space-x-2">
            <AlertCircle className="h-4 w-4 text-error shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Footer controls */}
        <div className="flex justify-end space-x-3 border-t border-outline-variant/50 pt-4 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-outline-variant px-4 py-2 font-sans text-xs font-bold text-on-surface hover:bg-surface-container transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || scanningImage}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-primary-container/10 px-4 py-2 font-sans text-xs font-bold text-white shadow-sm hover:bg-primary-container/10 transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Syncing Database...</span>
              </>
            ) : (
              <>
                <span>Publish Listing</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
