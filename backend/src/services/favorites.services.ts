import { favoritesDto } from "../dtos/favorites.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { FAVORITES_TABLE } from "../database/favorites.schema";
import { application } from "express";

class favoritesservices {

  public async Insert(data: favoritesDto): Promise<any> {
  if (isEmpty(data)) {
    throw new HttpException(400, "Data Invalid");
  }
  const existing = await DB(T.FAVORITES_TABLE)
    .where({
      user_id: data.user_id,
      favorite_freelancer_id: data.favorite_freelancer_id,
      
    })
    .first();

  if (existing) {
    throw new HttpException(409, "This freelancer is already in favorites");
  }

  const res = await DB(T.FAVORITES_TABLE).insert(data).returning("*");
  return res[0];
}



  public async removeFavorite(dto: favoritesDto): Promise<string> {
    const { user_id, favorite_type, favorite_project_id, favorite_freelancer_id } = dto;

    const deleted = await DB(T.FAVORITES_TABLE)
      .where({
        user_id,
        favorite_type,
        favorite_project_id: favorite_type === 'project' ? favorite_project_id : null,
        favorite_freelancer_id: favorite_type === 'freelancer' ? favorite_freelancer_id : null,
      })
      .del();

    if (deleted === 0) {
      throw new Error('Favorite not found.');
    }

    return 'Removed from favorites';
  }

  public getAllprojects = async (): Promise<favoritesDto[]> => {
    try {
      const result = await DB(T.FAVORITES_TABLE)
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching blogs');
    }
  }

  public async getFavoriteFreelancers(): Promise<any[]> {
    const result = await DB(T.FAVORITES_TABLE)
      .select("*");
    return result;
  } catch(error) {
    throw new Error('Error fetching freelancers');
  }


  public async getProjectfavoritesby(userId: number): Promise<any[]> {
    if (!userId || isNaN(userId)) {
      throw new HttpException(400, "Invalid or missing user ID");
    }

    const result = await DB(T.FAVORITES_TABLE)
      .join('projects_task', 'favorites.favorite_project_id', 'projects_task.projects_task_id')
      .join('users', 'favorites.user_id', 'users.user_id')
      .where('favorites.user_id', userId)
      .andWhere('favorites.favorite_type', 'project')
      .andWhere('favorites.is_deleted', false)
      .andWhere('projects_task.is_deleted', false)
      .orderBy('favorites.created_at', 'desc')
      .select(
        'favorites.*',
        'projects_task.*',
        'users.user_id',
        'users.first_name',
        'users.last_name',
        'users.profile_picture'
      );

    return result;
  }

  public async getFavoritesByUser(user_id: number): Promise<any> {
    const favorites = await DB(T.FAVORITES_TABLE)
      .where({ user_id, is_active: 0 })
      .first();

    if (!favorites) throw new HttpException(404, "User not found");
    return favorites;
  }


}

export default favoritesservices;
