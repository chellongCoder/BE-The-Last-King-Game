import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE_PROVIDER } from '../db/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { scenarios, choices, scenarioEffects } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StructuredOutputParser, JsonOutputParser } from '@langchain/core/output_parsers';
import z from 'zod';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScenariosService {
    private model: ChatGoogleGenerativeAI;

    constructor(
        @Inject(DRIZZLE_PROVIDER)
        private db: PostgresJsDatabase<typeof schema>,
        private configService: ConfigService,
    ) {
        this.model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash-lite",
            temperature: 0.9,
            apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
        });
    }

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

    async generateScenariosFromLangChain() {
        const prompt = ChatPromptTemplate.fromMessages([
            ["human", "Role: You are a historian who specializes in generating historical scenarios for a game. You are currently in the Tran dynasty.\n\nTask: {scenario}\n{sample}"]
        ]);

        const outputParser = StructuredOutputParser.fromZodSchema(
            z.object({
                scenarios: z.array(z.object({
                    id: z.string().describe('scenario id'),
                    text: z.string().describe('scenario text'),
                    leftChoice: z.object({
                        text: z.string().describe('left choice text'),
                        effect: z.object({
                            money: z.number().describe('money effect'),
                            army: z.number().describe('army effect'),
                            people: z.number().describe('people effect'),
                            religion: z.number().describe('religion effect'),
                        })
                    }),
                    rightChoice: z.object({
                        text: z.string().describe('right choice text'),
                        effect: z.object({
                            money: z.number().describe('money effect'),
                            army: z.number().describe('army effect'),
                            people: z.number().describe('people effect'),
                            religion: z.number().describe('religion effect'),
                        })
                    }),
                })).describe('list scenarios')
            })
        )

        console.log('🟢 format_instructions', outputParser.getFormatInstructions());

        const chain = prompt.pipe(this.model).pipe(outputParser);

        const result = await chain.invoke({
            format_instructions: "Imagine you are current being in Tran dynasty",
            scenario: outputParser.getFormatInstructions(),
            sample: `
                You need create scenario like this object, give me 30 records
                {
                    "id": "intro_1",
                    "text": "Nhà Trần mới thành lập, lòng dân chưa yên. Bạn sẽ làm gì để củng cố quyền lực?",
                    "imagePath": "assets/images/intro_1.png",
                    "leftChoice": {
                        "text": "Giảm thuế cho dân",
                        "effect": {
                            "people": 10,
                            "money": -10,
                            "army": 0,
                            "religion": 0
                        }
                    },
                    "rightChoice": {
                        "text": "Chiêu mộ binh lính",
                        "effect": {
                            "army": 10,
                            "money": -5,
                            "people": 0,
                            "religion": 0
                        }
                    }
                }
            `
        });

        return result.scenarios;
    }

    async *generateScenariosStream() {
        const prompt = ChatPromptTemplate.fromMessages([
            ["human", "Role: You are a historian who specializes in generating historical scenarios for a game. You are currently in the Tran dynasty.\n\nTask: Please generate 10 historical scenarios for the game. Return your answer as a JSON array. Each scenario should follow this structure:\n{sample}"]
        ]);

        const parser = new JsonOutputParser();
        const chain = prompt.pipe(this.model).pipe(parser);

        const sampleJson = `
        {
            "id": "scenario_id",
            "text": "scenario description text",
            "leftChoice": {
                "text": "choice text",
                "effect": { "money": 0, "army": 0, "people": 0, "religion": 0 }
            },
            "rightChoice": {
                "text": "choice text",
                "effect": { "money": 0, "army": 0, "people": 0, "religion": 0 }
            }
        }`;


        const stream = await chain.stream({
            sample: sampleJson
        });

        let sentCount = 0;
        for await (const chunk of stream) {
            if (Array.isArray(chunk)) {
                // If the next full object in the array is ready, yield it
                while (sentCount < chunk.length - 1) {
                    yield chunk[sentCount];
                    sentCount++;
                }
            }
        }
    }
}
