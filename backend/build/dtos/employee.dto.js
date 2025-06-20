"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeDto = void 0;
const class_validator_1 = require("class-validator");
class EmployeeDto {
}
exports.EmployeeDto = EmployeeDto;
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['insert'] }),
    (0, class_validator_1.IsInt)({ groups: ['update'] }),
    __metadata("design:type", Number)
], EmployeeDto.prototype, "employee_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['update'] }),
    (0, class_validator_1.IsString)({ groups: ['update', 'create'] }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "full_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['update', 'create'] }),
    (0, class_validator_1.IsString)({ groups: ['update', 'create'] }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "contact_no", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['update', 'create'] }),
    (0, class_validator_1.IsString)({ groups: ['update', 'create'] }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "email_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['update', 'create'] }),
    (0, class_validator_1.IsString)({ groups: ['update', 'create'] }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "employee_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['update', 'create'] }),
    (0, class_validator_1.IsString)({ groups: ['update', 'create'] }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['update', 'create'] }),
    (0, class_validator_1.IsString)({ groups: ['update', 'create'] }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "profile_pic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['update', 'create'] }),
    (0, class_validator_1.IsInt)({ groups: ['update', 'create'] }),
    __metadata("design:type", Number)
], EmployeeDto.prototype, "company_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['insert', 'update'] }),
    (0, class_validator_1.IsString)({ groups: ['update', 'create'] }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "token_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['insert', 'update'] }),
    (0, class_validator_1.IsBoolean)({ groups: ['insert', 'update'] }),
    __metadata("design:type", Boolean)
], EmployeeDto.prototype, "is_deleted", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['insert', 'update'] }),
    (0, class_validator_1.IsString)({ groups: ['update', 'create'] }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "user_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['insert', 'update'] }),
    (0, class_validator_1.IsBoolean)({ groups: ['insert', 'update'] }),
    __metadata("design:type", Boolean)
], EmployeeDto.prototype, "is_admin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['insert', 'update'] }),
    (0, class_validator_1.IsDecimal)(),
    __metadata("design:type", Number)
], EmployeeDto.prototype, "reliability_score", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ groups: ['insert', 'update'] }),
    (0, class_validator_1.IsString)({ groups: ['update', 'create'] }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "locations", void 0);
;
//# sourceMappingURL=employee.dto.js.map