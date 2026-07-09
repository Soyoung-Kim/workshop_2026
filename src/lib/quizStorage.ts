export default {
  "categories": [
    {
      "id": "cat_person",
      "name": "인물",
      "description": "발표자와 참석자 관련 문제",
      "sortOrder": 1,
      "useYn": true
    },
    {
      "id": "cat_it",
      "name": "IT 상식",
      "description": "IT 회사 구성원이 알면 좋은 쉬운 상식",
      "sortOrder": 2,
      "useYn": true
    },
    {
      "id": "cat_nonsense",
      "name": "넌센스",
      "description": "말장난과 순발력 퀴즈",
      "sortOrder": 3,
      "useYn": true
    },
    {
      "id": "cat_memory",
      "name": "추억 소환",
      "description": "80~90년대 문화와 물건",
      "sortOrder": 5,
      "useYn": true
    },
    {
      "id": "cat_chosung",
      "name": "초성퀴즈",
      "description": "이미지를 보고 초성 정답을 맞히는 퀴즈",
      "sortOrder": 6,
      "useYn": true
    }
  ],
  "questions": [
    {
      "id": "q_memory_001",
      "categoryId": "cat_memory",
      "question": "다음 숫자의 의미를 모두 맞혀보세요.\n\n486\n7942\n0024",
      "answer": "486 -> 사랑해\n7942 -> 친구사이\n0024 -> 이 세상에 하나뿐인 사랑",
      "sortOrder": 1,
      "useYn": true,
      "mediaType": "",
      "mediaUrl": "",
      "mediaCaption": ""
    },
    {
      "id": "q_nonsense_001",
      "categoryId": "cat_nonsense",
      "question": "세상에서 가장 쉬운 숫자는?",
      "answer": "190000 (십구만)",
      "sortOrder": 1,
      "useYn": true,
      "mediaType": "",
      "mediaUrl": "",
      "mediaCaption": ""
    },
    {
      "id": "q_person_001",
      "categoryId": "cat_person",
      "question": "오늘 첫 번째 발표를 진행한 사람은 누구일까요?",
      "answer": "행사 당일 입력",
      "sortOrder": 1,
      "useYn": true
    },
    {
      "id": "q_chosung_001",
      "categoryId": "cat_chosung",
      "question": "이미지를 보고 정답을 맞혀보세요.",
      "answer": "꾸중",
      "mediaItems": [
        {
          "mediaType": "image",
          "mediaUrl": "quiz-assets/images/chosung-scolding.png",
          "mediaCaption": "정답 초성: ㄲㅈ"
        }
      ],
      "sortOrder": 1,
      "useYn": true
    },
    {
      "id": "q_it_001",
      "categoryId": "cat_it",
      "question": "AI는 무엇의 약자일까요?",
      "answer": "Artificial Intelligence",
      "sortOrder": 1,
      "useYn": true
    },
    {
      "id": "q_chosung_002",
      "categoryId": "cat_chosung",
      "question": "이미지를 보고 정답을 맞혀보세요.",
      "answer": "백수",
      "mediaItems": [
        {
          "mediaType": "image",
          "mediaUrl": "quiz-assets/images/chosung-unemployed.png",
          "mediaCaption": "정답 초성: ㅂㅅ"
        }
      ],
      "sortOrder": 2,
      "useYn": true
    },
    {
      "id": "q_it_002",
      "categoryId": "cat_it",
      "question": "AWS의 S3는 무엇의 약자일까요?",
      "answer": "Simple Storage Service",
      "sortOrder": 2,
      "useYn": true,
      "mediaType": "",
      "mediaUrl": "",
      "mediaCaption": ""
    },
    {
      "id": "q_memory_003",
      "categoryId": "cat_memory",
      "question": "다음 추억의 애니메이션 이름을 각각 맞혀보세요.",
      "answer": "세일러문\n카드캡터 체리\n시간탐험대",
      "mediaItems": [
        {
          "mediaType": "image",
          "mediaUrl": "quiz-assets/images/sailor-moon.png",
          "mediaCaption": "세일러문"
        },
        {
          "mediaType": "image",
          "mediaUrl": "quiz-assets/images/cardcaptor-cherry.png",
          "mediaCaption": "카드캡터 체리"
        },
        {
          "mediaType": "image",
          "mediaUrl": "quiz-assets/images/time-quest.png",
          "mediaCaption": "시간탐험대"
        }
      ],
      "sortOrder": 3,
      "useYn": true
    },
    {
      "id": "q_nonsense_003",
      "categoryId": "cat_nonsense",
      "question": "세상에서 가장 뜨거운 과일은",
      "answer": "천도복숭아",
      "sortOrder": 3,
      "useYn": true,
      "mediaType": "image",
      "mediaUrl": "quiz-assets/images/cheondo.png",
      "mediaCaption": ""
    },
    {
      "id": "q_person_003",
      "categoryId": "cat_person",
      "question": "오늘 발표한 OO님의 생일은 언제일까요?",
      "answer": "행사 당일 입력",
      "sortOrder": 3,
      "useYn": true
    },
    {
      "id": "q_chosung_003",
      "categoryId": "cat_chosung",
      "question": "이미지를 보고 정답을 맞혀보세요.",
      "answer": "조롱",
      "mediaItems": [
        {
          "mediaType": "image",
          "mediaUrl": "quiz-assets/images/chosung-mocking.png",
          "mediaCaption": "정답 초성: ㅈㄹ"
        }
      ],
      "sortOrder": 3,
      "useYn": true
    },
    {
      "id": "q_it_003",
      "categoryId": "cat_it",
      "question": "URL에서 U는 무엇의 약자일까요?",
      "answer": "Uniform\n\n(Uniform Resource Locator)",
      "sortOrder": 3,
      "useYn": true
    },
    {
      "id": "q_nonsense_004",
      "categoryId": "cat_nonsense",
      "question": "그림 넌센스 퀴즈",
      "answer": "돈다발",
      "sortOrder": 4,
      "useYn": true,
      "mediaType": "",
      "mediaUrl": "quiz-assets/images/binggeul.png",
      "mediaCaption": ""
    },
    {
      "id": "q_person_004",
      "categoryId": "cat_person",
      "question": "오늘 발표한 OO님의 MBTI는 무엇일까요?",
      "answer": "행사 당일 입력",
      "sortOrder": 4,
      "useYn": true
    },
    {
      "id": "q_chosung_004",
      "categoryId": "cat_chosung",
      "question": "이미지를 보고 정답을 맞혀보세요.",
      "answer": "마침내",
      "mediaItems": [
        {
          "mediaType": "image",
          "mediaUrl": "quiz-assets/images/chosung-finally.png",
          "mediaCaption": "정답 초성: ㅁㅊㄴ"
        }
      ],
      "sortOrder": 4,
      "useYn": true
    },
    {
      "id": "q_it_004",
      "categoryId": "cat_it",
      "question": "HTTP에서 H는 무엇의 약자일까요?",
      "answer": "HyperText\n\n(HyperText Transfer Protocol)",
      "sortOrder": 4,
      "useYn": true
    }
  ],
  "exportedAt": "2026-07-09T16:40:10.900Z"
}