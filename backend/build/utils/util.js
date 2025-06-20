"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadvideo = exports.uploadS3 = exports.s3 = exports.isEmpty = void 0;
// import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from '../database/index.schema';
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer = require('multer');
var multerS3 = require('multer-s3');
dotenv_1.default.config();
const isEmpty = (value) => {
    if (value === null) {
        return true;
    }
    else if (typeof value !== 'number' && value === '') {
        return true;
    }
    else if (value === 'undefined' || value === undefined) {
        return true;
    }
    else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
        return true;
    }
    else {
        return false;
    }
};
exports.isEmpty = isEmpty;
// export const cleanObj = (input: any, allowedKeys: string[] = []) => {
//   return Object.keys(input)
//     .filter(key => allowedKeys.includes(key))
//     .reduce((obj, key) => {
//       obj[key] = input[key];
//       return obj;
//     }, {});
// };
// export const uploadToAws = async (name: string, base64String: string) => {
//   const s3 = new AWS.S3({
//     accessKeyId: AWS_ID,
//     secretAccessKey: AWS_SECRET,
//   });
//   const extension = base64String.split(';')[0].split('/')[1];
//   const buffer = Buffer.from(base64String.replace(/^data:image\/\w+;base64,/, ''), 'base64');
//   const params1 = {
//     Bucket: AWS_BUCKET_NAME,
//     Key: name + '.' + extension, // File name you want to save as in S3
//     Body: buffer,
//     ContentEncoding: 'base64',
//     ContentType: 'image/png',
//     ACL: 'public-read',
//   };
//   const response: any = await new Promise((resolve, reject) => {
//     s3.upload(params1, (err, data) => (err == null ? resolve(data) : reject(err)));
//   });
//   return response;
// };
exports.s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});
exports.uploadS3 = multer({
    storage: multerS3({
        s3: exports.s3,
        bucket: process.env.AWS_BUCKET_NAME,
        // Set public read permissions
        acl: 'public-read',
        // Auto detect contet type
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        // Set key/ filename as original uploaded name
        key: function (req, file, cb) {
            cb(null, file.originalname);
            console.log("in upload s3", file);
        }
    }),
    limits: { fileSize: 500 * 1024 * 1024 }, // 50 MB file size limit
});
exports.uploadvideo = multer({
    storage: multerS3({
        s3: exports.s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read', // Public access
        contentType: multerS3.AUTO_CONTENT_TYPE, // Auto-detect MIME type
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const uniqueName = `${Date.now()}_${file.originalname}`;
            cb(null, uniqueName); // Unique filenames
        },
    }),
    limits: { fileSize: 2000 * 1024 * 1024 }, // Increase limit to 2 GB for video files
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/mpeg',
            'video/avi',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    },
});
//# sourceMappingURL=util.js.map