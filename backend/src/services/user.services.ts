import { UserDto } from "../dtos/users.dto";
import DB, { T } from "../database/index.schema";
import { User } from '../interfaces/users.interface';
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { table } from "console";

class usersService {
  public async Insert(data: UserDto): Promise<User> {
    if (isEmpty(data)) throw new HttpException(400, "Data Invalid");
    const existingusers = await DB(T.USERS_TABLE)
      .where({ email: data.email })
      .first();
    if (existingusers)
      throw new HttpException(409, "Email already registered");
    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    const res = await DB(T.USERS_TABLE).insert(data).returning("*");
    return res[0];
  }

  public async Login(email: string, password: string): Promise<User & { token: string }> {
    if (!email || !password) {
      throw new HttpException(400, "Email and password are required");
    }
    const user = await DB(T.USERS_TABLE).where({ email }).first();
    if (!user) {
      throw new HttpException(404, "Email not registered");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(401, "Incorrect password");
    }
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture: user.profile_picture,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );
    return {
      ...user,
      token,
    };
  }

  public async update(users_id: number, data: Partial<UserDto>): Promise<any> {
    if (!users_id) throw new HttpException(400, 'users ID is required');
    if (isEmpty(data)) throw new HttpException(400, 'Update data is empty');

    const updated = await DB(T.USERS_TABLE)
      .where({ users_id })
      .update(data)
      .returning('*');

    if (!updated || updated.length === 0) {
      throw new HttpException(404, 'user not found or not updated');
    }
    return updated[0];
  }

}

export default usersService;
