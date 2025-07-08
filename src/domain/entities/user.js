const { Schema, Model } = require('../../misc/services/database');

const ROLES = ["ADMIN", "USER"];
const STATUS = ["ACTIVE", "INACTIVE", "DISABLED", "DELETED"];

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    middle_name: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, default: '' },
    role: { type: String, enum: ROLES },
    permissions: { type: [String], default: [] },
    auth_expires_at: { type: Date },
    signed_for_app_auth: { type: Date, default: Date.now },
    status: { type: String, default: "ACTIVE", enum: STATUS },
    last_password_update_timestamp: { type: Date, default: Date.now },
    last_login_timestamp: { type: Date, default: Date.now },
    deleted: { type: Boolean, default: false }
}, { timestamps: true, minimize: false });

module.exports = Model('User', UserSchema);
