import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  User, 
  School, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw,
  LogOut,
  Sparkles,
  Trash2
} from 'lucide-react';
import { RegistrationRequest, UserSession } from '../types';

interface AdminApprovalTabProps {
  currentAdmin: UserSession;
  requests: RegistrationRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason?: string) => void;
  onRefreshRequests: () => void;
  onLogoutAdmin: () => void;
  onDeleteRequest?: (requestId: string) => void;
}

export const AdminApprovalTab: React.FC<AdminApprovalTabProps> = ({
  currentAdmin,
  requests,
  onApproveRequest,
  onRejectRequest,
  onRefreshRequests,
  onLogoutAdmin,
  onDeleteRequest,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'teacher' | 'student'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Thông tin trường lớp chưa rõ ràng');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Statistics
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  const filteredRequests = requests.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchRole = filterRole === 'all' || r.role === filterRole;
    const matchQuery = !searchQuery ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.classRoom.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchRole && matchQuery;
  });

  const handleApprove = (id: string, name: string) => {
    onApproveRequest(id);
    setSuccessToast(`Đã phê duyệt thành công yêu cầu tạo tài khoản của "${name}"!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleConfirmReject = () => {
    if (!rejectingReqId) return;
    onRejectRequest(rejectingReqId, rejectReason);
    setRejectingReqId(null);
    setSuccessToast(`Đã từ chối yêu cầu tạo tài khoản.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Bảng Điều Khiển Quản Trị Viên (Admin) • vnEdu Auth Core
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Phê Duyệt Yêu Cầu Tạo Tài Khoản Người Dùng
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Tài khoản Admin: <strong className="text-white font-mono">{currentAdmin.username}</strong> ({currentAdmin.fullName}). Giao diện quản trị này chuyên trách kiểm duyệt, xác nhận hoặc từ chối các yêu cầu đăng ký tài khoản từ Giáo viên và Học sinh.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRefreshRequests}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer border border-white/10"
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>

            <button
              onClick={onLogoutAdmin}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất Admin</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-xs text-slate-400 font-semibold uppercase">Tổng yêu cầu</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{requests.length}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
            <div className="text-xs text-amber-300 font-semibold uppercase flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Chờ phê duyệt
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{pendingCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-xs text-emerald-300 font-semibold uppercase flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã chấp nhận
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{approvedCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
            <div className="text-xs text-rose-300 font-semibold uppercase flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Đã từ chối
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo họ tên, username, trường, lớp..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-black bg-white placeholder:text-slate-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: `Chờ duyệt (${pendingCount})` },
              { id: 'approved', label: 'Đã duyệt' },
              { id: 'rejected', label: 'Bị từ chối' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 text-slate-700"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="teacher">Chỉ Giáo viên</option>
              <option value="student">Chỉ Học sinh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Không có yêu cầu đăng ký nào phù hợp</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các yêu cầu tạo tài khoản mới từ người dùng sẽ hiển thị tại đây để bạn phê duyệt.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <div
                key={req.id}
                className={`p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-xs ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-400/20'
                    : isApproved
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                {/* Left: User Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                      req.role === 'teacher'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {req.role === 'teacher' ? <UserCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {req.role === 'teacher' ? 'Yêu cầu: Giáo Viên' : 'Yêu cầu: Học Sinh'}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      isPending
                        ? 'bg-amber-100 text-amber-800'
                        : isApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isPending && <Clock className="w-3 h-3" />}
                      {isApproved && <Check className="w-3 h-3" />}
                      {isRejected && <X className="w-3 h-3" />}
                      {isPending ? 'Đang chờ Admin duyệt' : isApproved ? 'Đã kích hoạt tài khoản' : 'Đã từ chối'}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      Thời gian gửi: {new Date(req.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>{req.fullName}</span>
                      <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        username: {req.username}
                      </span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                      <span>Trường: <strong>{req.schoolName}</strong></span>
                      <span>Lớp: <strong className="text-indigo-700">{req.classRoom}</strong></span>
                      {req.title && <span>Chức danh: <em>{req.title}</em></span>}
                      {req.studentCode && <span>Mã HS: <span className="font-mono font-semibold">{req.studentCode}</span></span>}
                    </div>

                    {req.rejectionReason && (
                      <div className="mt-2 text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        Lý do từ chối: <strong>{req.rejectionReason}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  {onDeleteRequest && (
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa yêu cầu của "${req.fullName}"?`)) {
                          onDeleteRequest(req.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Xóa yêu cầu này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {isPending ? (
                    <>
                      <button
                        onClick={() => {
                          setRejectingReqId(req.id);
                          setRejectReason('Thông tin trường lớp chưa rõ ràng');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Từ chối</span>
                      </button>

                      <button
                        onClick={() => handleApprove(req.id, req.fullName)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>✅ Chấp nhận phê duyệt</span>
                      </button>
                    </>
                  ) : isApproved ? (
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Tài khoản đã hoạt động
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApprove(req.id, req.fullName)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold text-xs transition cursor-pointer"
                    >
                      Duyệt lại
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectingReqId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              Lý Do Từ Chối Yêu Cầu Tạo Tài Khoản
            </h3>

            <div className="py-4 space-y-3 text-xs sm:text-sm">
              <label className="block font-bold text-slate-700">
                Nhập lý do gửi đến người dùng:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Thông tin trường lớp chưa khớp với hồ sơ vnEdu, trùng username..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-xs font-medium text-black bg-white placeholder:text-slate-400"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Thông tin trường lớp chưa rõ ràng',
                  'Tên đăng nhập không phù hợp',
                  'Chưa được phân công phụ trách lớp này',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-rose-50 text-slate-700 border border-slate-200 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setRejectingReqId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
