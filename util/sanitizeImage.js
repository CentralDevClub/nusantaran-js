const sanitize = require('sanitize-filename')

module.exports = (oldPath) => {
    return 'images/' + sanitize(oldPath)
}