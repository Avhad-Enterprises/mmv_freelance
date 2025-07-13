import { favoritesDto } from "../dtos/favorites.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { FAVORITES_TABLE } from "../database/favorites.schema";

class reportservices {

  // Add favorite (project or freelancer)
  public async Insert(data: favoritesDto): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Data Invalid");
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
    return DB(T.FAVORITES_TABLE)
      .select(
        'user_id',
        'favorite_type',
        'favorite_freelancer_id',
        'updated_at'
      )
      .where({ is_deleted: false })
      .orderBy('created_at', 'desc');
  }

    // favorites projects details
  public getFavoriteProjectDetails = async (user_id: number): Promise<any[]> => {
    return await DB(T.FAVORITES_TABLE)
      .join(T.USERS_TABLE, `${T.FAVORITES_TABLE}.user_id`, '=', `${T.USERS_TABLE}.user_id`)
      .join(T.PROJECTS_TASK, `${T.FAVORITES_TABLE}.favorite_project_id`, '=', `${T.PROJECTS_TASK}.projects_task_id`)
      .where(`${T.FAVORITES_TABLE}.user_id`, user_id)
      .select(
        `${T.FAVORITES_TABLE}.favorite_project_id`,
        `${T.USERS_TABLE}.username`,
        `${T.USERS_TABLE}.email`,
        `${T.PROJECTS_TASK}.*`
      );
  }


}

export default reportservices;
