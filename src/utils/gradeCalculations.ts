import { SubjectGrade, StudentProfile, CompetitionGoal, CompetencyEvaluation } from '../types';

/**
 * Tính điểm trung bình môn theo quy chế Bộ GD&ĐT:
 * ĐTBm = (Tổng ĐGTX + 2*ĐGGK + 3*ĐGCK) / (Số bài ĐGTX + 2 + 3)
 */
export function calculateSubjectAverage(
  regularGrades: number[],
  midtermGrade: number,
  finalGrade: number
): number {
  const txSum = regularGrades.reduce((sum, g) => sum + g, 0);
  const totalWeight = regularGrades.length + 2 + 3;
  if (totalWeight === 0) return 0;
  
  const rawAvg = (txSum + midtermGrade * 2 + finalGrade * 3) / totalWeight;
  return Math.round(rawAvg * 10) / 10;
}

/**
 * Tính điểm trung bình chung học kỳ (GPA)
 */
export function calculateOverallGpa(subjects: SubjectGrade[]): number {
  if (subjects.length === 0) return 0;
  const sum = subjects.reduce((acc, sub) => acc + sub.averageGrade, 0);
  return Math.round((sum / subjects.length) * 10) / 10;
}

/**
 * Xếp loại học lực theo Thông tư 22 (Chương trình GDPT 2018 mới):
 * - Xuất sắc: ĐTBhk >= 9.0, tất cả các môn >= 6.5, có ít nhất 6 môn >= 9.0
 * - Giỏi: ĐTBhk >= 8.0, tất cả các môn >= 6.5
 * - Khá: ĐTBhk >= 6.5, tất cả các môn >= 5.0
 * - Đạt: ĐTBhk >= 5.0, tất cả các môn >= 3.5
 * - Chưa đạt: các trường hợp còn lại
 */
export function classifyAcademicRank(subjects: SubjectGrade[], gpa: number): {
  rank: 'Xuất sắc' | 'Giỏi' | 'Khá' | 'Đạt' | 'Chưa đạt';
  color: string;
  badgeBg: string;
  description: string;
} {
  if (subjects.length === 0) {
    return {
      rank: 'Đạt',
      color: 'text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Chưa đủ dữ liệu điểm để đánh giá',
    };
  }

  const minGrade = Math.min(...subjects.map(s => s.averageGrade));
  const gradesAbove9Count = subjects.filter(s => s.averageGrade >= 9.0).length;

  if (gpa >= 9.0 && minGrade >= 6.5 && gradesAbove9Count >= 6) {
    return {
      rank: 'Xuất sắc',
      color: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30',
      description: 'Học sinh đạt kết quả rèn luyện và học tập xuất sắc toàn diện',
    };
  }

  if (gpa >= 8.0 && minGrade >= 6.5) {
    return {
      rank: 'Giỏi',
      color: 'text-blue-700',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-400/30',
      description: 'Học sinh đạt kết quả học tập giỏi',
    };
  }

  if (gpa >= 6.5 && minGrade >= 5.0) {
    return {
      rank: 'Khá',
      color: 'text-teal-700',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-300',
      description: 'Học sinh đạt kết quả học tập khá',
    };
  }

  if (gpa >= 5.0 && minGrade >= 3.5) {
    return {
      rank: 'Đạt',
      color: 'text-amber-700',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
      description: 'Học sinh đạt chuẩn cơ bản, cần nỗ lực thêm',
    };
  }

  return {
    rank: 'Chưa đạt',
    color: 'text-rose-700',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
    description: 'Có môn học dưới 3.5 hoặc ĐTB < 5.0, cần kế hoạch cải thiện gấp',
  };
}

/**
 * Quy đổi chứng chỉ ngoại ngữ sang điểm năng lực (thang 200 điểm)
 */
export function evaluateCertificateScore(profile: StudentProfile): number {
  if (!profile.certificates || profile.certificates.length === 0) return 40; // Điểm cơ bản
  
  let maxScore = 40;
  for (const cert of profile.certificates) {
    let score = 40;
    if (cert.type === 'IELTS') {
      const band = Number(cert.score);
      if (band >= 8.0) score = 200;
      else if (band >= 7.5) score = 185;
      else if (band >= 7.0) score = 170;
      else if (band >= 6.5) score = 150;
      else if (band >= 6.0) score = 130;
      else if (band >= 5.5) score = 110;
      else score = 80;
    } else if (cert.type === 'SAT') {
      const sat = Number(cert.score);
      if (sat >= 1500) score = 200;
      else if (sat >= 1400) score = 175;
      else if (sat >= 1300) score = 150;
      else if (sat >= 1200) score = 120;
      else score = 80;
    } else if (cert.type === 'TOEIC') {
      const toeic = Number(cert.score);
      if (toeic >= 900) score = 190;
      else if (toeic >= 800) score = 160;
      else if (toeic >= 700) score = 130;
      else score = 80;
    } else {
      score = cert.equivalentCompetencyScore || 100;
    }
    if (score > maxScore) maxScore = score;
  }
  return maxScore;
}

