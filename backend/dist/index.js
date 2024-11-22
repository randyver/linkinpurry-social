"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware untuk parse JSON
app.use(express_1.default.json());
// Route dasar
app.get('/', (req, res) => {
    res.send('Hello World');
});
// Menjalankan server
app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
