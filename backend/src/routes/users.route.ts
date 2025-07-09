import { Router } from 'express';
import Route from '../interfaces/route.interface';

import validationMiddleware from '../middlewares/validation.middleware';
import userController from '../controllers/users.controllers';
import { UserDto } from '../dtos/users.dto';

class usersRoute implements Route {

  public path = '/users';
  public router = Router();
  public usersController = new userController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //users section  , validationMiddleware(usersDto, 'body', false, [])
    this.router.post(`${this.path}/insertusers`, validationMiddleware(UserDto, 'body', false, []), this.usersController.insertusers);
    this.router.post(`${this.path}/login`, this.usersController.loginusers);
    this.router.put(`${this.path}/updateuserbyid`, this.usersController.updateuserById);
    this.router.put(`${this.path}/forget_password`, this.usersController.forgetpasswordusers);
    this.router.put(`${this.path}/reset_password`, this.usersController.reset_password);

  }
}


export default usersRoute;


// {
//   "first_name": "Ujala",
//   "last_name": "Gupta",
//   "username": "ujala",
//   "email": "ujala@gmail.com",
//   "phone_number": "9876543210",
//   "address_line_first": "123 Creative Street",
//   "password": "123456",
//   "niche": "WeddingFilm"
//   "role":"admin"
// }

// {
//     "email":"ujala@example.com",
//     "password":"YourSecurePassword123"
// }



//  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo5LCJmaXJzdF9uYW1lIjoiYWRpdHlhMiIsImxhc3RfbmFtZSI6Ikd1cHRhIiwidXNlcm5hbWUiOiJhZGl0eWEyIiwiZW1haWwiOiJhZGl0eWEyQGdtYWlsLmNvbSIsInBob25lX251bWJlciI6Ijk4NzY1NDMyMTAiLCJwcm9maWxlX3BpY3R1cmUiOm51bGwsImFkZHJlc3NfbGluZV9maXJzdCI6IjEyMyBDcmVhdGl2ZSBTdHJlZXQiLCJhZGRyZXNzX2xpbmVfc2Vjb25kIjpudWxsLCJjaXR5IjpudWxsLCJzdGF0ZSI6bnVsbCwiY291bnRyeSI6bnVsbCwicGluY29kZSI6bnVsbCwiYWFkaGFhcl92ZXJpZmljYXRpb24iOmZhbHNlLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicmVzZXRfdG9rZW4iOm51bGwsInJlc2V0X3Rva2VuX2V4cGlyZXMiOm51bGwsImxvZ2luX2F0dGVtcHRzIjowLCJreWNfdmVyaWZpZWQiOmZhbHNlLCJyb2xlIjoiY2xpZW50IiwiYmFubmVkX3JlYXNvbiI6bnVsbCwiYmlvIjpudWxsLCJ0aW1lem9uZSI6bnVsbCwibmljaGUiOiJXZWRkaW5nRmlsbSIsImFydHdvcmtzIjpudWxsLCJlbWFpbF9ub3RpZmljYXRpb25zIjpudWxsLCJ0YWdzIjp0cnVlLCJub3RlcyI6bnVsbCwiY2VydGlmaWNhdGlvbiI6bnVsbCwiZWR1Y2F0aW9uIjpudWxsLCJleHBlcmllbmNlIjpudWxsLCJzZXJ2aWNlcyI6bnVsbCwicHJldmlvdXNfd29ya3MiOm51bGwsInByb2plY3RzX2NyZWF0ZWQiOjAsInByb2plY3RzX2FwcGxpZWQiOjAsInByb2plY3RzX2NvbXBsZXRlZCI6MCwiaGlyZV9jb3VudCI6MCwicmV2aWV3X2lkIjowLCJ0b3RhbF9lYXJuaW5ncyI6MCwidG90YWxfc3BlbnQiOjAsInBheW1lbnRfbWV0aG9kIjpudWxsLCJwYXlvdXRfbWV0aG9kIjpudWxsLCJiYW5rX2FjY291bnRfaW5mbyI6bnVsbCwiYWNjb3VudF90eXBlIjpudWxsLCJhdmFpbGFiaWxpdHkiOm51bGwsInRpbWVfc3BlbnQiOjAsImFjY291bnRfc3RhdHVzIjoiMSIsImlzX2FjdGl2ZSI6dHJ1ZSwiaXNfYmFubmVkIjpmYWxzZSwiY3JlYXRlZF9hdCI6IjIwMjUtMDctMDlUMDU6Mjc6MDguNjQyWiIsInVwZGF0ZWRfYXQiOiIyMDI1LTA3LTA5VDA1OjI3OjA4LjY0MloiLCJ1cGRhdGVkX2J5IjpudWxsLCJsYXN0X2xvZ2luX2F0IjpudWxsLCJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUoxYzJWeVgybGtJam81TENKbGJXRnBiQ0k2SW1Ga2FYUjVZVEpBWjIxaGFXd3VZMjl0SWl3aVptbHljM1JmYm1GdFpTSTZJbUZrYVhSNVlUSWlMQ0pzWVhOMFgyNWhiV1VpT2lKSGRYQjBZU0lzSW5CeWIyWnBiR1ZmY0dsamRIVnlaU0k2Ym5Wc2JDd2ljbTlzWlNJNkltTnNhV1Z1ZENJc0ltbGhkQ0k2TVRjMU1qQXpPRGswTnl3aVpYaHdJam94TnpVeU1USTFNelEzZlEuc2h5bmc0Zm9XVk1kUEdvTEZqYjRwdDVHQmJoaVBqcl94SkRtYlF0SHFJdyIsImlhdCI6MTc1MjAzODk0NywiZXhwIjoxNzUyMTI1MzQ3fQ.6hzvOFl8hLRnc5u3SzsgQlYOvkN-BY2ZK9v57OL2Rs0




//  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo5LCJlbWFpbCI6ImFkaXR5YTJAZ21haWwuY29tIiwiZmlyc3RfbmFtZSI6ImFkaXR5YTIiLCJsYXN0X25hbWUiOiJHdXB0YSIsInByb2ZpbGVfcGljdHVyZSI6bnVsbCwicm9sZSI6ImNsaWVudCIsImlhdCI6MTc1MjAzODk0NywiZXhwIjoxNzUyMTI1MzQ3fQ.shyng4foWVMdPGoLFjb4pt5GBbhiPjr_xJDmbQtHqIw"