import { JobMatch } from "../models/JobMatch.js";

export class MatchingRepository {
  async findByIdAndUser(id, userId) {
    return await JobMatch.findOne({ _id: id, userId });
  }

  async findHistoryByUserId(userId) {
    // Return all matched items for the user, newest first
    return await JobMatch.find({ userId }).sort({ createdAt: -1 });
  }

  async createMatch(matchData) {
    const match = new JobMatch(matchData);
    return await match.save();
  }

  async save(matchDoc) {
    return await matchDoc.save();
  }

  async delete(id, userId) {
    return await JobMatch.findOneAndDelete({ _id: id, userId });
  }
}

export default MatchingRepository;
