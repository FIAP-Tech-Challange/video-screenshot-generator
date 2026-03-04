import "reflect-metadata";
import { DataSource } from "typeorm";

console.log(process.env.DB_URL);

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DB_URL,
    synchronize: false,
    logging: process.env.DB_LOGGING === "true",
    entities: [],
    migrations: ["src/migration/*.ts"],
});
