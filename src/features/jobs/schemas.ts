import { z } from "zod";

export const addJobSchema = z.object({
  workday_url: z
    .string()
    .min(1, "Paste a Workday job listing URL")
    .url("Enter a valid URL")
    .refine((v) => v.startsWith("http://") || v.startsWith("https://"), "Must be an HTTP or HTTPS URL"),
});
export type AddJobValues = z.infer<typeof addJobSchema>;
