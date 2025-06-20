"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const logger_1 = require("./utils/logger");
const auth_middleware_1 = __importDefault(require("./middlewares/auth.middleware"));
// import fileUpload from 'express-fileupload';
class App {
    constructor(routes) {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || 8000;
        this.env = process.env.NODE_ENV || 'development';
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeSwagger();
        this.initializeErrorHandling();
    }
    listen() {
        this.app.listen(this.port, () => {
            logger_1.logger.info(`🚀 App listening on the port ${this.port}. Current Env ${this.env}.`);
        });
    }
    getServer() {
        return this.app;
    }
    initializeMiddlewares() {
        // if (this.env === 'production') {
        //   this.app.use(morgan('combined', { stream }));
        //   //{ origin: 'your.domain.com', credentials: true }
        //   this.app.use(cors());
        // } else if (this.env === 'development') {
        //   this.app.use(morgan('dev', { stream }));
        //   this.app.use(cors({ origin: true, credentials: true }));
        // }
        if (this.env === 'production') {
            this.app.use((0, morgan_1.default)('combined', { stream: logger_1.stream }));
        }
        else if (this.env === 'development') {
            this.app.use((0, morgan_1.default)('dev', { stream: logger_1.stream }));
        }
        // Set CORS to allow all origins and allow credentials
        this.app.use((0, cors_1.default)({
            origin: '*',
            credentials: true,
        }));
        // this.app.use(fileUpload());
        this.app.use((0, hpp_1.default)());
        this.app.use((0, helmet_1.default)());
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '2gb' }));
        this.app.use(express_1.default.urlencoded({ limit: '2gb', extended: true }));
        this.app.use((0, cookie_parser_1.default)());
    }
    initializeRoutes(routes) {
        this.app.use('/api/v1/', auth_middleware_1.default);
        routes.forEach(route => {
            this.app.use('/api/v1/', route.router);
        });
    }
    initializeSwagger() {
        const options = {
            swaggerDefinition: {
                info: {
                    title: 'REST API',
                    version: '1.0.0',
                    description: 'Example docs',
                },
            },
            apis: [''],
        };
        // const specs = swaggerJSDoc(options);
        // this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    }
    initializeErrorHandling() {
        this.app.use(error_middleware_1.default);
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map