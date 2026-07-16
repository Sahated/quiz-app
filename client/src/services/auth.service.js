import api from "../api/axios";

class AuthService {

    register(data) {
        return api.post("/auth/register", data);
    }

    login(data) {
        return api.post("/auth/login", data);
    }

}

export default new AuthService();