// index.ts
// Query your database using the Prisma Client

import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://39fdd5911ff5b086689e6aa1561d782c4ba3e781c288f0a5baf9253b92e13715:sk_ajIzKnPr2K_Pq9cJ1px3n@db.prisma.io:5432/postgres?sslmode=verify-full";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
  adapter,
  log: [
    { level: "query", emit: "stdout" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
    { level: "error", emit: "stdout" },
  ],
});

// Example query to create a user based on the example schema

export default prisma;
