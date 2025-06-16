const dotenv = require("dotenv");

dotenv.config();

const envir = (process.env.MAILTRAP_USER) as string;

console.log(envir);
