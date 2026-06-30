# 전략사업본부 워크샵 참여 시스템

「우리 팀은 어떤 팀인가?」 워크샵용 React/Vite/Supabase 앱입니다.

## 화면

- 참여자: `/`
- 심사자: `/judge?token=judge-song`
- 관리자: `/admin`

심사자 토큰은 `judge-song`, `judge-yang`, `judge-lee`, `judge-moon`, `judge-shin`입니다.

## Supabase 초기화

Supabase SQL Editor에서 아래 순서대로 실행합니다.

1. `supabase/schema.sql`
2. `supabase/policies.sql`

초기 데이터에는 팀 4개와 심사자 5명이 포함되어 있습니다. 공개 저장소에 민감정보가 올라가지 않도록 `supabase/schema.sql`의 `CHANGE_ME_ADMIN_PASSWORD`를 Supabase SQL Editor에서 실행하기 전에 실제 관리자 비밀번호로 바꿔 실행하세요.

## 로컬 실행

```bash
npm install
npm run dev
```

환경변수는 `.env.example` 값을 그대로 사용해도 됩니다. Supabase publishable key는 프런트엔드에 포함되어도 되는 공개 키입니다.

## 배포

GitHub Pages 배포 워크플로는 `.github/workflows/deploy.yml`에 포함되어 있습니다. 저장소 Settings에서 Pages source를 GitHub Actions로 설정한 뒤 `master` 또는 `main` 브랜치에 push하면 `dist`가 배포됩니다.

## 보안 메모

이 앱은 별도 로그인 없이 워크샵 현장에서 쓰는 1회성 운영 모델입니다. 작성자 익명성은 심사자 RPC가 이름/작성일을 반환하지 않는 방식으로 처리했습니다. 관리자 비밀번호는 운영 편의를 위한 접근 제한이며, 장기 운영 서비스라면 Supabase Auth 기반 권한 모델로 전환하는 편이 좋습니다.
