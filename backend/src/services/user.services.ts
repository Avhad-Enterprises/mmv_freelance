import { UsersDto } from "../dtos/users.dto";
import DB, { T } from "../database/index.schema";
import { Users } from '../interfaces/users.interface';
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import bcrypt from "bcrypt";
import crypto from 'crypto';
import jwt from "jsonwebtoken";
import { table } from "console";
import { sendResetEmail } from '../utils/emailer';
import { USERS_TABLE } from "../database/users.schema";
import { sendEmail } from '../utils/email.util';
import { InviteDTO } from "../dtos/admin_invites.dto";



class usersService {
  public async Insert(data: UsersDto): Promise<Users> {
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

  public async Login(email: string, password: string): Promise<Users & { token: string }> {
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

  public async update(user_id: number, data: Partial<UsersDto>): Promise<any> {
    if (!user_id) throw new HttpException(400, 'users ID is required');
    if (isEmpty(data)) throw new HttpException(400, 'Update data is empty');

    const updated = await DB(T.USERS_TABLE)
      .where({ user_id })
      .update(data)
      .returning('*');

    if (!updated || updated.length === 0) {
      throw new HttpException(404, 'user not found or not updated');
    }
    return updated[0];
  }

  public initiatePasswordReset = async (email: string): Promise<void> => {
    const user = await DB(T.USERS_TABLE).where({ email, is_active: true, is_banned: false, account_status: 1 }).first();
    console.log(user);
    if (!user) return; // silent on purpose

    const reset_token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await DB('users')
      .where({ user_id: user.user_id })
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
      .where({ user_id: user.user_id })
      .update({
        reset_token: null,
        password: hashedpassword,
        reset_token_expires: null,
        updated_at: DB.fn.now()
      });
  };
  public async getrolebyuser(user_id: number): Promise<any> {
    if (!user_id) throw new HttpException(400, "User ID is required");

    const user = await DB(T.USER_ROLES).where({ user_id }).first();
    if (!user) throw new HttpException(404, "User not found");

    return user;
  }
  public async insertrolefromuser(data: UsersDto): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "User data is empty");
    }
    const insertedUSER_ROLES = await DB(T.USER_ROLES).insert(data).returning("*");
    return insertedUSER_ROLES[0];
  }

  public async createInvite(data: InviteDTO) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    const invite = await DB(T.INVITATION_TABLE)
      .insert({
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        invited_by: data.invited_by || null,
        invite_token: token,
        expires_at: expiresAt,
      })
      .returning('*');

    await sendEmail({
      to: data.email,
      subject: 'Admin Invite - Freelyancer',
      html: `
        <h3>You're Invited!</h3>
        <p>Click below to accept your admin invite:</p>
        <a href="https://yourdomain.com/invite/verify?token=${token}">Accept Invitation</a>
        `,
    });
  }
}

export default usersService;
