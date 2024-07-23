import CallDataSource from "../datasources/call.datasource";
import PatientDataSource from "../datasources/patient.datasource";
import { makeCall } from "./twilio.service";
import { ICall, ICallCreationBody } from "../interfaces/call.interface";

class CallService {
  private patientDataSource: PatientDataSource;
  private callDataSource: CallDataSource;

  constructor() {
    this.callDataSource = new CallDataSource();
    this.patientDataSource = new PatientDataSource();
  }

  async createCall(record: ICallCreationBody): Promise<ICall> {
    const call = await this.callDataSource.create(record);

    const patient = await this.patientDataSource.fetchOne({
      where: { userId: record.patientId },
    });
    console.log(patient)
    // if (!patient || !patient.phoneNumber) {
    //   throw new Error("Patient does not have a phone number.");
    // }

    try {
      await makeCall("00237673461722", record.appointmentId);
      await this.callDataSource.updateOne(
        { where: { id: call.id } },
        { status: "COMPLETED" }
      );
    } catch (error) {
      await this.callDataSource.updateOne(
        { where: { id: call.id } },
        { status: "FAILED" }
      );
      throw error;
    }

    return call;
  }

  async getCallById(callId: string): Promise<ICall | null> {
    return await this.callDataSource.fetchOne({
      where: { id: callId },
    });
  }

  async getCalls(): Promise<ICall[]> {
    const query = { where: {}, raw: true };
    return this.callDataSource.fetchAll(query);
  }

  async deleteCall(callId: string): Promise<void> {
    await this.callDataSource.deleteOne({ where: { id: callId } });
  }
}

export default CallService