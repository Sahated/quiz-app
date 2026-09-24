import api from "../api/axios";

class RoomService {

    create(quizId) {
        return api.post("/rooms", {
            quizId: Number(quizId),
        });
    }

    join(code, nickname) {
        return api.post("/rooms/join", {
            code,
            nickname,
        });
    }

    getRoom(code) {
        return api.get(`/rooms/${code}`);
    }

    getPlayers(code) {
        return api.get(`/rooms/${code}/players`);
    }

    delete(id) {
        return api.delete(`/rooms/${id}`);
    }
}

export default new RoomService();
