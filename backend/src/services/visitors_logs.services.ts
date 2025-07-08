import { VisitorLogDto } from "../dtos/visitor_logs.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";

 class VisitorService {
  public async logVisitor(data: any) {
    const [inserted] = await DB(T.VISITOR_LOGS).insert(data).returning('*');
    return inserted;
  }


  public async getVisitorStats() {
    const totalVisits = await DB('visitor_logs').count('id as count').first();
  
    const topPages = await DB(T.VISITOR_LOGS)
      .select('current_url')
      .count('id as views')
      .groupBy('current_url')
      .orderBy('views', 'desc')
      .limit(5);
  
    const totalCount = await DB('visitor_logs').count('id as count').first();
    const bounceRate = totalCount && totalCount.count
  
    const deviceDistribution = await DB(T.VISITOR_LOGS)
      .select('device_type')
      .count('id as count')
      .groupBy('device_type');
  
    const trafficSources = await DB(T.VISITOR_LOGS)
      .select('referrer_domain')
      .count('id as count')
      .groupBy('referrer_domain');
  
    return {
      totalVisits: totalVisits?.count ?? 0,
      topPages,
      deviceDistribution,
      trafficSources,
    };
  }
  
}

export default VisitorService;
