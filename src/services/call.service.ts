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
    try {
      // Create the call record in the DB
      const call = await this.callDataSource.create(record);

      // If streamCallId is provided, update Stream channel status
      if (record.streamCallId) {
        await streamService.setCallStatus(record.streamCallId, "ACTIVE");
      }

      return call;
    } catch (error) {
      console.error('Error creating call:', error);
      throw new Error('Failed to create call record');
    }
  }

  async getCallByAppointmentId(appointmentId: string): Promise<ICall | null> {
    try {
      return await this.callDataSource.fetchOne({
        where: { appointmentId }
      });
    } catch (error) {
      console.error('Error fetching call by appointment ID:', error);
      throw new Error('Failed to fetch call record');
    }
  }

  async updateCallStatus(callId: string, status: "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED"): Promise<void> {
    try {
      const call = await this.getCallById(callId);
      if (!call) {
        throw new Error('Call not found');
      }

      await this.callDataSource.updateOne(
        { where: { id: callId } },
        { status }
      );

      // If there's a Stream call ID, update its status
      if (call.streamCallId) {
        await streamService.setCallStatus(call.streamCallId, status);
      }
    } catch (error) {
      console.error('Error updating call status:', error);
      throw new Error('Failed to update call status');
    }
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