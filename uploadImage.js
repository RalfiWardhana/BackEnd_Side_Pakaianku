const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname.replace(/\s/g, ""));
    },
});

const fileFilter = function (req, file, cb) {

    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = {
            message: "Only image files are allowed!",
        };
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};

const sizeInMB = 10;
const maxSize = sizeInMB * 1024 * 1024;

exports.upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: maxSize,
    },
})
