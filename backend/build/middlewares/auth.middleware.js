"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const index_schema_1 = __importDefault(require("../database/index.schema"));
const authMiddleware = async (req, res, next) => {
    try {
        // const cookies = req.cookies;
        // if (cookies && cookies.Authorization) {
        //   const secret = process.env.JWT_SECRET;
        //   const verificationResponse = (await jwt.verify(cookies.Authorization, secret)) as DataStoredInToken;
        //   const userId = verificationResponse.id;
        //   const findUser = userModel.find(user => user.id === userId);
        //   if (findUser) {
        //     req.user = findUser;
        //     next();
        //   } else {
        //     next(new HttpException(401, 'Wrong authentication token'));
        //   }
        // } else {
        //   next(new HttpException(404, 'Authentication token missing'));
        // }
        if (req.path.includes('/superadmin/') || req.path.includes('/employee/employeelogin')) {
            await index_schema_1.default.raw("SET search_path TO public");
            return next();
        }
        const bearerHeader = req.headers['authorization'];
        if (bearerHeader) {
            const bearer = bearerHeader.split(' ');
            console.log(JSON.stringify(bearer));
            const bearerToken = bearer[1];
            console.log(bearerToken);
            if (bearerToken != 'null') {
                console.log("in if for null");
                const secret = process.env.JWT_SECRET;
                const verificationResponse = (await jsonwebtoken_1.default.verify(bearerToken, secret));
                if (verificationResponse) {
                    console.log(bearer[2]);
                    if (bearer[2] != null || bearer[2] != undefined) {
                        console.log(index_schema_1.default.raw("Hii SET search_path TO " + bearer[2]).toString());
                        await index_schema_1.default.raw("SET search_path TO " + bearer[2]);
                    }
                    else {
                        console.log("in public");
                        await index_schema_1.default.raw("SET search_path TO public");
                    }
                    next();
                }
                else {
                    next(new HttpException_1.default(401, 'UnAuthorized User'));
                }
            }
            else {
                console.log('inelse');
                await index_schema_1.default.raw("SET search_path TO " + bearer[2]);
                next();
            }
        }
        else {
            next(new HttpException_1.default(404, 'Authentication token missing'));
        }
    }
    catch (error) {
        next(new HttpException_1.default(401, 'Wrong authentication token'));
    }
};
exports.default = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map