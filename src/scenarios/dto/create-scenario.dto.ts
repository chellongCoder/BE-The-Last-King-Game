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

// [
//   {
//     "id": "intro_1",
//     "text": "Nhà Trần mới thành lập, lòng dân chưa yên. Bạn sẽ làm gì để củng cố quyền lực?",
//     "imagePath": "assets/images/intro_1.png",
//     "leftChoice": {
//       "text": "Giảm thuế cho dân",
//       "effect": {
//         "people": 10,
//         "money": -10,
//         "army": 0,
//         "religion": 0
//       }
//     },
//     "rightChoice": {
//       "text": "Chiêu mộ binh lính",
//       "effect": {
//         "army": 10,
//         "money": -5,
//         "people": 0,
//         "religion": 0
//       }
//     }
//   },
//   {
//     "id": "event_mogol",
//     "text": "Sứ giả Mông Cổ đến đòi cống nạp. Thái độ rất ngạo mạn.",
//     "imagePath": "assets/images/mogol.png",
//     "leftChoice": {
//       "text": "Chấp nhận cống nạp",
//       "effect": {
//         "money": -20,
//         "people": -5,
//         "army": -5,
//         "religion": 0
//       }
//     },
//     "rightChoice": {
//       "text": "Đuổi về, chuẩn bị chiến tranh",
//       "effect": {
//         "army": 5,
//         "religion": 5,
//         "money": -5,
//         "people": 0
//       }
//     }
//   },
//   {
//     "id": "internal_conflict",
//     "text": "Một quan lại trong triều bị tố cáo tham nhũng.",
//     "imagePath": null,
//     "leftChoice": {
//       "text": "Trừng trị nghiêm khắc",
//       "effect": {
//         "money": 10,
//         "people": 5,
//         "religion": -5,
//         "army": 0
//       }
//     },
//     "rightChoice": {
//       "text": "Tha thứ để giữ hòa khí",
//       "effect": {
//         "people": -10,
//         "religion": 5,
//         "money": 0,
//         "army": 0
//       }
//     }
//   }
// ]