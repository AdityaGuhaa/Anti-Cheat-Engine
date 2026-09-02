import { Router, type Request, type Response } from "express";
import { requireRole, requireAuth } from "../middleware/auth.middleware";
import {
  getUserNavbarDetails,
  getUserProfile,
  updateProfile,
} from "../sharedAPIS/user info/user.controller";
import { getExamQuestions } from "../exam/exam.controller";

import {
  getCandidateDashboardDetails,
  getPastExams,
  getUpcomingExams,
  startExam,
  submitExam,
  logProctoringEvent,
  getExamDetails,
} from "./candidate.controller";
import { upload, uploadTelemetry } from "./telemetry.controller";

const router = Router();

router.use(requireAuth);

router.post(
  "/telemetry/upload",
  requireAuth,
  upload.fields([{ name: "image" }, { name: "audio" }]),
  uploadTelemetry,
);

router.get("/me", requireRole("CANDIDATE"), getUserNavbarDetails);

router.get("/profile", requireRole("CANDIDATE"), getUserProfile);

router.post("/profile/update", requireRole("CANDIDATE"), updateProfile);

router.get(
  "/dashboard",
  requireRole("CANDIDATE"),
  getCandidateDashboardDetails,
);

router.get("/exams/upcoming", requireRole("CANDIDATE"), getUpcomingExams);

router.get("/exams/past", requireRole("CANDIDATE"), getPastExams);

router.post(
  "/dashboard/candidate/exams/start",
  requireRole("CANDIDATE"),
  startExam,
);

router.post("/exams/submit", requireRole("CANDIDATE"), submitExam);

router.post("/proctoring/log", requireRole("CANDIDATE"), logProctoringEvent);

router.post("/exams/start", requireRole("CANDIDATE"), startExam);

// Candidate Route to get 5 MCQs
router.get("/:id/questions", requireAuth, getExamQuestions);

// Candidate Route to submit the exam
router.post("/:id/submit", requireAuth, submitExam);

router.get("/:id/details", requireAuth, getExamDetails);

export default router;
