import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scenarios = pgTable('scenarios', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  imagePath: text('image_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const choices = pgTable('choices', {
  id: serial('id').primaryKey(),
  scenarioId: text('scenario_id')
    .notNull()
    .references(() => scenarios.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  type: text('type').notNull(), // 'left' or 'right'
});

export const scenarioEffects = pgTable('scenario_effects', {
  id: serial('id').primaryKey(),
  choiceId: integer('choice_id')
    .notNull()
    .references(() => choices.id, { onDelete: 'cascade' }),
  money: integer('money').notNull().default(0),
  army: integer('army').notNull().default(0),
  people: integer('people').notNull().default(0),
  religion: integer('religion').notNull().default(0),
});
