const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

class AuthService {

    async register(data) {

        const { username, email, password } = data;

        if (!username || !email || !password) {
            throw {
                status: 400,
                message: "Заполните все поля"
            };
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            }
        });

        if (existingUser) {
            throw {
                status: 400,
                message: "Пользователь уже существует"
            };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash
            }
        });

        return {
            message: "Пользователь зарегистрирован",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    }

    async login(data) {

        const { email, password } = data;

        if (!email || !password) {
            throw {
                status: 400,
                message: "Введите email и пароль"
            };
        }

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            throw {
                status: 404,
                message: "Пользователь не найден"
            };
        }

        const validPassword = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!validPassword) {
            throw {
                status: 401,
                message: "Неверный пароль"
            };
        }

        const token = generateToken(user);

        return {
            message: "Успешный вход",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        };
    }

}

module.exports = new AuthService();