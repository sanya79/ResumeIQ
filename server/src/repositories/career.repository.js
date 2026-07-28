import { CareerRoadmap } from "../models/CareerRoadmap.js";

export class CareerRepository {
  async findByIdAndUser(id, userId) {
    return await CareerRoadmap.findOne({ _id: id, userId });
  }

  async findLatestByResumeAndRole(resumeId, targetRole, userId) {
    return await CareerRoadmap.findOne({ resumeId, targetRole, userId }).sort({ createdAt: -1 });
  }

  async createRoadmap(roadmapData) {
    const roadmap = new CareerRoadmap(roadmapData);
    return await roadmap.save();
  }

  async save(roadmapDoc) {
    return await roadmapDoc.save();
  }
}

export default CareerRepository;
