let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
        listsIsMemberOf: { type: [Schema.Types.ObjectId], required: false },
        listsOwned: { type: [Schema.Types.ObjectId], required: false }
    }
);

module.exports = mongoose.model('user', UserSchema);