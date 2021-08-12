// depemdencies
//module scaffolding
const handle = {};

handle.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        message: 'Your Requested URL was not found!'
    })
}

module.exports = handle;