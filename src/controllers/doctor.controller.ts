import { Request, Response } from "express";
import { IDoctorCreationBody } from "../interfaces/doctor.interface";
import DoctorService from "../services/doctor.service";
import UserService from "../services/user.services";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code.enum";

class DoctorController {
  private doctorService: DoctorService;
  private userService: UserService;

  constructor(_doctorService: DoctorService, _userService: UserService) {
    this.doctorService = _doctorService;
    this.userService = _userService;
  }

  async registerDoctor(req: Request, res: Response) {
    try {
      const {
        userId,
        specialization,
        verificationStatus,
        documents,
      }: IDoctorCreationBody = req.body;

      // Create the doctor record
      const doctorRecord = {
        userId,
        specialization,
        verificationStatus,
        documents,
      };
      const doctor = await this.doctorService.createDoctor(doctorRecord);
      return Utility.handleSuccess(
        res,
        "Doctor created successfully",
        { doctor },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }
}

export default DoctorController
