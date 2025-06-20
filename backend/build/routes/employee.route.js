"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class EmployeeRoute {
    // public employeeController = new EmployeeController();
    constructor() {
        this.path = '/employee';
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        //Employee section
        // this.router.post(`${this.path}/insertemployee`, validationMiddleware(EmployeeDto, 'body', false, []), this.employeeController.insertEmployee);
        // this.router.post(`${this.path}/updateemployee`, validationMiddleware(EmployeeDto, 'body', false, []), this.employeeController.updateEmployee);
        // this.router.post(`${this.path}/updateemployeestatus`, validationMiddleware(EmployeeDto, 'body', false, []), this.employeeController.updateEmployeeStatus);
        // this.router.post(`${this.path}/updateemployee/status`, validationMiddleware(EmployeeDto, 'body', false, []), this.employeeController.updateEmployeeStatus);
        // this.router.get(`${this.path}/getemployeelist/:companyid/:column/:orderby/:search`, validationMiddleware(EmployeeDto, 'body', false, []), this.employeeController.getEmployeeList);
        // this.router.get(`${this.path}/getemployee/:employeeid`, validationMiddleware(EmployeeDto, 'body', false, []), this.employeeController.getEmployeeById);
        // this.router.post(`${this.path}/employeelogin`, validationMiddleware(EmployeeDto, 'body', false, []), this.employeeController.logIn);
        // this.router.get(`${this.path}/employeesearch/:companyid/:column/:orderby/:search/:offsetValue/:limit`, validationMiddleware(EmployeeDto, 'body', false, []), this.employeeController.getEmployeeSearch);
        // this.router.get(`${this.path}/getlastemployee/:companyid/:schemaname`, validationMiddleware(EmployeeDto, 'body', false, []), this.employeeController.GetLastEmployeeById);
        // this.router.post(`${this.path}/changepassword`, validationMiddleware(ForgotPasswordDto, 'body', false, []), this.employeeController.changePassword);
        // this.router.post(`${this.path}/resetPassword`, validationMiddleware(ForgotPasswordDto, 'body', false, []), this.employeeController.resetPassword);
        // this.router.post(`${this.path}/updateEmployeeAvailability`, this.employeeController.updateEmployeeAvailability);
        // this.router.post(`${this.path}/updateEmployeeAvailabilityBatch`, this.employeeController.updateEmployeeAvailabilityBatch);
        // this.router.post(`${this.path}/getAvailabilityData`, this.employeeController.getAvailabilityData);
        // this.router.post(`${this.path}/getUnassignedEmployees`, this.employeeController.getUnassignedEmployees);
        // //check emp available for that day
        // this.router.post(`${this.path}/showWeekdayAvaiblityStatustoEmp`, this.employeeController.showWeekdayAvaiblityStatustoEmp);
        // this.router.post(`${this.path}/showWeeklyAvailabilityStatusToAdmin`, this.employeeController.showWeeklyAvailabilityStatusToAdmin);
        // this.router.post(`${this.path}/InsertOrUpdateEmpPref`, this.employeeController.InsertOrUpdateEmpPref);
        // this.router.post(`${this.path}/getEmpAvailabilityPrefData`, this.employeeController.getEmpAvailabilityPrefData);
        // this.router.get(`${this.path}/getStartingWeekDate`, this.employeeController.getStartingWeekDate);
        // this.router.get(`${this.path}/getStartingWeekDateAssigned`, this.employeeController.getStartingWeekDateAssigned);
        // this.router.post(`${this.path}/updateOrInsertEmployeeHide`, this.employeeController.updateOrInsertEmployeeHide);
        // this.router.post(`${this.path}/unhideEmployee`, this.employeeController.unhideEmployee);
    }
}
exports.default = EmployeeRoute;
//# sourceMappingURL=employee.route.js.map