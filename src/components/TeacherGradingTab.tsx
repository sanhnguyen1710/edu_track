import React, { useState } from 'react';
import { 
  UserCheck, 
  BookOpen, 
  Save, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Search, 
  Edit3, 
  Check, 
  AlertTriangle,
  Send,
  Calendar,
  Lock,
  History
} from 'lucide-react';
import { StudentProfile, SubjectGrade, TeacherComment, UserSession } from '../types';
import { calculateSubjectAverage, calculateOverallGpa, classifyAcademicRank } from '../utils/gradeCalculations';
import { StudentRecord } from '../data/defaultData';

interface TeacherGradingTabProps {
  currentTeacher: UserSession;
  studentsRoster: StudentRecord[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  onSaveGradesByTeacher: (studentId: string, updatedSubjects: SubjectGrade[]) => void;
  onSaveCommentByTeacher: (studentId: string, comment: TeacherComment) => void;
}

export const TeacherGradingTab: React.FC<TeacherGradingTabProps> = ({
  currentTeacher,
  studentsRoster,
  selectedStudentId,
  onSelectStudent,
  onSaveGradesByTeacher,
  onSaveCommentByTeacher,
}) => {
  const currentRecord = studentsRoster.find(r => r.profile.id === selectedStudentId) || studentsRoster[0];

  // Local state for editing subjects of the selected student
  const [editingSubjects, setEditingSubjects] = useState<SubjectGrade[]>(currentRecord.subjects);
  const [activeSubjectModal, setActiveSubjectModal] = useState<SubjectGrade | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Local state for teacher comment form
  const [academicComment, setAcademicComment] = useState(
    currentRecord.profile.teacherComments[0]?.academicComment || ''
  );
  const [conductComment, setConductComment] = useState(
    currentRecord.profile.teacherComments[0]?.conductComment || ''
  );
  const [competencyEvaluation, setCompetencyEvaluation] = useState(
    currentRecord.profile.teacherComments[0]?.competencyEvaluation || ''
  );
  const [recommendations, setRecommendations] = useState(
    currentRecord.profile.teacherComments[0]?.recommendations || ''
  );
  const [semesterLabel, setSemesterLabel] = useState('Học kỳ 2');

  // Search in roster
  const [searchRoster, setSearchRoster] = useState('');

  // Sync editingSubjects when selected student changes
  React.useEffect(() => {
    setEditingSubjects(currentRecord.subjects);
    const existing = currentRecord.profile.teacherComments[0];
    setAcademicComment(existing?.academicComment || '');
    setConductComment(existing?.conductComment || '');
    setCompetencyEvaluation(existing?.competencyEvaluation || '');
    setRecommendations(existing?.recommendations || '');
    setSaveSuccessMsg(null);
  }, [selectedStudentId, currentRecord]);

  const overallGpa = calculateOverallGpa(editingSubjects);
  const academicClassification = classifyAcademicRank(editingSubjects, overallGpa);

  // Quick Preset Comments
  const presets = [
    {
      label: '🌟 Học sinh Xuất sắc toàn diện',
      academic: 'Tiếp thu bài rất nhanh, tư duy phản biện sắc bén, điểm thi các môn tự nhiên và ngoại ngữ đạt mức xuất sắc.',
      conduct: 'Tự giác, kỷ luật tốt, tích cực hỗ trợ các bạn trong tổ học tập, hạnh kiểm Tốt.',
      competency: 'Năng lực tư duy định lượng & giải quyết vấn đề đạt 920/1000. Rất thích hợp với các kỳ thi tuyển sinh đại học top đầu và săn học bổng.',
      recommend: 'Khuyến khích tham gia đội tuyển học sinh giỏi và hoàn thiện hồ sơ ứng tuyển học bổng quốc tế.',
    },
    {
      label: '📈 Có tiến bộ - Cần bứt phá',
      academic: 'Có tiến bộ rõ rệt so với đầu năm, môn Toán và Vật lý cải thiện điểm tốt. Cần chú trọng bài thi cuối kỳ môn Hóa và Văn.',
      conduct: 'Ý thức học tập tốt, đi học đúng giờ, hăng hái phát biểu xây dựng bài.',
      competency: 'Năng lực tư duy logic đạt 820/1000, tiệm cận điểm chuẩn ĐGNL ĐHQG. Cần rèn luyện thêm kỹ năng làm bài trắc nghiệm dưới áp lực thời gian.',
      recommend: 'Bám sát lộ trình 30 ngày củng cố môn Hóa trên hệ thống EduTrack để khóa chặt danh hiệu học sinh Giỏi.',
    },
    {
      label: '⚠️ Cần củng cố kiến thức môn yếu',
      academic: 'Điểm kiểm tra thường xuyên một số môn còn dưới 7.0, bị hổng kiến thức căn bản ở phần lý thuyết và bài tập vận dụng.',
      conduct: 'Cần chú ý tập trung trong giờ học, hoàn thành đầy đủ bài tập về nhà.',
      competency: 'Năng lực đạt mức 710/1000. Cần nâng điểm các môn nòng cốt để đảm bảo điều kiện xét tốt nghiệp và đại học.',
      recommend: 'Đề nghị phối hợp cùng gia đình và bạn cùng bàn để kèm thêm 2 buổi/tuần, hoàn thành bài tập củng cố.',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setAcademicComment(p.academic);
    setConductComment(p.conduct);
    setCompetencyEvaluation(p.competency);
    setRecommendations(p.recommend);
  };

  const handleSaveSubjectGrade = (updatedSub: SubjectGrade) => {
    const recalculated = calculateSubjectAverage(
      updatedSub.regularGrades,
      updatedSub.midtermGrade,
      updatedSub.finalGrade
    );
    const finalSub = {
      ...updatedSub,
      averageGrade: recalculated,
      lastUpdatedBy: currentTeacher.fullName,
      lastUpdatedAt: new Date().toLocaleDateString('vi-VN'),
    };

    const newSubs = editingSubjects.map(s => s.id === finalSub.id ? finalSub : s);
    setEditingSubjects(newSubs);
    setActiveSubjectModal(null);
  };

  const handleCommitGradesToStudent = () => {
    onSaveGradesByTeacher(currentRecord.profile.id, editingSubjects);
    setSaveSuccessMsg(`Đã lưu và đồng bộ toàn bộ bảng điểm vào tài khoản của học sinh ${currentRecord.profile.fullName}!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleSaveComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicComment.trim()) return;

    const newComment: TeacherComment = {
      id: `tc-${Date.now()}`,
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.fullName,
      teacherTitle: currentTeacher.title || 'Giáo viên Chủ nhiệm',
      date: new Date().toLocaleDateString('vi-VN'),
      semester: semesterLabel,
      academicComment,
      conductComment: conductComment || 'Hạnh kiểm Tốt',
      competencyEvaluation,
      recommendations,
    };

    onSaveCommentByTeacher(currentRecord.profile.id, newComment);
    setSaveSuccessMsg(`Đã lưu nhận xét và đánh giá năng lực vào sổ học bạ của ${currentRecord.profile.fullName}!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const filteredRoster = studentsRoster.filter(r =>
    r.profile.fullName.toLowerCase().includes(searchRoster.toLowerCase()) ||
    r.profile.studentCode.toLowerCase().includes(searchRoster.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-purple-200">
              <UserCheck className="w-3.5 h-3.5" />
              Cổng Quản Lý Điểm Số & Đánh Giá Năng Lực Dành Cho Giáo Viên
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Sổ Gọi Tên & Ghi Điểm Lớp {currentTeacher.classRoom || '11A1'}
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm max-w-2xl">
              Giáo viên phụ trách: <strong className="text-white">{currentTeacher.fullName}</strong> ({currentTeacher.title}). Điểm sau khi lưu sẽ được cập nhật trực tiếp vào tài khoản học sinh và khóa quyền chỉnh sửa của học sinh.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 shrink-0">
            <Lock className="w-5 h-5 text-amber-300" />
            <div className="text-left text-xs">
              <span className="text-purple-200 block text-[10px] uppercase font-bold">Chế độ phân quyền</span>
              <strong className="text-white font-semibold">Toàn quyền nhập & khóa điểm</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">✕</button>
        </div>
      )}

      {/* Student Roster Selector Row */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Danh Sách Học Sinh Trong Lớp (Chọn học sinh để nhập điểm & nhận xét):
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchRoster}
              onChange={(e) => setSearchRoster(e.target.value)}
              placeholder="Tìm theo tên hoặc mã HS..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Horizontal Student Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredRoster.map((record) => {
            const isSelected = record.profile.id === currentRecord.profile.id;
            const gpa = calculateOverallGpa(record.subjects);
            const rank = classifyAcademicRank(record.subjects, gpa);

            return (
              <button
                key={record.profile.id}
                onClick={() => onSelectStudent(record.profile.id)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>{record.profile.fullName}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-purple-600"></span>}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {record.profile.studentCode}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Học lực: <strong className={rank.color}>{rank.rank}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">GPA</span>
                  <span className="text-lg font-black font-mono text-purple-700">{gpa.toFixed(1)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Work Area: Grade Entry + Teacher Comment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Grade Entry Table for Selected Student (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-purple-50/40">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Đang chấm điểm cho
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <span>{currentRecord.profile.fullName}</span>
                  <span className="font-mono text-xs text-slate-400 font-normal">({currentRecord.profile.studentCode})</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCommitGradesToStudent}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-purple-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu điểm vào tài khoản HS</span>
                </button>
              </div>
            </div>

            {/* Quick summary of the selected student */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>ĐTB Học kỳ (tính lại): <strong className="text-purple-700 font-mono text-sm">{overallGpa.toFixed(1)}</strong></span>
              <span>Xếp loại: <strong className={academicClassification.color}>{academicClassification.rank}</strong></span>
              <span>Quy chế: <span className="font-semibold">Thông tư 22/2021</span></span>
            </div>

            {/* Subjects Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 text-[11px] uppercase font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Môn Học</th>
                    <th className="py-2.5 px-3">ĐGTX (HS1)</th>
                    <th className="py-2.5 px-2 text-center">ĐGGK</th>
                    <th className="py-2.5 px-2 text-center">ĐGCK</th>
                    <th className="py-2.5 px-2 text-center font-bold text-purple-900 bg-purple-50/70">ĐTBm</th>
                    <th className="py-2.5 px-2 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editingSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {sub.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {sub.regularGrades.map((g, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px]">
                              {g.toFixed(1)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-medium">
                        {sub.midtermGrade.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-medium">
                        {sub.finalGrade.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-purple-700 bg-purple-50/30">
                        {sub.averageGrade.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => setActiveSubjectModal(sub)}
                          className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[11px] transition cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Nhập điểm</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
            <span>* Bấm "Nhập điểm" ở từng môn để sửa điểm miệng, 15p, giữa kỳ, cuối kỳ.</span>
            <button
              onClick={handleCommitGradesToStudent}
              className="text-purple-700 font-bold hover:underline cursor-pointer"
            >
              Lưu toàn bộ thay đổi →
            </button>
          </div>
        </div>

        {/* Right: Teacher Comment & Evaluation Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  Nhận Xét & Đánh Giá Năng Lực Học Sinh
                </h3>
                <p className="text-xs text-slate-500">
                  Nhận xét sẽ hiển thị trực tiếp trên tài khoản học sinh {currentRecord.profile.fullName}
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Chọn mẫu nhận xét nhanh:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-purple-50 hover:text-purple-700 border border-slate-200 transition cursor-pointer text-slate-700"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveComment} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Đánh giá học lực & kết quả học tập các môn *
                </label>
                <textarea
                  rows={2}
                  value={academicComment}
                  onChange={(e) => setAcademicComment(e.target.value)}
                  placeholder="Ví dụ: Em Nam có tư duy logic môn Toán và Tin học rất tốt, tiếp thu bài nhanh..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 leading-relaxed text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Đánh giá ý thức rèn luyện & hạnh kiểm *
                </label>
                <textarea
                  rows={2}
                  value={conductComment}
                  onChange={(e) => setConductComment(e.target.value)}
                  placeholder="Ví dụ: Chấp hành tốt nội quy trường lớp, tham gia tích cực phong trào đoàn..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 leading-relaxed text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Đánh giá năng lực chuyên sâu & định hướng thi cử
                </label>
                <textarea
                  rows={2}
                  value={competencyEvaluation}
                  onChange={(e) => setCompetencyEvaluation(e.target.value)}
                  placeholder="Ví dụ: Năng lực tư duy định lượng đạt 850/1000, rất phù hợp với kỳ thi ĐGNL ĐHQG..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 leading-relaxed text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4. Lời khuyên & Định hướng kế hoạch ôn tập
                </label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Ví dụ: Khuyên em bám sát Lộ trình luyện tập ĐGNL và dành thêm 45p/tuần môn Hóa..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 leading-relaxed text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!academicComment.trim()}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-purple-500/20 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Lưu & Gửi Nhận Xét Vào Hồ Sơ Học Sinh</span>
                </button>
              </div>
            </form>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Giáo viên ký nhận: <strong>{currentTeacher.fullName}</strong> • Ngày cập nhật: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Modal Edit Subject Grades by Teacher */}
      {activeSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-purple-700 uppercase font-bold">Giáo viên nhập điểm</span>
                <h3 className="text-base font-bold text-slate-900">
                  Môn: {activeSubjectModal.name} - {currentRecord.profile.fullName}
                </h3>
              </div>
              <button
                onClick={() => setActiveSubjectModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Điểm Thường Xuyên (ĐGTX - Các bài 15p, miệng cách nhau bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={activeSubjectModal.regularGrades.join(', ')}
                  onChange={(e) => {
                    const parsed = e.target.value
                      .split(',')
                      .map(s => parseFloat(s.trim()))
                      .filter(n => !isNaN(n) && n >= 0 && n <= 10);
                    setActiveSubjectModal({ ...activeSubjectModal, regularGrades: parsed });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Điểm Giữa Kỳ (ĐGGK - Hệ số 2)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={activeSubjectModal.midtermGrade}
                    onChange={(e) => setActiveSubjectModal({ ...activeSubjectModal, midtermGrade: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Điểm Cuối Kỳ (ĐGCK - Hệ số 3)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={activeSubjectModal.finalGrade}
                    onChange={(e) => setActiveSubjectModal({ ...activeSubjectModal, finalGrade: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveSubjectModal(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveSubjectGrade(activeSubjectModal)}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer shadow-xs"
              >
                Cập nhật điểm môn này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
