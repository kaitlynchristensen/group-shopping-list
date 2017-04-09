let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true }
    }
);

module.exports = mongoose.model('user', UserSchema);