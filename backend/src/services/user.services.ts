import { UserDto } from "../dtos/users.dto";
import DB, { T } from "../database/index.schema";
import { User } from '../interfaces/users.interface';
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import bcrypt from "bcrypt";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { table } from "console";
import { sendResetEmail } from '../utils/emailer';
import { USERS_TABLE } from "../database/users.schema";


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

  public initiatePasswordReset = async (email: string): Promise<void> => {
    const user = await DB(T.USERS_TABLE).where({ email,is_active: true, is_banned: false, account_status: 1}).first();
    console.log(user);
    if (!user) return; // silent on purpose

    const reset_token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await DB('users')
      .where({ users_id: user.users_id })
      .update({
        reset_token,
        reset_token_expires: expiresAt,
        updated_at: DB.fn.now()
      });

    const resetUrl = `${process.env.APP_URL}/reset-password?reset_token=${reset_token}`;
    console.log(resetUrl);

    await sendResetEmail(user.email, user.first_name ?? 'user', resetUrl);
  }

  public resetpassword = async (reset_token: string, password: string): Promise<void> => {
    const user = await DB('users')
      .where({ reset_token })
      .andWhere('reset_token_expires', '>', DB.fn.now())
      .first();

    if (!user) throw new Error('Invalid or expired reset token');

    const hashedpassword = await bcrypt.hash(password, 10);

    await DB('users')
      .where({ users_id: user.users_id })
      .update({
        reset_token: null,
        password: hashedpassword,
        reset_token_expires: null,
        updated_at: DB.fn.now()
      });
  };


}

export default usersService;
