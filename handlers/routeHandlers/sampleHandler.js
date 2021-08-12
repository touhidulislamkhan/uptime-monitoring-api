// depemdencies
//module scaffolding
const handle = {};

handle.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    callback(200, {
        message: 'This is a sample message to check.'
    })
}

module.exports = handle;