// import { where } from "sequelize"
import TokenDataSource from "../datasources/token.datasource";
import UserDataSource from "../datasources/user.datasource";
import { IFindUserQuery, IUser, IUserCreationBody, IUserDataSource } from "../interfaces/user.interfaces"
// import { raw } from "express"

class UserService {
  private userDataSource: UserDataSource;
  private tokenDataSource: TokenDataSource;
  constructor(userDataSource: UserDataSource, tokenDataSource: TokenDataSource) {
    this.userDataSource = userDataSource;
    this.tokenDataSource = tokenDataSource;
  }

  async getUserByField(record: Partial<IUser>): Promise<IUser | null> {
    try {
      console.log('Searching for user with criteria:', record);
      const query = { where: { ...record }, raw: true } as IFindUserQuery;
      const user = await this.userDataSource.fetchOne(query);
      console.log('User search result:', user ? 'Found' : 'Not found');
      return user;
    } catch (error) {
      console.error('Error in getUserByField:', error);
      throw error;
    }
  }

  async createUser(record: IUserCreationBody) {
    return this.userDataSource.create(record);
  }

  async updateRecord(
    searchBy: Partial<IUser>,
    record: Partial<IUser>
  ): Promise<void> {
    const query = { where: { ...searchBy } } as IFindUserQuery;
    await this.userDataSource.updateOne(query, record);
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      const user = await this.getUserByField({ id: userId });
      if (user) {
        await this.updateRecord({ id: userId }, { role });
      }
    } catch (error) {
      throw new Error("Failed to update user role.");
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      // Invalidate the token in your preferred way, such as deleting it from a token store or setting a flag in the database
    } catch (error) {
      throw new Error("Failed to log out.");
    }
  }

  async getUsers():Promise<IUser[]> {
    const query = {where:{},raw:true}
    return this.userDataSource.fetchAll(query)
  }
}

export default UserService