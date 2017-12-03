let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = new Schema(
    {
        list: { type: Schema.Types.ObjectId, required: true },
        description: { type: String, required: false },
        image: { type: Schema.Types.ObjectId, required: false },
        completed: { type: Boolean, required: true }
    }
);

module.exports = mongoose.model('item', UserSchema);