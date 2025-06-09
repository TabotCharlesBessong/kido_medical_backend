"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const index_1 = __importDefault(require("../index"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const doctor_model_1 = __importDefault(require("../../models/doctor.model"));
const patient_model_1 = __importDefault(require("../../models/patient.model"));
const timeslot_model_1 = __importDefault(require("../../models/timeslot.model"));
const appointment_model_1 = __importDefault(require("../../models/appointment.model"));
const post_model_1 = __importDefault(require("../../models/post.model"));
const comment_model_1 = __importDefault(require("../../models/comment.model"));
const like_model_1 = __importDefault(require("../../models/like.model"));
const message_model_1 = __importDefault(require("../../models/message.model"));
const notification_model_1 = __importDefault(require("../../models/notification.model"));
const vitalsign_model_1 = __importDefault(require("../../models/vitalsign.model"));
const consultation_model_1 = __importDefault(require("../../models/consultation.model"));
const prescription_model_1 = __importDefault(require("../../models/prescription.model"));
const medication_model_1 = __importDefault(require("../../models/medication.model"));
const call_model_1 = __importDefault(require("../../models/call.model"));
const sequelize_1 = require("sequelize");
const user_enum_1 = require("../../interfaces/enum/user.enum");
const patient_enum_1 = require("../../interfaces/enum/patient.enum");
const notification_enum_1 = require("../../interfaces/enum/notification.enum");
const doctor_enum_1 = require("../../interfaces/enum/doctor.enum");
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcrypt_1.default.genSalt(10);
    return yield bcrypt_1.default.hash(password, salt);
});
const seedDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Starting database seeding process...');
        console.log('Testing database connection...');
        try {
            yield index_1.default.authenticate();
            console.log('Database connection successful');
        }
        catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
        const transaction = yield index_1.default.transaction();
        try {
            console.log('Starting database seeding...');
            // Clear existing data
            console.log('Clearing existing data...');
            yield index_1.default.query('TRUNCATE TABLE "users" CASCADE', {
                type: sequelize_1.QueryTypes.RAW,
                transaction
            });
            console.log('Cleared existing data');
            // Create users (50 total: 10 doctors, 40 patients)
            console.log('Creating users...');
            const users = [];
            const doctors = [];
            const patients = [];
            // Create doctor users (all verified)
            console.log('Creating doctor users...');
            for (let i = 0; i < 10; i++) {
                const hashedPassword = yield hashPassword('Password#123');
                const user = yield user_model_1.default.create({
                    username: faker_1.faker.internet.username(),
                    email: faker_1.faker.internet.email(),
                    password: hashedPassword,
                    firstname: faker_1.faker.person.firstName(),
                    lastname: faker_1.faker.person.lastName(),
                    role: 'DOCTOR',
                    isEmailVerified: user_enum_1.EmailStatus.VERIFIED,
                    accountStatus: user_enum_1.AccountStatus.ACTIVE
                }, { transaction });
                users.push(user);
                doctors.push(user);
                // Create doctor profile immediately after user creation
                yield doctor_model_1.default.create({
                    userId: user.id,
                    specialization: faker_1.faker.helpers.arrayElement(['Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics']),
                    verificationStatus: 'APPROVED',
                    documents: faker_1.faker.image.url(),
                    language: faker_1.faker.helpers.arrayElements(['English', 'French', 'Spanish', 'Arabic'], { min: 1, max: 3 }),
                    fee: faker_1.faker.number.float({ min: 50, max: 200, fractionDigits: 2 }),
                    experience: faker_1.faker.number.int({ min: 1, max: 30 })
                }, { transaction });
            }
            console.log('Created doctor users and profiles');
            // Create admin user
            const adminPassword = yield hashPassword('Admin#123');
            const adminUser = yield user_model_1.default.create({
                username: 'charlesbessong',
                email: 'charlesbessongtabot@gmail.com',
                password: adminPassword,
                firstname: 'Charles',
                lastname: 'Bessong',
                role: 'ADMIN',
                isEmailVerified: user_enum_1.EmailStatus.VERIFIED,
                accountStatus: user_enum_1.AccountStatus.ACTIVE
            }, { transaction });
            users.push(adminUser);
            // Create patient users (35 verified, 5 unverified)
            console.log('Creating patient users...');
            for (let i = 0; i < 40; i++) {
                const hashedPassword = yield hashPassword('Password#123');
                const user = yield user_model_1.default.create({
                    username: faker_1.faker.internet.username(),
                    email: faker_1.faker.internet.email(),
                    password: hashedPassword,
                    firstname: faker_1.faker.person.firstName(),
                    lastname: faker_1.faker.person.lastName(),
                    role: 'PATIENT',
                    isEmailVerified: i < 35 ? user_enum_1.EmailStatus.VERIFIED : user_enum_1.EmailStatus.NOT_VERIFIED,
                    accountStatus: user_enum_1.AccountStatus.ACTIVE
                }, { transaction });
                users.push(user);
                patients.push(user);
                // Create patient profile immediately after user creation
                yield patient_model_1.default.create({
                    userId: user.id,
                    gender: faker_1.faker.helpers.arrayElement(['MALE', 'FEMALE', 'OTHER']),
                    age: faker_1.faker.number.int({ min: 1, max: 80 }),
                    address1: faker_1.faker.location.streetAddress(),
                    address2: faker_1.faker.location.secondaryAddress(),
                    occupation: faker_1.faker.person.jobTitle(),
                    phoneNumber: faker_1.faker.phone.number(),
                    tribe: faker_1.faker.helpers.arrayElement(['Yoruba', 'Hausa', 'Igbo', 'Fulani', 'Edo']),
                    religion: faker_1.faker.helpers.arrayElement(['Christianity', 'Islam', 'Traditional', 'Other'])
                }, { transaction });
            }
            console.log('Created patient users and profiles');
            // Get all doctor and patient records from the database
            console.log('Fetching doctor and patient records...');
            const doctorRecords = yield doctor_model_1.default.findAll({ transaction });
            const patientRecords = yield patient_model_1.default.findAll({ transaction });
            console.log(`Found ${doctorRecords.length} doctors and ${patientRecords.length} patients`);
            // Create time slots for doctors (3-7 per doctor)
            console.log('Creating time slots...');
            for (const doctor of doctorRecords) {
                const numTimeSlots = faker_1.faker.number.int({ min: 3, max: 7 });
                for (let i = 0; i < numTimeSlots; i++) {
                    const startHour = faker_1.faker.number.int({ min: 8, max: 17 }); // 8 AM to 5 PM
                    const startMinute = faker_1.faker.helpers.arrayElement([0, 15, 30, 45]);
                    const startDate = new Date();
                    startDate.setHours(startHour, startMinute, 0, 0);
                    const endDate = new Date(startDate);
                    endDate.setHours(startHour + 1, startMinute, 0, 0);
                    yield timeslot_model_1.default.create({
                        doctorId: doctor.id,
                        startTime: startDate,
                        endTime: endDate,
                        isAvailable: true
                    }, { transaction });
                }
            }
            console.log('Created time slots');
            // Create doctor-patient relationships and appointments
            console.log('Creating appointments...');
            for (const patient of patientRecords) {
                const numDoctors = faker_1.faker.number.int({ min: 2, max: 4 });
                const selectedDoctors = faker_1.faker.helpers.arrayElements(doctorRecords, numDoctors);
                for (const doctor of selectedDoctors) {
                    const numAppointments = faker_1.faker.number.int({ min: 5, max: 13 });
                    for (let i = 0; i < numAppointments; i++) {
                        const timeSlot = yield timeslot_model_1.default.findOne({
                            where: { doctorId: doctor.id },
                            transaction
                        });
                        if (timeSlot) {
                            yield appointment_model_1.default.create({
                                doctorId: doctor.id,
                                patientId: patient.id,
                                timeslotId: timeSlot.id,
                                date: faker_1.faker.date.future(),
                                reason: faker_1.faker.lorem.sentence(),
                                status: faker_1.faker.helpers.arrayElement([
                                    patient_enum_1.AppointmentStatus.PENDING,
                                    patient_enum_1.AppointmentStatus.APPROVED,
                                    patient_enum_1.AppointmentStatus.CANCELED
                                ])
                            }, { transaction });
                        }
                    }
                }
            }
            console.log('Created appointments');
            // Create posts for doctors (3-31 per doctor)
            console.log('Creating posts...');
            for (const doctor of doctorRecords) {
                const numPosts = faker_1.faker.number.int({ min: 3, max: 31 });
                for (let i = 0; i < numPosts; i++) {
                    yield post_model_1.default.create({
                        doctorId: doctor.id,
                        title: faker_1.faker.lorem.sentence(),
                        image: faker_1.faker.image.url(),
                        description: faker_1.faker.lorem.paragraphs(3),
                        likesCount: 0,
                        status: 'ACTIVE'
                    }, { transaction });
                }
            }
            console.log('Created posts');
            // Create comments on posts (2-10 comments per post)
            console.log('Creating comments...');
            const posts = yield post_model_1.default.findAll({ transaction });
            for (const post of posts) {
                const numComments = faker_1.faker.number.int({ min: 2, max: 10 });
                for (let i = 0; i < numComments; i++) {
                    const commenter = faker_1.faker.helpers.arrayElement(users);
                    yield comment_model_1.default.create({
                        postId: post.id,
                        userId: commenter.id,
                        content: faker_1.faker.lorem.paragraph()
                    }, { transaction });
                }
            }
            console.log('Created comments');
            // Create likes on posts (5-20 likes per post)
            console.log('Creating likes...');
            for (const post of posts) {
                const numLikes = faker_1.faker.number.int({ min: 5, max: 20 });
                const likers = faker_1.faker.helpers.arrayElements(users, numLikes);
                for (const liker of likers) {
                    yield like_model_1.default.create({
                        postId: post.id,
                        userId: liker.id
                    }, { transaction });
                }
                // Update post likes count
                yield post.update({ likesCount: numLikes }, { transaction });
            }
            console.log('Created likes');
            // Create messages between doctors and patients
            console.log('Creating messages...');
            for (const patient of patientRecords) {
                const selectedDoctors = faker_1.faker.helpers.arrayElements(doctorRecords, faker_1.faker.number.int({ min: 1, max: 3 }));
                for (const doctor of selectedDoctors) {
                    const numMessages = faker_1.faker.number.int({ min: 5, max: 15 });
                    for (let i = 0; i < numMessages; i++) {
                        const isFromDoctor = faker_1.faker.datatype.boolean();
                        yield message_model_1.default.create({
                            senderId: isFromDoctor ? doctor.userId : patient.userId,
                            receiverId: isFromDoctor ? patient.userId : doctor.userId,
                            content: faker_1.faker.lorem.paragraph(),
                            read: faker_1.faker.datatype.boolean()
                        }, { transaction });
                    }
                }
            }
            console.log('Created messages');
            // Create notifications
            console.log('Creating notifications...');
            for (const user of users) {
                const numNotifications = faker_1.faker.number.int({ min: 3, max: 10 });
                for (let i = 0; i < numNotifications; i++) {
                    yield notification_model_1.default.create({
                        userId: user.id,
                        message: faker_1.faker.lorem.paragraph(),
                        read: faker_1.faker.datatype.boolean(),
                        type: faker_1.faker.helpers.arrayElement([
                            notification_enum_1.NotificationType.MESSAGE,
                            notification_enum_1.NotificationType.APPOINTMENT,
                            notification_enum_1.NotificationType.PRESCRIPTION
                        ]),
                        referenceId: faker_1.faker.string.uuid()
                    }, { transaction });
                }
            }
            console.log('Created notifications');
            // Create vital signs for patients
            console.log('Creating vital signs...');
            for (const patient of patientRecords) {
                const numRecords = faker_1.faker.number.int({ min: 5, max: 15 });
                for (let i = 0; i < numRecords; i++) {
                    const doctor = faker_1.faker.helpers.arrayElement(doctorRecords);
                    const appointment = yield appointment_model_1.default.findOne({
                        where: { patientId: patient.id, doctorId: doctor.id },
                        transaction
                    });
                    if (appointment) {
                        yield vitalsign_model_1.default.create({
                            patientId: patient.id,
                            doctorId: doctor.id,
                            appointmentId: appointment.id,
                            weight: faker_1.faker.number.float({ min: 40, max: 120, fractionDigits: 1 }),
                            height: faker_1.faker.number.float({ min: 150, max: 200, fractionDigits: 1 }),
                            bloodPressure: `${faker_1.faker.number.int({ min: 90, max: 140 })}/${faker_1.faker.number.int({ min: 60, max: 90 })}`,
                            pulse: faker_1.faker.number.int({ min: 60, max: 100 }),
                            respiratoryRate: faker_1.faker.number.int({ min: 12, max: 20 }),
                            temperature: faker_1.faker.number.float({ min: 36.1, max: 37.2, fractionDigits: 1 })
                        }, { transaction });
                    }
                }
            }
            console.log('Created vital signs');
            // Create consultations
            console.log('Creating consultations...');
            for (const patient of patientRecords) {
                const numConsultations = faker_1.faker.number.int({ min: 2, max: 8 });
                for (let i = 0; i < numConsultations; i++) {
                    const appointment = yield appointment_model_1.default.findOne({
                        where: { patientId: patient.id },
                        transaction
                    });
                    if (appointment) {
                        yield consultation_model_1.default.create({
                            appointmentId: appointment.id,
                            presentingComplaints: faker_1.faker.lorem.paragraph(),
                            pastHistory: faker_1.faker.lorem.paragraph(),
                            diagnosticImpression: faker_1.faker.lorem.paragraph(),
                            investigations: faker_1.faker.lorem.paragraph(),
                            treatment: faker_1.faker.lorem.paragraph()
                        }, { transaction });
                    }
                }
            }
            console.log('Created consultations');
            // Create prescriptions with medications
            console.log('Creating prescriptions and medications...');
            const consultations = yield consultation_model_1.default.findAll({ transaction });
            for (const consultation of consultations) {
                // Create prescription for each consultation
                const prescriptionData = {
                    consultationId: consultation.id,
                    instructions: faker_1.faker.lorem.sentence(),
                    investigation: faker_1.faker.lorem.sentence()
                };
                const prescription = yield prescription_model_1.default.create(prescriptionData, {
                    transaction,
                    returning: true
                });
                // Create 1-3 medications for each prescription
                const numMedications = faker_1.faker.number.int({ min: 1, max: 3 });
                const medications = [];
                for (let i = 0; i < numMedications; i++) {
                    medications.push({
                        prescriptionId: prescription.id,
                        name: faker_1.faker.helpers.arrayElement([
                            'Amoxicillin',
                            'Paracetamol',
                            'Ibuprofen',
                            'Omeprazole',
                            'Metformin',
                            'Amlodipine',
                            'Atorvastatin',
                            'Metoprolol'
                        ]),
                        dosage: faker_1.faker.helpers.arrayElement(['250mg', '500mg', '650mg', '1000mg']),
                        frequency: faker_1.faker.helpers.arrayElement([
                            doctor_enum_1.Frequency.ONCE_A_DAY,
                            doctor_enum_1.Frequency.TWICE_A_DAY,
                            doctor_enum_1.Frequency.THRICE_A_DAY
                        ]),
                        duration: faker_1.faker.number.int({ min: 3, max: 14 })
                    });
                }
                // Create medications in bulk
                yield medication_model_1.default.bulkCreate(medications, {
                    transaction,
                    returning: true,
                    validate: true
                });
            }
            console.log('Created prescriptions and medications');
            // Create calls
            console.log('Creating calls...');
            for (const patient of patientRecords) {
                const numCalls = faker_1.faker.number.int({ min: 1, max: 5 });
                for (let i = 0; i < numCalls; i++) {
                    const doctor = faker_1.faker.helpers.arrayElement(doctorRecords);
                    const appointment = yield appointment_model_1.default.findOne({
                        where: { patientId: patient.id, doctorId: doctor.id },
                        transaction
                    });
                    if (appointment) {
                        yield call_model_1.default.create({
                            doctorId: doctor.id,
                            patientId: patient.id,
                            appointmentId: appointment.id,
                            status: faker_1.faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'FAILED'])
                        }, { transaction });
                    }
                }
            }
            console.log('Created calls');
            // Commit the transaction
            console.log('Committing transaction...');
            yield transaction.commit();
            console.log('Database seeding completed successfully!');
        }
        catch (error) {
            // Rollback the transaction in case of error
            console.error('Error during seeding:', error);
            yield transaction.rollback();
            console.error('Transaction rolled back due to error');
            throw error;
        }
    }
    catch (error) {
        console.error('Fatal error during seeding process:', error);
        process.exit(1);
    }
});
// Execute the seeder
seedDatabase().catch(error => {
    console.error('Unhandled error during seeding:', error);
    process.exit(1);
});
exports.default = seedDatabase;
