import { CategoryDto } from "../dtos/category.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { CATEGORY } from "../database/category.schema";

class CategoryService {

    public async addtocategory(data: CategoryDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Category data is empty");
        }
        const insertedCategory = await DB(T.CATEGORY).insert(data).returning("*");
        return insertedCategory[0];
    }
    public async geteditcategorybyid(category_id: number): Promise<any> {
        if (!category_id) throw new HttpException(400, "Category ID is required");

        const category = await DB(T.CATEGORY).where({ category_id }).first();
        if (!category) throw new HttpException(404, "category not found");

        return category;
    }

    public async updatecategoryid(data: Partial<CategoryDto>): Promise<any> {

        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        const updated = await DB(T.CATEGORY)
            .where({ category_id: data.category_id })
            .update(data)
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Category not found or not updated");

        return updated[0];
    }
    public async SoftDeletecategory(data: Partial<CategoryDto>): Promise<any> {

        if (isEmpty(data)) throw new HttpException(400, "Data is required");

        const deleted = await DB(T.CATEGORY)
            .where({ category_id: data.category_id })
            .update(data)
            .returning("*");

        if (!deleted.length) throw new HttpException(404, "Category not found or not delete");

        return deleted[0];
    }
    public async getvideoeditingid(category_id: number): Promise<any> {
        if (!category_id) throw new HttpException(400, "Category ID is required");

        const category = await DB(T.CATEGORY).where({ category_id }).first();
        if (!category) throw new HttpException(404, "category not found");

        return category;
    }

    public async getprojectbycategoryid(categoryname: string): Promise<any> {
        if (!categoryname) {
            throw new HttpException(400, "Category name is required");
        }

        const category = await DB(T.CATEGORY)
            .select('value')
            .where('value', categoryname)
            .first();

        if (!category) {
            return [];
        }

        const categoryProjects = await DB(T.PROJECTS_TASK)
            .where('project_category', category.value)
            .andWhere('is_deleted', false)
            .andWhere('is_active', 1)
            .orderBy('created_at', 'desc')
            .select('*');

        return categoryProjects;
    }
    public async getprojectbyitscategoryidwith(categoryname: string): Promise<any[]> {
        if (!categoryname) {
            throw new HttpException(400, "Category name is required");
        }

        const category = await DB(T.CATEGORY)
            .select('value')
            .where('value', categoryname)
            .first();

        if (!category) {
            return [];
        }

        const categoryProjects = await DB(T.PROJECTS_TASK)
            .where('project_category', category.value)
            .andWhere('is_deleted', false)
            .andWhere('is_active', 1)
            .orderBy('created_at', 'desc')
            .select('*');

        return categoryProjects;
    }
}
export default CategoryService;