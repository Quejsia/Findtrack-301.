import React from 'react';
import { Camera, Calendar, Palette, Tag } from 'lucide-react';
import { Category } from '../../types';
import { useTranslation } from 'react-i18next';

interface Props {
  reportType: "lost" | "found";
  reportCategory: Category;
  setReportCategory: (c: Category) => void;
  reportDesc: string;
  setReportDesc: (d: string) => void;
  reportColor: string;
  setReportColor: (c: string) => void;
  reportDate: string;
  setReportDate: (d: string) => void;
  reportImage: string;
  setReportImageFile: (file: File | null) => void;
  setReportImage: (img: string) => void;
}

export const ReportDetailsStep: React.FC<Props> = ({
  reportType,
  reportCategory,
  setReportCategory,
  reportDesc,
  setReportDesc,
  reportColor,
  setReportColor,
  reportDate,
  setReportDate,
  reportImage,
  setReportImageFile,
  setReportImage,
}) => {
  const { t } = useTranslation();
  
  const categories: { value: Category; label: string }[] = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'keys', label: 'Keys' },
    { value: 'wallet', label: 'Wallet/Purse' },
    { value: 'documents', label: 'Documents' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'bags', label: 'Bags' },
    { value: 'others', label: 'Others' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-headline-md font-bold text-on-surface">Item Details</h3>
            <p className="font-body-md text-sm text-on-surface-variant">Provide specific characteristics.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block font-label-md font-bold text-on-surface">Category</label>
            <select
              value={reportCategory}
              onChange={(e) => setReportCategory(e.target.value as Category)}
              className="w-full bg-[#fdfbf7] border border-amber-200/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500/30 outline-none text-on-surface font-body-md"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block font-label-md font-bold text-on-surface">Description</label>
            <textarea
              required
              value={reportDesc}
              onChange={(e) => setReportDesc(e.target.value)}
              rows={4}
              placeholder="Describe the item in detail (brand, marks, contents)..."
              className="w-full bg-[#fdfbf7] border border-amber-200/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500/30 outline-none resize-none text-on-surface font-body-md"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block font-label-md font-bold text-on-surface flex items-center gap-2">
                <Palette className="h-4 w-4 text-on-surface-variant" /> Primary Color
              </label>
              <input
                type="text"
                value={reportColor}
                onChange={(e) => setReportColor(e.target.value)}
                placeholder="e.g. Black, Red"
                className="w-full bg-[#fdfbf7] border border-amber-200/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500/30 outline-none text-on-surface font-body-md"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-label-md font-bold text-on-surface flex items-center gap-2">
                <Calendar className="h-4 w-4 text-on-surface-variant" /> Date {reportType === 'lost' ? 'Lost' : 'Found'}
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full bg-[#fdfbf7] border border-amber-200/60 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500/30 outline-none text-on-surface font-body-md"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block font-label-md font-bold text-on-surface flex items-center gap-2">
              <Camera className="h-4 w-4 text-on-surface-variant" /> Upload Image
            </label>
            <div className="border-2 border-dashed border-amber-200/80 bg-[#fdfbf7] rounded-xl p-8 text-center hover:bg-amber-50/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setReportImageFile(file);
                    const reader = new FileReader();
                    reader.onload = (ev) => setReportImage(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {reportImage ? (
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-lg overflow-hidden mb-3 border border-outline-variant">
                    <img src={reportImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-label-md text-primary">{t('report.changeImage', 'Tap to change image')}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                    <Camera className="h-6 w-6 text-amber-600" />
                  </div>
                  <span className="font-label-md font-bold text-on-surface mb-1">{t('report.tapToUpload', 'Tap to upload photo')}</span>
                  <span className="font-body-md text-xs text-on-surface-variant">{t('report.uploadLimit', 'JPG, PNG up to 5MB')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
