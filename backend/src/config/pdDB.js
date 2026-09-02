"use strict";
// index.ts
// Query your database using the Prisma Client
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var client_1 = require("../generated/prisma/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var connectionString = process.env.DATABASE_URL ||
    "postgres://39fdd5911ff5b086689e6aa1561d782c4ba3e781c288f0a5baf9253b92e13715:sk_ajIzKnPr2K_Pq9cJ1px3n@db.prisma.io:5432/postgres?sslmode=verify-full";
var adapter = new adapter_pg_1.PrismaPg({ connectionString: connectionString });
var prisma = new client_1.PrismaClient({
    adapter: adapter,
    log: [
        { level: "query", emit: "stdout" },
        { level: "info", emit: "stdout" },
        { level: "warn", emit: "stdout" },
        { level: "error", emit: "stdout" },
    ],
});
// Example query to create a user based on the example schema
exports.default = prisma;
