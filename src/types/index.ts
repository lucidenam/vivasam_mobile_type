// 모든 타입 정의를 한 곳에서 export
// 사용 예: import type { User, ApiResponse } from '@/types'

export * from './domain/common';
export * from './domain/api';

// global.d.ts는 전역 타입 확장 파일이므로 별도 import 불필요
// Window 인터페이스 확장 등은 자동으로 전역에 적용됨

