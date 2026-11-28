import { useState } from 'react';
import { Upload, Link2, Star, Trash2, ImagePlus } from 'lucide-react';
import { api } from '../../api';

export default function MediaUploader({ mediaList = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setErrorMsg('');
    try {
      const res = await api.upload.uploadImages(files);
      const uploadedItems = Array.isArray(res.data) ? res.data : [];

      if (uploadedItems.length > 0) {
        const hasCover = mediaList.some((m) => m.isCover);
        const mapped = uploadedItems.map((item, idx) => ({
          url: item.url,
          caption: item.caption || files[idx]?.name?.replace(/\.[^/.]+$/, '') || 'Hình ảnh',
          isCover: !hasCover && idx === 0,
        }));
        onChange([...mediaList, ...mapped]);
      } else {
        throw new Error('Máy chủ không trả về danh sách ảnh.');
      }
    } catch (err) {
      // Fallback preview tạm bằng URL cục bộ nếu backend chưa cấu hình /api/upload/images
      const hasCover = mediaList.some((m) => m.isCover);
      const localItems = files.map((file, idx) => ({
        url: URL.createObjectURL(file),
        caption: file.name.replace(/\.[^/.]+$/, ''),
        isCover: !hasCover && idx === 0,
        isLocalPreview: true,
      }));
      onChange([...mediaList, ...localItems]);
      setErrorMsg(
        err.message
          ? `Đang dùng ảnh xem trước cục bộ (${err.message}). Hãy bật route POST /api/upload/images để lưu vĩnh viễn.`
          : 'Đang dùng ảnh xem trước cục bộ.'
      );
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function handleAddUrl() {
    const clean = urlInput.trim();
    if (!clean) return;
    setErrorMsg('');
    const hasCover = mediaList.some((m) => m.isCover);
    onChange([
      ...mediaList,
      {
        url: clean,
        caption: 'Hình ảnh cơ sở',
        isCover: !hasCover,
      },
    ]);
    setUrlInput('');
  }

  function setCover(index) {
    onChange(mediaList.map((item, i) => ({ ...item, isCover: i === index })));
  }

  function updateCaption(index, caption) {
    onChange(mediaList.map((item, i) => (i === index ? { ...item, caption } : item)));
  }

  function removeImage(index) {
    const target = mediaList[index];
    if (target?.isLocalPreview && typeof target.url === 'string' && target.url.startsWith('blob:')) {
      URL.revokeObjectURL(target.url);
    }
    const filtered = mediaList.filter((_, i) => i !== index);
    if (filtered.length > 0 && !filtered.some((m) => m.isCover)) {
      filtered[0] = { ...filtered[0], isCover: true };
    }
    onChange(filtered);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-700">
          Hình ảnh ({mediaList.length} ảnh) • Chọn 1 ảnh làm ảnh bìa
        </span>

        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-teal-800">
          <Upload size={14} />
          <span>{uploading ? 'Đang tải ảnh lên...' : 'Chọn nhiều ảnh'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {errorMsg}
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Hoặc dán đường dẫn ảnh (https://...)"
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-8 pr-3 text-xs outline-none focus:border-teal-600"
          />
        </div>
        <button
          type="button"
          onClick={handleAddUrl}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          <ImagePlus size={14} /> Thêm link
        </button>
      </div>

      {mediaList.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {mediaList.map((img, idx) => (
            <div
              key={`${img.url}-${idx}`}
              className={`overflow-hidden rounded-xl border bg-white ${
                img.isCover ? 'border-teal-600 ring-2 ring-teal-200' : 'border-slate-200'
              }`}
            >
              <div className="relative h-28 w-full bg-slate-100">
                <img
                  src={img.url}
                  alt={img.caption || 'Ảnh'}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCover(idx)}
                  className={`absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold shadow-xs ${
                    img.isCover
                      ? 'bg-teal-600 text-white'
                      : 'bg-white/90 text-slate-700 hover:bg-white'
                  }`}
                >
                  <Star size={10} fill={img.isCover ? 'currentColor' : 'none'} />
                  {img.isCover ? 'Ảnh bìa' : 'Đặt bìa'}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute right-1.5 top-1.5 rounded-md bg-rose-600/90 p-1 text-white hover:bg-rose-700"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <input
                type="text"
                value={img.caption || ''}
                onChange={(e) => updateCaption(idx, e.target.value)}
                placeholder="Chú thích ảnh..."
                className="w-full border-t border-slate-100 px-2.5 py-1.5 text-[11px] text-slate-700 outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}