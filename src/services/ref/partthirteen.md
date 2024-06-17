To handle the creation, updating, and deletion of `Prescription`, `Medication`, and `TestResult` entities, you need to create corresponding services that interact with the data sources. These services will encapsulate the business logic and provide a clean API for the controllers to use.

### Prescription Service

#### services/prescription.service.ts
```typescript
import PrescriptionDataSource from "../datasources/prescription.datasource";
import { IPrescription, IPrescriptionCreationBody } from "../interfaces/prescription.interface";

class PrescriptionService {
  private prescriptionDataSource: PrescriptionDataSource;

  constructor() {
    this.prescriptionDataSource = new PrescriptionDataSource();
  }

  async createPrescription(data: IPrescriptionCreationBody): Promise<IPrescription> {
    return this.prescriptionDataSource.create(data);
  }

  async getPrescriptionById(id: string): Promise<IPrescription | null> {
    return this.prescriptionDataSource.fetchOne({ where: { id } });
  }

  async updatePrescription(id: string, data: Partial<IPrescription>): Promise<void> {
    return this.prescriptionDataSource.updateOne({ where: { id } }, data);
  }

  async deletePrescription(id: string): Promise<void> {
    return this.prescriptionDataSource.updateOne({ where: { id } }, { status: 'INACTIVE' });
  }
}

export default PrescriptionService;
```

### Medication Service

#### services/medication.service.ts
```typescript
import MedicationDataSource from "../datasources/medication.datasource";
import { IMedication, IMedicationCreationBody } from "../interfaces/medication.interface";

class MedicationService {
  private medicationDataSource: MedicationDataSource;

  constructor() {
    this.medicationDataSource = new MedicationDataSource();
  }

  async createMedication(data: IMedicationCreationBody): Promise<IMedication> {
    return this.medicationDataSource.create(data);
  }

  async getMedicationById(id: string): Promise<IMedication | null> {
    return this.medicationDataSource.fetchOne({ where: { id } });
  }

  async updateMedication(id: string, data: Partial<IMedication>): Promise<void> {
    return this.medicationDataSource.updateOne({ where: { id } }, data);
  }

  async deleteMedication(id: string): Promise<void> {
    return this.medicationDataSource.updateOne({ where: { id } }, { status: 'INACTIVE' });
  }
}

export default MedicationService;
```

### TestResult Service

#### services/testResult.service.ts
```typescript
import TestResultDataSource from "../datasources/testResult.datasource";
import { ITestResult, ITestResultCreationBody } from "../interfaces/testResult.interface";

class TestResultService {
  private testResultDataSource: TestResultDataSource;

  constructor() {
    this.testResultDataSource = new TestResultDataSource();
  }

  async createTestResult(data: ITestResultCreationBody): Promise<ITestResult> {
    return this.testResultDataSource.create(data);
  }

  async getTestResultById(id: string): Promise<ITestResult | null> {
    return this.testResultDataSource.fetchOne({ where: { id } });
  }

  async updateTestResult(id: string, data: Partial<ITestResult>): Promise<void> {
    return this.testResultDataSource.updateOne({ where: { id } }, data);
  }

  async deleteTestResult(id: string): Promise<void> {
    return this.testResultDataSource.updateOne({ where: { id } }, { status: 'INACTIVE' });
  }
}

export default TestResultService;
```

### Controllers

Finally, you need to create controllers that handle the HTTP requests and use the services to perform the required operations.

#### controllers/prescription.controller.ts
```typescript
import { Request, Response } from "express";
import PrescriptionService from "../services/prescription.service";

class PrescriptionController {
  private prescriptionService: PrescriptionService;

  constructor() {
    this.prescriptionService = new PrescriptionService();
  }

  async createPrescription(req: Request, res: Response) {
    try {
      const prescription = await this.prescriptionService.createPrescription(req.body);
      res.status(201).json(prescription);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPrescriptionById(req: Request, res: Response) {
    try {
      const prescription = await this.prescriptionService.getPrescriptionById(req.params.id);
      if (prescription) {
        res.status(200).json(prescription);
      } else {
        res.status(404).json({ message: "Prescription not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePrescription(req: Request, res: Response) {
    try {
      await this.prescriptionService.updatePrescription(req.params.id, req.body);
      res.status(200).json({ message: "Prescription updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deletePrescription(req: Request, res: Response) {
    try {
      await this.prescriptionService.deletePrescription(req.params.id);
      res.status(200).json({ message: "Prescription deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new PrescriptionController();
```

#### controllers/medication.controller.ts
```typescript
import { Request, Response } from "express";
import MedicationService from "../services/medication.service";

class MedicationController {
  private medicationService: MedicationService;

  constructor() {
    this.medicationService = new MedicationService();
  }

  async createMedication(req: Request, res: Response) {
    try {
      const medication = await this.medicationService.createMedication(req.body);
      res.status(201).json(medication);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMedicationById(req: Request, res: Response) {
    try {
      const medication = await this.medicationService.getMedicationById(req.params.id);
      if (medication) {
        res.status(200).json(medication);
      } else {
        res.status(404).json({ message: "Medication not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateMedication(req: Request, res: Response) {
    try {
      await this.medicationService.updateMedication(req.params.id, req.body);
      res.status(200).json({ message: "Medication updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteMedication(req: Request, res: Response) {
    try {
      await this.medicationService.deleteMedication(req.params.id);
      res.status(200).json({ message: "Medication deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new MedicationController();
```

#### controllers/testResult.controller.ts
```typescript
import { Request, Response } from "express";
import TestResultService from "../services/testResult.service";

class TestResultController {
  private testResultService: TestResultService;

  constructor() {
    this.testResultService = new TestResultService();
  }

  async createTestResult(req: Request, res: Response) {
    try {
      const testResult = await this.testResultService.createTestResult(req.body);
      res.status(201).json(testResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTestResultById(req: Request, res: Response) {
    try {
      const testResult = await this.testResultService.getTestResultById(req.params.id);
      if (testResult) {
        res.status(200).json(testResult);
      } else {
        res.status(404).json({ message: "Test result not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTestResult(req: Request, res: Response) {
    try {
      await this.testResultService.updateTestResult(req.params.id, req.body);
      res.status(200).json({ message: "Test result updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteTestResult(req: Request, res: Response) {
    try {
      await this.testResultService.deleteTestResult(req.params.id);
      res.status(200).json({ message: "Test result deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new TestResultController();
```

These services and controllers will allow you to handle the CRUD operations for prescriptions, medications, and test results effectively. Ensure that these files are appropriately integrated into your existing Express application and that the necessary routes are created to handle the endpoints.