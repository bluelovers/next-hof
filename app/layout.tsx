// 根版面 / Root layout
// Next.js App Router 必要版面：提供 metadata 與全域字型（メイリオ / Meiryo / MS PGothic）。
// Required App Router root layout: metadata + global font (Meiryo / MS PGothic).

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
	title: '組隊與戰鬥展示頁 / Team Battle Showcase',
	description:
		'從 seed 資料選取隊伍與敵方編組，實際執行回合制戰鬥引擎並檢視完整日誌與結果。',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="zh-Hant">
			<body>{children}</body>
		</html>
	);
}
