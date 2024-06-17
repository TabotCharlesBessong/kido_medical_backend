To integrate the `Prescription`, `Medication`, and `TestResult` services into your existing system, you need to create routes that map to the corresponding controller methods. These routes should be registered in your Express application just like your existing user routes.

### Prescription Routes

#### routes/prescription.router.ts
```typescript
import express from "express";
import PrescriptionController from "../controllers/prescription.controller";
import { validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/prescription.validator.schema";

const router = express.Router();

router.post(
  "/",
  validator(validationSchema.createPrescriptionSchema),
  PrescriptionController.createPrescription
);

router.get("/:id", PrescriptionController.getPrescriptionById);

router.put(
  "/:id",
  validator(validationSchema.updatePrescriptionSchema),
  PrescriptionController.updatePrescription
);

router.delete("/:id", PrescriptionController.deletePrescription);

export default router;
```

### Medication Routes

#### routes/medication.router.ts
```typescript
import express from "express";
import MedicationController from "../controllers/medication.controller";
import { validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/medication.validator.schema";

const router = express.Router();

router.post(
  "/",
  validator(validationSchema.createMedicationSchema),
  MedicationController.createMedication
);

router.get("/:id", MedicationController.getMedicationById);

router.put(
  "/:id",
  validator(validationSchema.updateMedicationSchema),
  MedicationController.updateMedication
);

router.delete("/:id", MedicationController.deleteMedication);

export default router;
```

### TestResult Routes

#### routes/testResult.router.ts
```typescript
import express from "express";
import TestResultController from "../controllers/testResult.controller";
import { validator } from "../middlewares/index.middlewares";
import validationSchema from "../validators/testResult.validator.schema";

const router = express.Router();

router.post(
  "/",
  validator(validationSchema.createTestResultSchema),
  TestResultController.createTestResult
);

router.get("/:id", TestResultController.getTestResultById);

router.put(
  "/:id",
  validator(validationSchema.updateTestResultSchema),
  TestResultController.updateTestResult
);

router.delete("/:id", TestResultController.deleteTestResult);

export default router;
```

### Integration with the Main Application

To integrate these routes with your main Express application, you need to register them in your main server file.

#### server.ts or app.ts
```typescript
import express from "express";
import userRoutes from "./routes/user.router";
import doctorRoutes from "./routes/doctor.router";
import patientRoutes from "./routes/patient.router";
import prescriptionRoutes from "./routes/prescription.router";
import medicationRoutes from "./routes/medication.router";
import testResultRoutes from "./routes/testResult.router";

const app = express();

app.use(express.json());

// Register routes
app.use("/users", userRoutes);
app.use("/doctors", doctorRoutes);
app.use("/patients", patientRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/medications", medicationRoutes);
app.use("/test-results", testResultRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### Validation Schemas

Ensure you have the necessary validation schemas for prescriptions, medications, and test results.

#### validators/prescription.validator.schema.ts
```typescript
import * as yup from "yup";

const createPrescriptionSchema = yup.object({
  patientId: yup.string().uuid().required(),
  doctorId: yup.string().uuid().required(),
  description: yup.string().required(),
});

const updatePrescriptionSchema = yup.object({
  description: yup.string().optional(),
});

const validationSchema = {
  createPrescriptionSchema,
  updatePrescriptionSchema,
};

export default validationSchema;
```

#### validators/medication.validator.schema.ts
```typescript
import * as yup from "yup";

const createMedicationSchema = yup.object({
  prescriptionId: yup.string().uuid().required(),
  name: yup.string().required(),
  dosage: yup.string().required(),
});

const updateMedicationSchema = yup.object({
  name: yup.string().optional(),
  dosage: yup.string().optional(),
});

const validationSchema = {
  createMedicationSchema,
  updateMedicationSchema,
};

export default validationSchema;
```

#### validators/testResult.validator.schema.ts
```typescript
import * as yup from "yup";

const createTestResultSchema = yup.object({
  prescriptionId: yup.string().uuid().required(),
  name: yup.string().required(),
  result: yup.string().required(),
});

const updateTestResultSchema = yup.object({
  name: yup.string().optional(),
  result: yup.string().optional(),
});

const validationSchema = {
  createTestResultSchema,
  updateTestResultSchema,
};

export default validationSchema;
```

### Conclusion

With these routes, services, controllers, and validation schemas in place, you should have a fully integrated system capable of handling prescriptions, medications, and test results. Ensure to test each route thoroughly to verify that the CRUD operations are working correctly.