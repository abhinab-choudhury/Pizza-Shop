import dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT || 5001,
};
export default config;
