import { Controller, Get, Post, Body, Sse, MessageEvent } from '@nestjs/common';
import { ScenariosService } from './scenarios.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { Observable, from, map } from 'rxjs';

@Controller('scenarios')
export class ScenariosController {
    constructor(private readonly scenariosService: ScenariosService) { }

    @Get()
    findAll() {
        return this.scenariosService.findAll();
    }

    @Post()
    create(@Body() createScenarioDto: CreateScenarioDto) {
        return this.scenariosService.create(createScenarioDto);
    }

    @Get("generate")
    generateScenariosFromLangChain() {
        return this.scenariosService.generateScenariosFromLangChain();
    }

    @Sse('generate-stream')
    generateStream(): Observable<MessageEvent> {
        return from(this.scenariosService.generateScenariosStream()).pipe(
            map((scenario) => {
                console.log('🟢 scenario', scenario);
                return ({
                    data: scenario,
                } as MessageEvent)
            })
        )
    }
}
