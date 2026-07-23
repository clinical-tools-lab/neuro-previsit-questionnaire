CREATE TABLE `questionnaire_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`name` text NOT NULL,
	`gender` text NOT NULL,
	`age` integer NOT NULL,
	`visit_type` text NOT NULL,
	`course` text NOT NULL,
	`answers_json` text NOT NULL,
	`total_score` integer NOT NULL,
	`level` text NOT NULL,
	`tags_json` text NOT NULL
);
