import CallDataSource from "../datasources/call.datasource";
import PatientDataSource from "../datasources/patient.datasource";
import streamService from "./stream.service";
import { ICall, ICallCreationBody } from "../interfaces/call.interface";

class CallService {
  private patientDataSource: PatientDataSource;
  private callDataSource: CallDataSource;

  constructor() {
    this.callDataSource = new CallDataSource();
    this.patientDataSource = new PatientDataSource();
  }

  async createCall(record: ICallCreationBody): Promise<ICall> {
    // Create the call record in the DB
    const call = await this.callDataSource.create(record);

    // Optionally, update the Stream channel status to ACTIVE
    if (record.streamCallId) {
      await streamService.setCallStatus(record.streamCallId, "ACTIVE");
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

  async updateCall(callId: string, data: Partial<ICall>): Promise<ICall> {
    await this.callDataSource.updateOne(
      { where: { id: callId } },
      data
    );
    const updatedCall = await this.getCallById(callId);
    if (!updatedCall) {
      throw new Error("Call not found after update");
    }
    // If status is being updated and streamCallId exists, update Stream channel status
    if (data.status && updatedCall.streamCallId) {
      await streamService.setCallStatus(updatedCall.streamCallId, data.status as any);
    }
    return updatedCall;
  }

  async deleteCall(callId: string): Promise<void> {
    await this.callDataSource.deleteOne({ where: { id: callId } });
  }
}

export default CallService