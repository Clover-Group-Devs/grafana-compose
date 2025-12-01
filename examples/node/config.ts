import dotenv from "dotenv";
dotenv.config();

export const config = {
  tempoUrl: process.env.TEMPO_URL,
  lokiUrl: process.env.LOKI_URL,
};
