import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const questionnaireSubmissions = sqliteTable(
  "questionnaire_submissions",
  {
    id: text("id").primaryKey(),
    createdAt: text("created_at").notNull(),
    name: text("name").notNull(),
    gender: text("gender").notNull(),
    age: integer("age").notNull(),
    visitType: text("visit_type").notNull(),
    course: text("course").notNull(),
    answersJson: text("answers_json").notNull(),
    totalScore: integer("total_score").notNull(),
    level: text("level").notNull(),
    tagsJson: text("tags_json").notNull(),
  },
  (table) => [index("questionnaire_created_at_idx").on(table.createdAt)],
);
