import { faker } from '@faker-js/faker';
import Db from '../index';
import UserModel from '../../models/user.model';
import DoctorModel from '../../models/doctor.model';
import PatientModel from '../../models/patient.model';
import TimeSlotModel from '../../models/timeslot.model';
import AppointmentModel from '../../models/appointment.model';
import PostModel from '../../models/post.model';
import CommentModel from '../../models/comment.model';
import LikeModel from '../../models/like.model';
import MessageModel from '../../models/message.model';
import NotificationModel from '../../models/notification.model';
import VitalSignModel from '../../models/vitalsign.model';
import ConsultationModel from '../../models/consultation.model';
import PrescriptionModel from '../../models/prescription.model';
import MedicationModel from '../../models/medication.model';
import CallModel from '../../models/call.model';
import { QueryTypes } from 'sequelize';
import { EmailStatus, AccountStatus } from '../../interfaces/enum/user.enum';
import { AppointmentStatus } from '../../interfaces/enum/patient.enum';
import { NotificationType } from '../../interfaces/enum/notification.enum';
import { Frequency } from '../../interfaces/enum/doctor.enum';
import { IMedication } from '../../interfaces/medication.interface';
import bcrypt from 'bcrypt';

const hashPassword = async (password: string) : Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt) as string;
}

const seedDatabase = async () => {
  const transaction = await Db.transaction();
  
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await Db.query('TRUNCATE TABLE "users" CASCADE', { 
      type: QueryTypes.RAW,
      transaction 
    });
    console.log('Cleared existing data');

    // Create users (50 total: 10 doctors, 40 patients)
    const users = [];
    const doctors = [];
    const patients = [];

    // Create doctor users (all verified)
    for (let i = 0; i < 10; i++) {
      const hashedPassword = await hashPassword('Password#123');
      const user = await UserModel.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: hashedPassword,
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        role: 'DOCTOR',
        isEmailVerified: EmailStatus.VERIFIED,
        accountStatus: AccountStatus.ACTIVE
      }, { transaction });
      users.push(user);
      doctors.push(user);

      // Create doctor profile immediately after user creation
      await DoctorModel.create({
        userId: user.id,
        specialization: faker.helpers.arrayElement(['Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics']),
        verificationStatus: 'VERIFIED',
        documents: faker.image.url(),
        language: faker.helpers.arrayElements(['English', 'French', 'Spanish', 'Arabic'], { min: 1, max: 3 }),
        fee: faker.number.float({ min: 50, max: 200, fractionDigits: 2 }),
        experience: faker.number.int({ min: 1, max: 30 })
      }, { transaction });
    }

    // Create patient users (35 verified, 5 unverified)
    for (let i = 0; i < 40; i++) {
      const hashedPassword = await hashPassword('Password#123');
      const user = await UserModel.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: hashedPassword,
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        role: 'PATIENT',
        isEmailVerified: i < 35 ? EmailStatus.VERIFIED : EmailStatus.NOT_VERIFIED,
        accountStatus: AccountStatus.ACTIVE
      }, { transaction });
      users.push(user);
      patients.push(user);

      // Create patient profile immediately after user creation
      await PatientModel.create({
        userId: user.id,
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
        age: faker.number.int({ min: 1, max: 80 }),
        address1: faker.location.streetAddress(),
        address2: faker.location.secondaryAddress(),
        occupation: faker.person.jobTitle(),
        phoneNumber: faker.phone.number(),
        tribe: faker.helpers.arrayElement(['Yoruba', 'Hausa', 'Igbo', 'Fulani', 'Edo']),
        religion: faker.helpers.arrayElement(['Christianity', 'Islam', 'Traditional', 'Other'])
      }, { transaction });
    }

    console.log('Created users and their profiles');

    // Get all doctor and patient records from the database
    const doctorRecords = await DoctorModel.findAll({ transaction });
    const patientRecords = await PatientModel.findAll({ transaction });

    // Create time slots for doctors (3-7 per doctor)
    for (const doctor of doctorRecords) {
      const numTimeSlots = faker.number.int({ min: 3, max: 7 });
      for (let i = 0; i < numTimeSlots; i++) {
        const startHour = faker.number.int({ min: 8, max: 17 }); // 8 AM to 5 PM
        const startMinute = faker.helpers.arrayElement([0, 15, 30, 45]);
        const startDate = new Date();
        startDate.setHours(startHour, startMinute, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setHours(startHour + 1, startMinute, 0, 0);
        
        await TimeSlotModel.create({
          doctorId: doctor.id,
          startTime: startDate,
          endTime: endDate,
          isAvailable: true
        }, { transaction });
      }
    }

    console.log('Created time slots');

    // Create doctor-patient relationships and appointments
    for (const patient of patientRecords) {
      const numDoctors = faker.number.int({ min: 2, max: 4 });
      const selectedDoctors = faker.helpers.arrayElements(doctorRecords, numDoctors);

      for (const doctor of selectedDoctors) {
        const numAppointments = faker.number.int({ min: 5, max: 13 });
        for (let i = 0; i < numAppointments; i++) {
          const timeSlot = await TimeSlotModel.findOne({ 
            where: { doctorId: doctor.id },
            transaction 
          });
          if (timeSlot) {
            await AppointmentModel.create({
              doctorId: doctor.id,
              patientId: patient.id,
              timeslotId: timeSlot.id,
              date: faker.date.future(),
              reason: faker.lorem.sentence(),
              status: faker.helpers.arrayElement([
                AppointmentStatus.PENDING,
                AppointmentStatus.APPROVED,
                AppointmentStatus.CANCELED
              ])
            }, { transaction });
          }
        }
      }
    }

    console.log('Created appointments');

    // Create posts for doctors (3-31 per doctor)
    for (const doctor of doctorRecords) {
      const numPosts = faker.number.int({ min: 3, max: 31 });
      for (let i = 0; i < numPosts; i++) {
        await PostModel.create({
          doctorId: doctor.id,
          title: faker.lorem.sentence(),
          image: faker.image.url(),
          description: faker.lorem.paragraphs(3),
          likesCount: 0,
          status: 'ACTIVE'
        }, { transaction });
      }
    }

    console.log('Created posts');

    // Create comments on posts (2-10 comments per post)
    const posts = await PostModel.findAll({ transaction });
    for (const post of posts) {
      const numComments = faker.number.int({ min: 2, max: 10 });
      for (let i = 0; i < numComments; i++) {
        const commenter = faker.helpers.arrayElement(users);
        await CommentModel.create({
          postId: post.id,
          userId: commenter.id,
          content: faker.lorem.paragraph()
        }, { transaction });
      }
    }

    console.log('Created comments');

    // Create likes on posts (5-20 likes per post)
    for (const post of posts) {
      const numLikes = faker.number.int({ min: 5, max: 20 });
      const likers = faker.helpers.arrayElements(users, numLikes);
      for (const liker of likers) {
        await LikeModel.create({
          postId: post.id,
          userId: liker.id
        }, { transaction });
      }
      // Update post likes count
      await post.update({ likesCount: numLikes }, { transaction });
    }

    console.log('Created likes');

    // Create messages between doctors and patients
    for (const patient of patientRecords) {
      const selectedDoctors = faker.helpers.arrayElements(doctorRecords, faker.number.int({ min: 1, max: 3 }));
      
      for (const doctor of selectedDoctors) {
        const numMessages = faker.number.int({ min: 5, max: 15 });
        for (let i = 0; i < numMessages; i++) {
          const isFromDoctor = faker.datatype.boolean();
          await MessageModel.create({
            senderId: isFromDoctor ? doctor.userId : patient.userId,
            receiverId: isFromDoctor ? patient.userId : doctor.userId,
            content: faker.lorem.paragraph(),
            read: faker.datatype.boolean()
          }, { transaction });
        }
      }
    }

    console.log('Created messages');

    // Create notifications
    for (const user of users) {
      const numNotifications = faker.number.int({ min: 3, max: 10 });
      for (let i = 0; i < numNotifications; i++) {
        await NotificationModel.create({
          userId: user.id,
          message: faker.lorem.paragraph(),
          read: faker.datatype.boolean(),
          type: faker.helpers.arrayElement([
            NotificationType.MESSAGE,
            NotificationType.APPOINTMENT,
            NotificationType.PRESCRIPTION
          ]),
          referenceId: faker.string.uuid()
        }, { transaction });
      }
    }

    console.log('Created notifications');

    // Create vital signs for patients
    for (const patient of patientRecords) {
      const numRecords = faker.number.int({ min: 5, max: 15 });
      for (let i = 0; i < numRecords; i++) {
        const doctor = faker.helpers.arrayElement(doctorRecords);
        const appointment = await AppointmentModel.findOne({
          where: { patientId: patient.id, doctorId: doctor.id },
          transaction
        });
        if (appointment) {
          await VitalSignModel.create({
            patientId: patient.id,
            doctorId: doctor.id,
            appointmentId: appointment.id,
            weight: faker.number.float({ min: 40, max: 120, fractionDigits: 1 }),
            height: faker.number.float({ min: 150, max: 200, fractionDigits: 1 }),
            bloodPressure: `${faker.number.int({ min: 90, max: 140 })}/${faker.number.int({ min: 60, max: 90 })}`,
            pulse: faker.number.int({ min: 60, max: 100 }),
            respiratoryRate: faker.number.int({ min: 12, max: 20 }),
            temperature: faker.number.float({ min: 36.1, max: 37.2, fractionDigits: 1 })
          }, { transaction });
        }
      }
    }

    console.log('Created vital signs');

    // Create consultations
    for (const patient of patientRecords) {
      const numConsultations = faker.number.int({ min: 2, max: 8 });
      for (let i = 0; i < numConsultations; i++) {
        const appointment = await AppointmentModel.findOne({
          where: { patientId: patient.id },
          transaction
        });
        if (appointment) {
          await ConsultationModel.create({
            appointmentId: appointment.id,
            presentingComplaints: faker.lorem.paragraph(),
            pastHistory: faker.lorem.paragraph(),
            diagnosticImpression: faker.lorem.paragraph(),
            investigations: faker.lorem.paragraph(),
            treatment: faker.lorem.paragraph()
          }, { transaction });
        }
      }
    }

    console.log('Created consultations');

    // Create prescriptions
    const consultations = await ConsultationModel.findAll({ transaction });
    for (const consultation of consultations) {
      // Create prescription first
      const prescription = await PrescriptionModel.create({
        consultationId: consultation.id,
        instructions: faker.lorem.paragraph(),
        investigation: faker.lorem.paragraph(),
        medications: [] // Initialize with empty array
      }, { transaction });

      // Create medications for this prescription
      const numMedications = faker.number.int({ min: 1, max: 4 });
      for (let i = 0; i < numMedications; i++) {
        await MedicationModel.create({
          prescriptionId: prescription.id,
          name: faker.helpers.arrayElement(['Amoxicillin', 'Ibuprofen', 'Paracetamol', 'Omeprazole', 'Metformin']),
          dosage: faker.helpers.arrayElement(['500mg', '1000mg', '250mg']),
          frequency: faker.helpers.arrayElement([
            Frequency.ONCE_A_DAY,
            Frequency.TWICE_A_DAY,
            Frequency.THRICE_A_DAY
          ]),
          duration: faker.number.int({ min: 5, max: 14 })
        }, { transaction });
      }
    }

    console.log('Created prescriptions and medications');

    // Create calls
    for (const patient of patientRecords) {
      const numCalls = faker.number.int({ min: 1, max: 5 });
      for (let i = 0; i < numCalls; i++) {
        const doctor = faker.helpers.arrayElement(doctorRecords);
        const appointment = await AppointmentModel.findOne({
          where: { patientId: patient.id, doctorId: doctor.id },
          transaction
        });
        if (appointment) {
          await CallModel.create({
            doctorId: doctor.id,
            patientId: patient.id,
            appointmentId: appointment.id,
            status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'FAILED'])
          }, { transaction });
        }
      }
    }

    console.log('Created calls');
    
    // Commit the transaction
    await transaction.commit();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    console.error('Error seeding database:', error);
    throw error;
  }
};

export default seedDatabase; 