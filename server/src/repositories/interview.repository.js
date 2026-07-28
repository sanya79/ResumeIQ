import { InterviewSession } from "../models/InterviewSession.js";

export class InterviewRepository {
  async findByIdAndUser(id, userId) {
    return await InterviewSession.findOne({ _id: id, userId });
  }

  async findHistoryByUserId(userId) {
    return await InterviewSession.find({ userId, status: "completed" }).sort({ createdAt: -1 });
  }

  async createSession(sessionData) {
    const session = new InterviewSession(sessionData);
    return await session.save();
  }

  async save(sessionDoc) {
    return await sessionDoc.save();
  }
}

export default InterviewRepository;
