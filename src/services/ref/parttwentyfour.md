Thank you for the feedback. Let's address all your concerns and provide a comprehensive update to the `appointment` and `notification` interfaces, data sources, services, and controllers. 

We'll ensure the following:
1. Add `fetchAll` methods in the interfaces, data sources, services, and controllers.
2. Include methods for approving and canceling appointments in the `AppointmentService`.
3. Create notifications when an appointment is created, approved, or canceled.

Here's a detailed implementation:

### Interfaces

#### appointment.interface.ts
```typescript
import { Model, Optional, Transaction } from "sequelize";

export interface IAppointment {
  id: string;
  userId: string;
  providerId: string;
  date: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFindAppointmentQuery {
  where: {
    [key: string]: any;
  };
  transaction?: Transaction;
  raw?: boolean;
}

export interface IAppointmentCreationBody
  extends Optional<IAppointment, "id" | "createdAt" | "updatedAt"> {}

export interface IAppointmentModel
  extends Model<IAppointment, IAppointmentCreationBody>,
    IAppointment {}

export interface IAppointmentDataSource {
  fetchOne(query: IFindAppointmentQuery): Promise<IAppointment | null>;
  fetchAll(query: IFindAppointmentQuery): Promise<IAppointment[]>;
  create(record: IAppointmentCreationBody, options?: Partial<IFindAppointmentQuery>): Promise<IAppointment>;
  updateOne(data: Partial<IAppointment>, query: IFindAppointmentQuery): Promise<void>;
}
```

#### Notification Interface
``` ts
// notification.interface.ts
import { Model, Optional, Transaction } from "sequelize";

export interface INotification {
  id: string;
  userId: string;
  appointmentId: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFindNotificationQuery {
  where: {
    [key: string]: any;
  };
  transaction?: Transaction;
  raw?: boolean;
}

export interface INotificationCreationBody
  extends Optional<INotification, "id" | "createdAt" | "updatedAt"> {}

export interface INotificationModel
  extends Model<INotification, INotificationCreationBody>,
    INotification {}

export interface INotificationDataSource {
  fetchOne(query: IFindNotificationQuery): Promise<INotification | null>;
  fetchAll(query: IFindNotificationQuery): Promise<INotification[]>;
  create(record: INotificationCreationBody, options?: Partial<IFindNotificationQuery>): Promise<INotification>;
  updateOne(data: Partial<INotification>, query: IFindNotificationQuery): Promise<void>;
}
```

### Data Sources

#### appointment.datasource.ts
```typescript
import { FindOptions } from "sequelize";
import {
  IFindAppointmentQuery,
  IAppointment,
  IAppointmentCreationBody,
  IAppointmentDataSource,
} from "../interfaces/appointment.interface";
import AppointmentModel from "../models/appointment.model";

class AppointmentDataSource implements IAppointmentDataSource {
  async create(
    record: IAppointmentCreationBody,
    options?: Partial<IFindAppointmentQuery>
  ): Promise<IAppointment> {
    return await AppointmentModel.create(record, {
      returning: true,
      ...options,
    });
  }

  async fetchOne(query: IFindAppointmentQuery): Promise<IAppointment | null> {
    return await AppointmentModel.findOne(query);
  }

  async fetchAll(query: FindOptions<IAppointment>): Promise<IAppointment[]> {
    return await AppointmentModel.findAll(query);
  }

  async updateOne(
    data: Partial<IAppointment>,
    query: IFindAppointmentQuery
  ): Promise<void> {
    await AppointmentModel.update(data, query);
  }
}

export default AppointmentDataSource;
```

#### Notification Datasource
``` ts
// notification.datasource.ts
import { FindOptions } from "sequelize";
import {
  IFindNotificationQuery,
  INotification,
  INotificationCreationBody,
  INotificationDataSource,
} from "../interfaces/notification.interface";
import NotificationModel from "../models/notification.model";

class NotificationDataSource implements INotificationDataSource {
  async create(
    record: INotificationCreationBody,
    options?: Partial<IFindNotificationQuery>
  ): Promise<INotification> {
    return await NotificationModel.create(record, {
      returning: true,
      ...options,
    });
  }

  async fetchOne(query: IFindNotificationQuery): Promise<INotification | null> {
    return await NotificationModel.findOne(query);
  }

  async fetchAll(query: FindOptions<INotification>): Promise<INotification[]> {
    return await NotificationModel.findAll(query);
  }

  async updateOne(
    data: Partial<INotification>,
    query: IFindNotificationQuery
  ): Promise<void> {
    await NotificationModel.update(data, query);
  }
}

export default NotificationDataSource;
```

### Services

