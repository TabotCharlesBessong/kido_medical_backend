router.patch(
  '/:doctorId/verify',
  authenticate,
  isAdmin,
  DoctorController.updateVerificationStatus
);

router.patch(
  '/:doctorId',
  authenticate,
  DoctorController.updateDoctor
);