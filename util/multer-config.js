const multer = require('multer')

exports.fileStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'images')
    },
    filename: (_req, file, cb) => {
        cb(null, new Date().toDateString() + '-' + file.originalname)
    }
})

exports.fileFilter = (_req, file, cb) => {
    const mime = file.mimetype
    if (mime === 'image/png' || mime === 'image/jpg' || mime === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}