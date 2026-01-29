export class CreateEffectDto {
    money?: number;
    army?: number;
    people?: number;
    religion?: number;
}

export class CreateChoiceDto {
    text: string;
    effect: CreateEffectDto;
    type: 'left' | 'right';
}

export class CreateScenarioDto {
    id: string;
    text: string;
    imagePath?: string;
    leftChoice: Omit<CreateChoiceDto, 'type'>;
    rightChoice: Omit<CreateChoiceDto, 'type'>;
}
