const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.post(
    "/question",
    authMiddleware,
    upload.single("image"),
    (req, res) => {

        if (!req.file) {
            return res.status(400).json({
                message: "Изображение не загружено."
            });
        }

        const imageUrl =
            `/uploads/questions/${req.file.filename}`;

        res.status(201).json({
            message: "Изображение успешно загружено.",
            data: {
                imageUrl
            }
        });
    }
);

module.exports = router;
