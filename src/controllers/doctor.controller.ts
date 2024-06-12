import { Request, Response } from "express";
import { IDoctorCreationBody } from "../interfaces/doctor.interface";
import DoctorService from "../services/doctor.service";
import UserService from "../services/user.services";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code.enum";
import { UserRoles } from "../interfaces/enum/user.enum";

class DoctorController {
  private doctorService: DoctorService;
  private userService: UserService;

  constructor(_doctorService: DoctorService, _userService: UserService) {
    this.doctorService = _doctorService;
    this.userService = _userService;
  }

  async registerDoctor(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newDoctor = {
        userId: params.user.id,
        specialization: params.specialization,
        verificationStatus: params.verificationStatus,
        documents: params.documents,
      };

      const doctor = await this.doctorService.createDoctor(newDoctor);

      // Update the user's role to "doctor"
      await this.userService.updateUserRole(params.user.id, UserRoles.DOCTOR);
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
