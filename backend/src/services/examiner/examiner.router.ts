import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import {
  getUserNavbarDetails,
  getUserProfile,
  updateProfile,
} from "../sharedAPIS/user info/user.controller";
import {
  createExam,
  getExaminerDashboard,
  getExamResults,
  getAllExaminerExams,
} from "./examiner.controller"; // Add the missing imports

const router = Router();
router.use(requireAuth);

router.get("/me", requireRole("EXAMINER"), getUserNavbarDetails);
router.get("/dashboard", requireRole("EXAMINER"), getExaminerDashboard);
router.get("/profile", requireRole("EXAMINER"), getUserProfile);
router.post("/profile/update", requireRole("EXAMINER"), updateProfile);
router.post("/create-exam", requireRole("EXAMINER"), createExam);

// FIX: Hook up the real API to fetch all exams for the ExaminationsPage
router.get("/exams", requireRole("EXAMINER"), getAllExaminerExams);

// FIX: Hook up the results API for the ResultsPage
router.get("/exams/:examId/results", requireRole("EXAMINER"), getExamResults);

export default router;
