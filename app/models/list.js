let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        name: { type: String, required: false },
        owner: { type: Schema.Types.ObjectId, required: true },
        members: { type: [Schema.Types.ObjectId], required: true },
        items: { type: [Schema.Types.ObjectId], required: false }
    }
);

module.exports = mongoose.model('list', UserSchema);