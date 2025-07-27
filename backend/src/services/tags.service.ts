import { TagsDto } from "../dtos/tags.dto";
import { SkillsDto } from "../dtos/skill.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class TagsService {

    public async InsertTag(data: TagsDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Tag data is empty");
        }

        const insertedTag = await DB(T.TAGS_TABLE).insert(data).returning("*");
        return insertedTag[0];
    }

    public async GetTagsByType(type: string): Promise<any[]> {
        const tags = await DB(T.TAGS_TABLE)
            .where({ is_deleted: false, tag_type: type });
        return tags;
    }

    public async GetAllTags(): Promise<any[]> {
        const tags = await DB(T.TAGS_TABLE).where({ is_deleted: false });
        return tags;
    }

    public async insertskillsby(data: SkillsDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "skill data is empty");
        }

        const insertedskill = await DB(T.SKILLS).insert(data).returning("*");
        return insertedskill[0];
    }

    public getallskillsby = async (): Promise<SkillsDto[]> => {
           try {
             const result = await DB(T.SKILLS)
               .select("*");
             return result;
           } catch (error) {
             throw new Error('Error fetching SKILL');
           }
         } 

}

export default TagsService;
