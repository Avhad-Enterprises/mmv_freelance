import DB from "../database/index.schema";
import { CategoryDto } from "../dtos/category.dto";
import { NextFunction, Request, Response } from "express";
import CategoryService from "../services/category.service";
import HttpException from "../exceptions/HttpException";

class CategoryController {
    public CategoryService = new CategoryService();
    public addcategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categoryData: CategoryDto = req.body;
            const inserteddata = await this.CategoryService.addtocategory(categoryData);
            res.status(201).json({ data: inserteddata, message: "Inserted" });
        } catch (error) {
            next(error);
        }
    }
    public getallcategorysby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const category = await this.CategoryService.getallcategorysbytable();
            res.status(200).json({ data: category, success: true });
        } catch (err) {
            next(err);
        }
    };
    
    public getcategorytypesby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const type = req.body.type as string;
             if (!type) {
                throw new HttpException(400, "Category body is required");
            }
            const category = await this.CategoryService.getcategorytypesbytable(type);
            res.status(200).json({ data: category, success: true });
        } catch (err) {
            next(err);
        }

    };

    public geteditcategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categoryId = Number(req.params.id);
            const category = await this.CategoryService.geteditcategorybyid(categoryId);
            res.status(200).json({ data: category, message: "Category fetched" });
        } catch (error) {
            next(error);
        }
    };
    public updatecategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const categoryData: Partial<CategoryDto> = req.body;
            const updatecategory = await this.CategoryService.updatecategoryid(categoryData);
            res.status(200).json({ data: updatecategory, message: "Category updated" });
        } catch (error) {
            next(error);
        }
    };
    public deletecategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categorydata = req.body; //{'id}
            const deletedcategory = await this.CategoryService.SoftDeletecategory(categorydata);
            res.status(200).json({ data: deletedcategory, message: "category deleted" });
        } catch (error) {
            next(error);
        }
    };

    public getprojectbycategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const categoryname = req.params.id;

        if (!categoryname) {
            throw new HttpException(400, "Invalid Category");
        }

        try {
            const categoryProjects = await this.CategoryService.getprojectbycategoryid(categoryname);

            if (categoryProjects.length === 0) {
                res.status(200).json({
                    data: [],
                    message: `No projects found in the category "${categoryname}"`,
                });
                return;
            }

            res.status(200).json({
                data: categoryProjects,
                message: `Found projects in the category "${categoryname}"`,
            });
        } catch (error) {
            next(error);
        }
    };
    public getprojectbyitscategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const categoryname = req.query.category as string;

            if (!categoryname) {
                throw new HttpException(400, "Category query param is required");
            }
            const categoryProjects = await this.CategoryService.getprojectbyitscategoryidwith(categoryname);

            if (categoryProjects.length === 0) {
                res.status(200).json({
                    data: [],
                    message: `No projects found in the category "${categoryname}"`,
                });
                return;
            }
            res.status(200).json({
                data: categoryProjects,
                message: `Found projects in the category "${categoryname}"`,
            });
        } catch (error) {
            next(error);
        }
    };


    
};
export default CategoryController;
