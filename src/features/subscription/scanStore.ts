import { create } from 'zustand';

import type { ScanResult } from './types';

/*
 * 스캔 화면 → 스캔 결과 화면으로 인식 결과를 넘기는 저장소.
 * 결과가 커서 라우트 파라미터 대신 메모리에 둔다 (앱을 다시 켜면 비어 있다 → 결과 화면은 '결과 없음' 안내).
 */
type ScanState = {
  result: ScanResult | null;
  setResult: (result: ScanResult) => void;
  clear: () => void;
};

export const useScanStore = create<ScanState>()((set) => ({
  result: null,
  setResult: (result) => set({ result }),
  clear: () => set({ result: null }),
}));
