import { UsersDto } from "../dtos/users.dto";
import DB, { T } from "../database/index.schema";
import { Users } from "../interfaces/users.interface";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendEmail from '../utils/sendemail';
import validator from "validator";

class UsersService {

  public async getAllActiveCustomers(): Promise<Users[]> {
    const users = await DB(T.USERS_TABLE)
      .select("*")
      .where({
        account_type: "customer",
        is_active: true,
        is_banned: false,
      })
      .orderBy("created_at", "desc");


    return users;
  }


  public async getAllActiveFreelancers(): Promise<Users[]> {
    const users = await DB(T.USERS_TABLE)
      .select("*")
      .where({
        account_type: "freelancer",
        is_active: true,
        is_banned: false,
      })
      .orderBy("created_at", "desc");


    return users;
  }


  public async Insert(data: UsersDto): Promise<Users> {
    if (isEmpty(data)) throw new HttpException(400, "Data Invalid");
    const existingEmployee = await DB(T.USERS_TABLE)
      .where({ email: data.email })
      .first();
    if (existingEmployee)
      throw new HttpException(409, "Email already registered");


    if (data.username) {
      const existingUsername = await DB(T.USERS_TABLE)
        .where({ username: data.username })
        .first();


      if (existingUsername) {
        throw new HttpException(409, "Username already taken");
      }
    }


    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;
    const res = await DB(T.USERS_TABLE).insert(data).returning("*");
    return res[0];
  }


  public async Login(email: string, password: string): Promise<Users & { token: string }> {

    let user:any;

    if (validator.isEmail(email)) {
       user = await DB(T.USERS_TABLE).where({ email }).first();
    }
    else {
       user = await DB(T.USERS_TABLE).where({ username:email }).first();
    }
    
    if (!user) {
      throw new HttpException(404, "User not registered");
    }

    if (user.is_banned = false) {
      throw new HttpException(403, "Your account has been banned.");
    }

    if (!user.is_active) {
      throw new HttpException(403, "Your account is not active.");
    }

    const allowedaccountTypes = ['admin'];


    if (!allowedaccountTypes.includes(user.account_type)) {
      throw new HttpException(403, "Access denied for this account type");
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


  public async getById(user_id: number): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id, is_active: true, account_status: '1' }) // active user
      .first();