/**
 * Tính điểm hoạt động ngoại khóa / giải thưởng (thang 100 điểm)
 */
export function evaluateActivityScore(profile: StudentProfile): number {
  if (!profile.achievements || profile.achievements.length === 0) return 20;
  const total = profile.achievements.reduce((sum, a) => sum + (a.points || 15), 0);
  return Math.min(100, 20 + total);
}

/**
 * Tính toán Năng lực Đa chiều theo Hệ quy chiếu Chuẩn (Thang 1000 điểm)
 */
export function evaluateCompetency(
  profile: StudentProfile,
  subjects: SubjectGrade[],
  goal: CompetitionGoal
): CompetencyEvaluation {
  const gpa = calculateOverallGpa(subjects);
  const weights = goal.benchmarkWeights || {
    academicGpa: 350,
    coreSubjects: 350,
    languageCert: 150,
    activities: 150,
  };

  // Trụ cột 1: GPA Học bạ (thang điểm tối đa = weights.academicGpa)
  // GPA 10.0 tương đương 100% điểm trọng số GPA
  const gpaRatio = Math.min(1, Math.max(0, gpa / 10));
  const currentGpaScore = Math.round(gpaRatio * weights.academicGpa);

  // Trụ cột 2: Các môn nòng cốt của mục tiêu (thang điểm tối đa = weights.coreSubjects)
  // Lấy các môn nòng cốt nếu có, hoặc các môn Toán, Văn, Anh, Lý, Hóa
  const coreSubjects = subjects.filter(s => s.isCoreSubject);
  const evaluatedCoreSubs = coreSubjects.length > 0 ? coreSubjects : subjects.slice(0, 3);
  const avgCoreGrade = evaluatedCoreSubs.length > 0
    ? evaluatedCoreSubs.reduce((sum, s) => sum + s.averageGrade, 0) / evaluatedCoreSubs.length
    : gpa;
  const coreRatio = Math.min(1, Math.max(0, avgCoreGrade / 10));
  const currentCoreScore = Math.round(coreRatio * weights.coreSubjects);

  // Trụ cột 3: Chứng chỉ ngoại ngữ (thang điểm tối đa = weights.languageCert)
  const certRawScore = evaluateCertificateScore(profile); // thang 200
  const certRatio = certRawScore / 200;
  const currentLanguageScore = Math.round(certRatio * weights.languageCert);

  // Trụ cột 4: Hoạt động & Nghiên cứu (thang điểm tối đa = weights.activities)
  const actRawScore = evaluateActivityScore(profile); // thang 100
  const actRatio = actRawScore / 100;
  const currentActivityScore = Math.round(actRatio * weights.activities);

  // Tổng điểm hệ quy chiếu hiện tại
  const totalScore = currentGpaScore + currentCoreScore + currentLanguageScore + currentActivityScore;
  const requiredScore = goal.requiredScore || 800;
  const gapScore = Math.max(0, requiredScore - totalScore);

  // Phân loại trạng thái
  let status: 'qualified' | 'close' | 'needs_boost' = 'needs_boost';
  if (gapScore === 0) {
    status = 'qualified';
  } else if (gapScore <= 80) {
    status = 'close';
  }

  // Phân tích lỗ hổng & Môn ưu tiên cần cải thiện
  const weakSubjects = [...subjects].sort((a, b) => a.averageGrade - b.averageGrade);
  const prioritySubjects = weakSubjects.slice(0, 3).map(s => s.name);

  let gapAnalysis = '';
  if (gapScore === 0) {
    gapAnalysis = `Chúc mừng! Hồ sơ năng lực của bạn đạt ${totalScore}/${requiredScore} điểm, đã vượt chuẩn yêu cầu của "${goal.title}". Bạn hãy duy trì phong độ và luyện thêm các bộ đề thi thử.`;
  } else if (gapScore <= 80) {
    gapAnalysis = `Bạn đang đạt ${totalScore}/${requiredScore} điểm (chỉ còn thiếu ${gapScore} điểm để đạt chuẩn). Điểm các môn nòng cốt cần kéo nhẹ thêm 0.3 - 0.5 điểm ở bài kiểm tra cuối kỳ để chắc suất.`;
  } else {
    gapAnalysis = `Khoảng cách hiện tại là ${gapScore} điểm (${totalScore}/${requiredScore}). Các môn đang kéo tụt điểm gồm ${prioritySubjects.join(', ')}. Hãy tập trung hoàn thành các bài tập trong lịch trình cải thiện để bù điểm.`;
  }

  return {
    totalScore,
    requiredScore,
    gapScore,
    status,
    pillars: {
      gpaScore: { current: currentGpaScore, max: weights.academicGpa },
      coreScore: { current: currentCoreScore, max: weights.coreSubjects },
      languageScore: { current: currentLanguageScore, max: weights.languageCert },
      activityScore: { current: currentActivityScore, max: weights.activities },
    },
    gapAnalysis,
    prioritySubjects,
  };
}
