import api from "../api/axios";

class QuizService {

    getAll() {
        return api.get("/quizzes");
    }

    create(data) {
        return api.post("/quizzes", data);
    }

    delete(id) {
        return api.delete(`/quizzes/${id}`);
    }
}

export default new QuizService();
