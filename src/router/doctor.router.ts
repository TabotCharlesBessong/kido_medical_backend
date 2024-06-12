import express, { Request, Response } from 'express';
import UserService from '../services/user.services';
import UserDataSource from '../datasources/user.datasource';
import DoctorService from '../services/doctor.service';
import DoctorDataSource from '../datasources/doctor.datasource';
import DoctorController from '../controllers/doctor.controller';
import validationSchema from '../validators/doctor.validator.schema';
import { Auth, validator } from '../middlewares/index.middlewares';

const createDoctorRoute = () => {
  const router = express.Router()
  const userService = new UserService(new UserDataSource())
  const doctorService = new DoctorService(new DoctorDataSource())
  const doctorController = new DoctorController(doctorService,userService)

  router.post("/create",validator(validationSchema.doctorValidationSchema),Auth(),(req:Request,res:Response) => {
    return doctorController.registerDoctor(req,res)
  })

  return router
}

export default createDoctorRoute()