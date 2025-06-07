import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/role.middleware';

const router = Router();
const doctorController = new DoctorController();

// Public routes
router.post('/', doctorController.createDoctor);

// Protected routes
router.get('/', authenticate, doctorController.getDoctors);
router.get('/:id', authenticate, doctorController.getDoctorById);
router.patch('/:id', authenticate, doctorController.updateDoctor);

// Admin only routes
router.patch('/verify/approve', authenticate, isAdmin, doctorController.approveDoctor);
router.patch('/verify/decline', authenticate, isAdmin, doctorController.declineDoctor);

export default router; 