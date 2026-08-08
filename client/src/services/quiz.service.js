import api from "../api/axios";

class QuizService {

    getAll() {
        return api.get("/quizzes");
    }

    getOne(id) {
        return api.get(`/quizzes/${id}`);
    }

    create(data) {
        return api.post("/quizzes", data);
    }

    delete(id) {
        return api.delete(`/quizzes/${id}`);
    }
}

export default new QuizService();