    if (!user) throw new HttpException(404, "User not found");
    return user;
  }


  public async updateById(data: UsersDto): Promise<Users> {
    if (!data.user_id) throw new HttpException(400, "User ID required for update");


    const user = await DB(T.USERS_TABLE)
      .where({ user_id: data.user_id })
      .first();


    if (!user) throw new HttpException(404, "User not found");


    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }


    const updated = await DB(T.USERS_TABLE)
      .where({ user_id: data.user_id })
      .update({ ...data, updated_at: new Date() })
      .returning("*");


    return updated[0];
  }


  public async softDelete(user_id: number): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ user_id })
      .first();


    if (!user) throw new HttpException(404, "User not found");


    const updated = await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        is_active: false,
        account_status: '0',
        updated_at: new Date()
      })
      .returning("*");


    return updated[0];
  }


  public async getUserByEmail(email: string): Promise<Users> {
    return await DB(T.USERS_TABLE).where({ email }).first();
  }


  public async saveResetToken(user_id: number, token: string, expires: Date): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        reset_token: token,
        reset_token_expires: expires,
      });
  }


  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await DB(T.USERS_TABLE)
      .where({ reset_token: token })
      .andWhere('reset_token_expires', '>', new Date())
      .first();


    if (!user) throw new HttpException(400, "Invalid or expired token");


    const hashed = await bcrypt.hash(newPassword, 10);


    await DB(T.USERS_TABLE)
      .where({ user_id: user.user_id })
      .update({
        password: hashed,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date(),
      });
  }


  private async getUserByType(user_id: number, account_type: string): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({
        user_id,
        account_type,
        account_status: '1',
        is_active: true,
        is_banned: false,
      })
      .first();


    if (!user) throw new HttpException(404, `${account_type} user not found`);
    return user;
  }


  public getFreelancerById(user_id: number): Promise<Users> {
    return this.getUserByType(user_id, 'freelancer');
  }


  public getClientById(user_id: number): Promise<Users> {
    return this.getUserByType(user_id, 'client');
  }


  public getCustomerById(user_id: number): Promise<Users> {
    return this.getUserByType(user_id, 'customer');
  }


  public getAdminById(user_id: number): Promise<Users> {
    return this.getUserByType(user_id, 'admin');
  }


  public async createUserInvitation(data: Record<string, any>): Promise<void> {
    const { email } = data;


    if (!email) throw new HttpException(400, "Email is required");


    const exists = await DB(T.USERS_TABLE).where({ email }).first();
    if (exists) throw new HttpException(409, "User already invited");


    await DB(T.USERS_TABLE).insert(data);

  }

  public async validateInvitation(email: string, token: string): Promise<void> {
    const invite = await DB(T.USERS_TABLE)
      .where({ email, invite_token: token, used: false })
      .andWhere('expires_at', '>', new Date())
      .first();


    if (!invite) {
      throw new HttpException(403, "Invalid or expired invitation token");
    }
  }


  public async getAllInvitations(): Promise<any[]> {
    const invitations = await DB(T.USERS_TABLE)
      .select('*')
      .orderBy('created_at', 'desc');


    return invitations;
  }


  public async login(email: string, password: string): Promise<Users & { token: string }> {
    if (!email || !password) {
      throw new HttpException(400, "Email and password are required");
    }
    const user = await DB(T.USERS_TABLE).where({ email }).first();
    if (!user) {
      throw new HttpException(404, "Email not registered");
    }
    if (user.is_banned = false) {
      throw new HttpException(403, "Your account has been banned.");
    }


    if (!user.is_active) {
      throw new HttpException(403, "Your account is not active.");
    }


    const allowedaccountTypes = ['freelancer', 'client'];
    if (!allowedaccountTypes.includes(user.account_type)) {
      throw new HttpException(403, "Access denied for this account type");
    }


    const ispasswordValid = await bcrypt.compare(password, user.password);
    if (!ispasswordValid) {
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
        is_banned: user.is_banned,
        is_active: user.is_active,
        account_type: user.account_type, 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );
    return {
      ...user,
      token,
    };

  }

  public async getfreelancerbyusername(username: string): Promise<any> {
    if (!username) throw new HttpException(400, "Username is required");

    const freelancer = await DB(T.USERS_TABLE)
      .where({ username, account_type: 'freelancer' })
      .first();

    if (!freelancer) throw new HttpException(404, "Freelancer not found");

    return freelancer;
  }

  public async createAdmin(data: UsersDto): Promise<Users> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Data Invalid");
    }

    if (!data.first_name || !data.username || !data.password || !data.phone_number) {
      throw new HttpException(400, "Missing required fields");
    }

    const existingEmail = await DB(T.USERS_TABLE)
      .where({ email: data.email })
      .first();

    if (existingEmail) {
      throw new HttpException(409, "Email already registered");
    }

    const existingUsername = await DB(T.USERS_TABLE)
      .where({ username: data.username })
      .first();

    if (existingUsername) {
      throw new HttpException(409, "Username already taken");
    }

    const adminData = {
      first_name: data.first_name,
      last_name: data.last_name || '',
      email: data.email || '',
      phone_number: data.phone_number,
      username: data.username,
      password: data.password,
      account_type: 'admin',
      account_status: 'inactive',
      created_at: Date.now(),
      updated_at: Date.now()
    } as unknown as UsersDto;

    return await this.Insert(adminData);
  }

  public async sendinvitation(data: UsersDto): Promise<{ message: string; invitation: any }> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Data Invalid");
    }

    const existingEmployee = await DB(T.USERS_TABLE)
      .where({ email: data.email })
      .first();

    if (existingEmployee) {
      throw new HttpException(409, "Email already registered");
    }

    const inviteToken = jwt.sign(
      { email: data.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    const invitationData = {
      full_name: `${data.first_name} ${data.last_name}`.trim(),
      email: data.email,
      token_hash: inviteToken,
      status: 'pending',
      account_type: data.account_type || 'admin',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      is_used: false,
      created_at: new Date()
    };

    const [newInvitation] = await DB(T.INVITATION_TABLE)
      .insert(invitationData)
      .returning("*");

    if (!newInvitation) {
      throw new HttpException(500, "Failed to create invitation");
    }

    return {
      message: "Invitation sent successfully",
      invitation: newInvitation
    };
  }

  public async insertAdminUser(userData: UsersDto): Promise<Users> {
    if (isEmpty(userData)) throw new HttpException(400, 'User data is empty');

    const email = String(userData.email).trim().toLowerCase();
    const username = String(userData.username).trim();

    const existingByEmail = await DB(T.USERS_TABLE).where({ email }).first();
    if (existingByEmail) throw new HttpException(409, `Email ${email} already exists`);

    const existingByUsername = await DB(T.USERS_TABLE).where({ username }).first();
    if (existingByUsername) throw new HttpException(409, `Username ${username} already exists`);

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const insertPayload = {
      first_name: userData.first_name?.trim(),
      last_name: userData.last_name?.trim() ?? null,
      username,
      email,
      phone_number: String(userData.phone_number).trim(),
      password: hashedPassword,
      account_type: 'admin',
      account_status: 'inactive',
    };

    const [newUser] = await DB(T.USERS_TABLE).insert(insertPayload).returning([
      'user_id',
      'first_name',
      'last_name',
      'username',
      'email',
      'phone_number',
      'account_type',
      'account_status',
      'created_at',
      'updated_at',
    ]);

    return newUser;

  }

  public async Insertsuser(data: UsersDto): Promise<Users> {
    if (isEmpty(data)) throw new HttpException(400, "Data Invalid");

    if (!data.first_name || !data.username || !data.password || !data.email || !data.phone_number) {
      throw new HttpException(400, "Missing required fields");
    }

    const existingEmployee = await DB(T.USERS_TABLE)
      .where({ email: data.email })
      .first();

    if (existingEmployee)
      throw new HttpException(409, "Email already registered");

    if (data.username) {
      const existingUsername = await DB(T.USERS_TABLE)
        .where({ username: data.username })
        .first();

      if (existingUsername) {
        throw new HttpException(409, "Username already taken");
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userData = {
      first_name: data.first_name.trim(),
      last_name: data.last_name?.trim() || null,
      email: data.email.trim().toLowerCase(),
      phone_number: data.phone_number.trim(),
      username: data.username.trim(),
      password: hashedPassword,
      account_type: 'admin',
      account_status: 'inactive',
      address_line_first: data.address_line_first || '',
      created_at: new Date(),
      updated_at: new Date()
    };

    const [newUser] = await DB(T.USERS_TABLE).insert(userData).returning("*");

    return newUser;
  }

  public async createUsersInvitation(data: { email: string; full_name?: string; invite_token: string; expires_at: Date; invited_by?: number }): Promise<void> {
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new HttpException(409, "Email is already registered");
    }

    await DB(T.USERS_TABLE).insert({
      email: data.email,
      first_name: data.full_name,
      invite_token: data.invite_token,
      invite_token_expires: data.expires_at,
      invited_by: data.invited_by,
      is_active: false,
      email_verified: false,
      created_at: new Date(),
    });
  }
  public async emailVerifyToken(data: UsersDto): Promise<Users> {
    if (isEmpty(data)) throw new HttpException(400, "Data Invalid");

    if (!data.first_name || !data.username || !data.password || !data.email || !data.phone_number) {
      throw new HttpException(400, "Missing required fields");
    }

    const existingEmployee = await DB(T.USERS_TABLE)
      .where({ email: data.email })
      .first();

    if (existingEmployee)
      throw new HttpException(409, "Email already registered");

    if (data.username) {
      const existingUsername = await DB(T.USERS_TABLE)
        .where({ username: data.username })
        .first();

      if (existingUsername) {
        throw new HttpException(409, "Username already taken");
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = jwt.sign(
      { email: data.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    const userData = {
      first_name: data.first_name.trim(),
      last_name: data.last_name?.trim() || null,
      email: data.email.trim().toLowerCase(),
      phone_number: data.phone_number.trim(),
      username: data.username.trim(),
      password: hashedPassword,
      account_type: 'admin',
      account_status: 'inactive',
      address_line_first: data.address_line_first || '',
      reset_token: verificationToken, // Using reset_token for email verification
      reset_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      created_at: new Date(),
      updated_at: new Date()
    };

    const [newUser] = await DB(T.USERS_TABLE).insert(userData).returning("*");

    // Send welcome email with verification link
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailHtml = `
      <h1>Welcome to Freelyancer!</h1>
      <p>Dear ${data.first_name},</p>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <p><strong>Username:</strong> ${data.username}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p>Please click the button below to verify your email address:</p>
      <p>
        <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationLink}</p>
      <p>This verification link will expire in 24 hours.</p>
      <p>If you did not create this account, please ignore this email.</p>
      <p>Best regards,<br>The Freelyancer Team</p>
    `;

    await sendEmail({
      to: data.email,
      subject: "Welcome to Freelyancer - Verify Your Email",
      html: emailHtml
    });

    return newUser;
  }
  
   public async saveLoginResetToken(user_id: number, token: string, expires: Date): Promise<void> {
    await DB(T.USERS_TABLE)
      .where({ user_id })
      .update({
        login_reset_token: token,
        login_reset_token_expires: expires,
        updated_at: new Date()
      });
  }

  public async validateLoginResetToken(token: string): Promise<Users> {
    const user = await DB(T.USERS_TABLE)
      .where({ login_reset_token: token })
      .andWhere('login_reset_token_expires', '>', new Date())
      .first();

    if (!user) {
      throw new HttpException(400, "Invalid or expired reset token");
    }

    return user;
  }

  public async resetLoginPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.validateLoginResetToken(token);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await DB(T.USERS_TABLE)
      .where({ user_id: user.user_id })
      .update({
        password: hashedPassword,
        login_reset_token: null,
        login_reset_token_expires: null,
        updated_at: new Date()
      });
  }
}
export default UsersService;
