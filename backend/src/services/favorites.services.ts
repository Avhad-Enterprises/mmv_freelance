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
        user_id: data.user_id
      })
      .first();

    if (existing) {
      throw new HttpException(409, "This freelancer is already in favorites");
    }

    const res = await DB(T.FAVORITES_TABLE).insert(data).returning("*");
    return res[0];
  }



  public async removeFavorite(dto: favoritesDto): Promise<string> {
    const { id } = dto;

    const deleted = await DB(T.FAVORITES_TABLE)
      .where({ id: id })
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
      .where({ user_id, is_active: true })
      .select("*");

    if (!favorites) throw new HttpException(404, "User not found");
    return favorites;
  }

  public async getfreelancefav(user_id: number): Promise<any[]> {
    if (!user_id || isNaN(user_id)) {
      throw new HttpException(400, "Invalid or missing user ID");
    }
    const result = await DB(T.USERS_TABLE)
      .join(T.FAVORITES_TABLE, `${T.USERS_TABLE}.user_id`, '=', `${T.FAVORITES_TABLE}.favorite_freelancer_id`)
      .select(
        `${T.USERS_TABLE}.username`,
        `${T.USERS_TABLE}.email`,
        `${T.USERS_TABLE}.skill`,
        `${T.USERS_TABLE}.city`,
        `${T.USERS_TABLE}.country`,
        `${T.FAVORITES_TABLE}.*`
      );

    return result;
  }

  public async getfreelanceinfo(user_id: number): Promise<any[]> {

    if (!user_id) {
      throw new HttpException(400, "User ID is required");
    }
    // const results = await DB(T.USERS_TABLE)
    //   .where({
    //     [`${T.USERS_TABLE}.user_id`]: user_id,
   
    //   })
    //   .join(
    //     `${T.FAVORITES_TABLE}`,
    //     `${T.USERS_TABLE}.user_id`,
    //     '=',
    //     `${T.FAVORITES_TABLE}.favorite_freelancer_id`
    //   )
    //   .select(
    //     `${T.FAVORITES_TABLE}.*`,
    //     `${T.USERS_TABLE}.username`,
    //     `${T.USERS_TABLE}.email`,
    //     `${T.USERS_TABLE}.skill`,
    //     `${T.USERS_TABLE}.city`,
    //     `${T.USERS_TABLE}.country`,
    //   );
    const results = await DB(T.FAVORITES_TABLE)
      .where({
        [`${T.FAVORITES_TABLE}.user_id`]: user_id,
        // [`${T.USERS_TABLE}.favorite_type`]: 'freelancer',
        // [`${T.USERS_TABLE}.is_deleted`]: false,
      })
      .join(
        `${T.USERS_TABLE}`,
        `${T.USERS_TABLE}.user_id`,
        '=',
        `${T.FAVORITES_TABLE}.id`
      )
      .select(
        `${T.FAVORITES_TABLE}.*`,
        `${T.USERS_TABLE}.username`,
        `${T.USERS_TABLE}.email`,
        `${T.USERS_TABLE}.skill`,
        `${T.USERS_TABLE}.city`,
        `${T.USERS_TABLE}.country`,
      );
    return results;
  }



}

export default favoritesservices;
