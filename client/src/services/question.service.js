import api from "../api/axios";

class QuestionService {

    getAll(quizId) {
        return api.get(`/questions/quiz/${quizId}`);
    }

    create(data) {
        return api.post("/questions", data);
    }

    update(id, data) {
        return api.put(`/questions/${id}`, data);
    }

    delete(id) {
        return api.delete(`/questions/${id}`);
    }

}

export default new QuestionService();