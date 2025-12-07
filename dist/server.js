"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const db_1 = require("./config/db");
// Connect to Database
(0, db_1.connectDB)();
// Start the server
app_1.default.listen(config_1.PORT, () => {
    console.log(`Server is running on port ${config_1.PORT}`);
});