#### appointment.service.ts
```typescript
import { autoInjectable } from "tsyringe";
import AppointmentDataSource from "../datasources/appointment.datasource";
import NotificationService from "../services/notification.service";
import {
  IFindAppointmentQuery,
  IAppointment,
  IAppointmentCreationBody,
} from "../interfaces/appointment.interface";
import { AppointmentStatus, NotificationStatus } from "../interfaces/enum/status.enum";

@autoInjectable()
class AppointmentService {
  private appointmentDataSource: AppointmentDataSource;
  private notificationService: NotificationService;

  constructor(
    _appointmentDataSource: AppointmentDataSource,
    _notificationService: NotificationService
  ) {
    this.appointmentDataSource = _appointmentDataSource;
    this.notificationService = _notificationService;
  }

  async fetchAppointmentById(id: string): Promise<IAppointment | null> {
    const query = {
      where: { id },
      raw: true,
    };
    return this.appointmentDataSource.fetchOne(query);
  }

  async fetchAllAppointments(query: IFindAppointmentQuery): Promise<IAppointment[]> {
    return this.appointmentDataSource.fetchAll(query);
  }

  async createAppointment(data: Partial<IAppointment>): Promise<IAppointment> {
    const appointment = {
      ...data,
      status: AppointmentStatus.PENDING,
    } as IAppointmentCreationBody;
    
    const createdAppointment = await this.appointmentDataSource.create(appointment);
    
    await this.notificationService.createNotification({
      userId: createdAppointment.userId,
      appointmentId: createdAppointment.id,
      message: "Your appointment has been created",
      status: NotificationStatus.UNREAD,
    });

    return createdAppointment;
  }

  async approveAppointment(appointmentId: string): Promise<void> {
    const filter = { where: { id: appointmentId } };
    const update = { status: AppointmentStatus.APPROVED };
    await this.appointmentDataSource.updateOne(update, filter);

    const appointment = await this.fetchAppointmentById(appointmentId);
    if (appointment) {
      await this.notificationService.createNotification({
        userId: appointment.userId,
        appointmentId: appointment.id,
        message: "Your appointment has been approved",
        status: NotificationStatus.UNREAD,
      });
    }
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    const filter = { where: { id: appointmentId } };
    const update = { status: AppointmentStatus.CANCELED };
    await this.appointmentDataSource.updateOne(update, filter);

    const appointment = await this.fetchAppointmentById(appointmentId);
    if (appointment) {
      await this.notificationService.createNotification({
        userId: appointment.userId,
        appointmentId: appointment.id,
        message: "Your appointment has been canceled",
        status: NotificationStatus.UNREAD,
      });
    }
  }
}

export default AppointmentService;
```

#### Notification Services
``` ts
// notification.service.ts
import { autoInjectable } from "tsyringe";
import NotificationDataSource from "../datasources/notification.datasource";
import {
  IFindNotificationQuery,
  INotification,
  INotificationCreationBody,
} from "../interfaces/notification.interface";

@autoInjectable()
class NotificationService {
  private notificationDataSource: NotificationDataSource;

  constructor(_notificationDataSource: NotificationDataSource) {
    this.notificationDataSource = _notificationDataSource;
  }

  async fetchNotificationById(id: string): Promise<INotification | null> {
    const query = {
      where: { id },
      raw: true,
    };
    return this.notificationDataSource.fetchOne(query);
  }

  async fetchAllNotifications(query: IFindNotificationQuery): Promise<INotification[]> {
    return this.notificationDataSource.fetchAll(query);
  }

  async createNotification(data: Partial<INotification>): Promise<INotification> {
    const notification = {
      ...data,
    } as INotificationCreationBody;
    return this.notificationDataSource.create(notification);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const filter = { where: { id: notificationId } };
    const update = { status: "READ" };
    await this.notificationDataSource.updateOne(update, filter);
  }
}

export default NotificationService;
```

### Controllers

#### appointment.controller.ts
```typescript
import { Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import sequelize from "../database";
import { ResponseCode } from "../interfaces/enum/code.enum";
import { IAppointment } from "../interfaces/appointment.interface";
import AppointmentService from "../services/appointment.service";
import Utility from "../utils/index.utils";

@autoInjectable()
class AppointmentController {
  private appointmentService: AppointmentService;

  constructor(_appointmentService: AppointmentService) {
    this.appointmentService = _appointmentService;
  }

  async createAppointment(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newAppointment = await this

.appointmentService.createAppointment(params);
      return Utility.handleSuccess(
        res,
        "Appointment created successfully",
        { appointment: newAppointment },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async approveAppointment(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      await this.appointmentService.approveAppointment(id);
      await transaction.commit();
      return Utility.handleSuccess(
        res,
        "Appointment approved successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      await transaction.rollback();
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async cancelAppointment(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      await this.appointmentService.cancelAppointment(id);
      await transaction.commit();
      return Utility.handleSuccess(
        res,
        "Appointment canceled successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      await transaction.rollback();
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getAppointmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentService.fetchAppointmentById(id);
      if (!appointment) {
        return Utility.handleError(
          res,
          "Appointment not found",
          ResponseCode.NOT_FOUND
        );
      }
      return Utility.handleSuccess(
        res,
        "Appointment fetched successfully",
        { appointment },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getAllAppointments(req: Request, res: Response) {
    try {
      const query = req.query;
      const appointments = await this.appointmentService.fetchAllAppointments(query);
      return Utility.handleSuccess(
        res,
        "Appointments fetched successfully",
        { appointments },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }
}

export default AppointmentController;
```

#### Notifications controller
// notification.controller.ts
``` typescript
import { Request, Response } from "express";
import { autoInjectable } from "tsyringe";
import { ResponseCode } from "../interfaces/enum/code.enum";
import NotificationService from "../services/notification.service";
import Utility from "../utils/index.utils";

@autoInjectable()
class NotificationController {
  private notificationService: NotificationService;

  constructor(_notificationService: NotificationService) {
    this.notificationService = _notificationService;
  }

  async createNotification(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newNotification = await this.notificationService.createNotification(params);
      return Utility.handleSuccess(
        res,
        "Notification created successfully",
        { notification: newNotification },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.notificationService.markAsRead(id);
      return Utility.handleSuccess(
        res,
        "Notification marked as read",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getNotificationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.fetchNotificationById(id);
      if (!notification) {
        return Utility.handleError(
          res,
          "Notification not found",
          ResponseCode.NOT_FOUND
        );
      }
      return Utility.handleSuccess(
        res,
        "Notification fetched successfully",
        { notification },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getAllNotifications(req: Request, res: Response) {
    try {
      const query = req.query;
      const notifications = await this.notificationService.fetchAll
```