import z from "zod";

export const userInfoValidation = z.string().trim().min(10).max(400);
