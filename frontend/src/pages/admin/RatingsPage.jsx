import { useState } from 'react';
import { Send, Trash2, BadgeCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAsyncData } from '../../hooks/useAsyncData';
import { api } from '../../api';

export default function RatingsPage() {
  const [replies, setReplies] = useState({});

  const { data, loading, reload } = useAsyncData(async () => {
    const res = await api.ratings.getAll();
    return res.data || [];
  }, []);

  async function handleReply(id) {
    const text = (replies[id] || '').trim();
    if (!text) return;
    await api.ratings.reply(id, text);
    setReplies((prev) => ({ ...prev, [id]: '' }));
    reload();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Đánh giá &amp; Phản hồi</h1>
        <p className="text-sm text-slate-500">
          Kiểm duyệt đánh giá khách lưu trú / thuê phòng &amp; phản hồi trực tiếp
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
          Đang tải...
        </div>
      ) : (
        <div className="space-y-4">
          {(data || []).map((rev) => (
            <div
              key={rev._id}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {rev.userId?.fullName || 'Khách hàng'}
                  </span>
                  <span className="font-bold text-amber-600">{rev.overallScore}★</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {rev.targetType}
                  </span>
                  {rev.isVerifiedStay && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <BadgeCheck size={13} /> Đã lưu trú
                    </span>
                  )}
                </div>

                <Button
                  variant="danger"
                  className="px-2.5 py-1 text-xs"
                  onClick={async () => {
                    await api.ratings.deleteOrHide(rev._id);
                    reload();
                  }}
                >
                  <Trash2 size={14} /> Ẩn
                </Button>
              </div>

              {rev.title && <div className="text-sm font-bold text-slate-800">{rev.title}</div>}
              <p className="text-sm text-slate-700">{rev.comment}</p>

              {rev.hostReply?.content ? (
                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  <b>Phản hồi:</b> {rev.hostReply.content}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    placeholder="Phản hồi đánh giá..."
                    value={replies[rev._id] || ''}
                    onChange={(e) =>
                      setReplies((prev) => ({ ...prev, [rev._id]: e.target.value }))
                    }
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  />
                  <Button className="px-3 py-1.5 text-xs" onClick={() => handleReply(rev._id)}>
                    <Send size={14} /> Gửi
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}