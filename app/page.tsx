// 展示頁入口（根路徑）/ Showcase page entry (site root)
// 'use client'：戰鬥引擎於瀏覽器同步執行（見 design D2）。
// 'use client': the battle engine runs synchronously in the browser (see design D2).

'use client';

import { ShowcasePage } from '#/components/showcase/ShowcasePage';

export default function HomePage() {
	return (
		<main className="showcase-page">
			<ShowcasePage />
		</main>
	);
}
