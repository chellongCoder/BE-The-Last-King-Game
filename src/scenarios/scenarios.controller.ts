import { Controller, Get, Post, Body } from '@nestjs/common';
import { ScenariosService } from './scenarios.service';
import { CreateScenarioDto } from './dto/create-scenario.dto';

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
}
