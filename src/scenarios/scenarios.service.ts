import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { scenarios, choices, scenarioEffects } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateScenarioDto } from './dto/create-scenario.dto';

@Injectable()
export class ScenariosService {
    constructor(
        @Inject(DRIZZLE_PROVIDER)
        private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async findAll() {
        const allScenarios = await this.db.select().from(scenarios);

        // Fetch related choices and effects and manually reconstruct the structure
        // In a larger app, using Drizzle relations would be better.
        const results = await Promise.all(
            allScenarios.map(async (scenario) => {
                const scenarioChoices = await this.db
                    .select()
                    .from(choices)
                    .where(eq(choices.scenarioId, scenario.id));

                const choicesWithEffects = await Promise.all(
                    scenarioChoices.map(async (choice) => {
                        const effect = await this.db
                            .select()
                            .from(scenarioEffects)
                            .where(eq(scenarioEffects.choiceId, choice.id))
                            .limit(1);

                        return {
                            text: choice.text,
                            type: choice.type,
                            effect: effect[0] || {},
                        };
                    }),
                );

                return {
                    ...scenario,
                    leftChoice: choicesWithEffects.find((c) => c.type === 'left'),
                    rightChoice: choicesWithEffects.find((c) => c.type === 'right'),
                };
            }),
        );

        return results;
    }

    async create(dto: CreateScenarioDto) {
        return await this.db.transaction(async (tx) => {
            // 1. Insert Scenario
            const [newScenario] = await tx
                .insert(scenarios)
                .values({
                    id: dto.id,
                    text: dto.text,
                    imagePath: dto.imagePath,
                })
                .returning();

            // 2. Insert Left Choice
            const [leftChoice] = await tx
                .insert(choices)
                .values({
                    scenarioId: newScenario.id,
                    text: dto.leftChoice.text,
                    type: 'left',
                })
                .returning();

            // 3. Insert Left Choice Effects
            await tx.insert(scenarioEffects).values({
                choiceId: leftChoice.id,
                money: dto.leftChoice.effect.money ?? 0,
                army: dto.leftChoice.effect.army ?? 0,
                people: dto.leftChoice.effect.people ?? 0,
                religion: dto.leftChoice.effect.religion ?? 0,
            });

            // 4. Insert Right Choice
            const [rightChoice] = await tx
                .insert(choices)
                .values({
                    scenarioId: newScenario.id,
                    text: dto.rightChoice.text,
                    type: 'right',
                })
                .returning();

            // 5. Insert Right Choice Effects
            await tx.insert(scenarioEffects).values({
                choiceId: rightChoice.id,
                money: dto.rightChoice.effect.money ?? 0,
                army: dto.rightChoice.effect.army ?? 0,
                people: dto.rightChoice.effect.people ?? 0,
                religion: dto.rightChoice.effect.religion ?? 0,
            });

            return this.findAll(); // Return all or just the new one (simplified)
        });
    }
}
