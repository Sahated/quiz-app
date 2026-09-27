const prisma = require("../prisma");

class HistoryService {
    async getPlayerHistory(userId) {
        const history = await prisma.gameHistory.findMany({
            where: {
                userId: Number(userId)
            },
            orderBy: {
                playedAt: "desc"
            }
        });

        return history.map((item) => ({
            id: item.id,
            quizId: item.quizId,
            quizTitle: item.quizTitle,
            role: item.role,
            roomCode: item.roomCode,
            score: item.score,
            place: item.place,
            playedAt: item.playedAt
        }));
    }
}

module.exports = new HistoryService();
