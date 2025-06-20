// import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from '../database/index.schema';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const isEmpty = (value: any): boolean => {
    if (value === null) {
        return true;
    } else if (typeof value !== 'number' && value === '') {
        return true;
    } else if (value === 'undefined' || value === undefined) {
        return true;
    } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
        return true;
    } else {
        return false;
    }
};

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

export const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});



