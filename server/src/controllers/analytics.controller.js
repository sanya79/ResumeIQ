import { buildAnalyticsOverview } from "../services/analytics.service.js";
import { sendSuccess } from "../utils/response.js";

export class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const overview = await buildAnalyticsOverview(req.user._id);
      return sendSuccess(res, "Dashboard analytics overview loaded.", { overview });
    } catch (error) {
      next(error);
    }
  }
}

export default AnalyticsController;
