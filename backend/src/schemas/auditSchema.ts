import { z } from "zod";

function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const dateStringSchema = z
  .string()
  .refine((val) => isValidCalendarDate(val), {
    message: "Format tanggal harus YYYY-MM-DD dan merupakan tanggal valid di kalender",
  });

export const auditQuerySchema = z
  .object({
    page: z
      .preprocess((val) => {
        if (val === undefined || val === "") return 1;
        const n = Number(val);
        return Number.isInteger(n) ? n : NaN;
      }, z.number().int("page harus berupa bilangan bulat").min(1, "page minimal 1"))
      .default(1),

    pageSize: z
      .preprocess((val) => {
        if (val === undefined || val === "") return 20;
        const n = Number(val);
        return Number.isInteger(n) ? n : NaN;
      }, z.number().int("pageSize harus berupa bilangan bulat").min(1, "pageSize minimal 1").max(100, "pageSize maksimal 100"))
      .default(20),

    action: z
      .string()
      .max(50, "action maksimal 50 karakter")
      .optional(),

    targetTable: z
      .string()
      .max(50, "targetTable maksimal 50 karakter")
      .optional(),

    targetId: z
      .preprocess((val) => {
        if (val === undefined || val === "") return undefined;
        const n = Number(val);
        return Number.isInteger(n) ? n : NaN;
      }, z.number().int("targetId harus bilangan bulat positif").min(1, "targetId harus bilangan bulat positif").optional()),

    userId: z
      .preprocess((val) => {
        if (val === undefined || val === "") return undefined;
        const n = Number(val);
        return Number.isInteger(n) ? n : NaN;
      }, z.number().int("userId harus bilangan bulat positif").min(1, "userId harus bilangan bulat positif").optional()),

    from: dateStringSchema.optional(),

    to: dateStringSchema.optional(),
  })
  .strict("Parameter query tidak dikenal")
  .superRefine((data, ctx) => {
    if (data.from && data.to && data.from > data.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["from"],
        message: "Parameter from tidak boleh lebih besar dari to",
      });
    }
  });

export type AuditQueryInput = z.infer<typeof auditQuerySchema>;

export const auditParamIdSchema = z.object({
  id: z.preprocess((val) => {
    const n = Number(val);
    return Number.isInteger(n) ? n : NaN;
  }, z.number().int().min(1, "ID audit log harus bilangan bulat positif")),
});
