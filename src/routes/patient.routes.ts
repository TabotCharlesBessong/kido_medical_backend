router.patch(
  '/:patientId',
  authenticate,
  PatientController.updatePatient
); 