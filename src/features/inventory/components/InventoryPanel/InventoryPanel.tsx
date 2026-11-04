/** 道具箱面板：列出持有道具、顯示持有金，並執行售出與拋棄。 */
'use client';

import React, { useMemo, useState } from 'react';
import type { EnumTradeError, ICommandResult } from '#/src/features/inventory/domain/types';
import { useInventory } from '#/src/features/inventory/state/useInventory';
import { buildDiscard, buildSell } from '#/src/features/inventory/domain/commands';
import { listOwned } from '#/src/features/inventory/domain/inventory';
import { InventoryRow } from '#/src/features/inventory/components/InventoryRow/InventoryRow';
import './InventoryPanel.css';

/** 面板文案 / Panel copy */
export interface IInventoryPanelLabels
{
	title: string;
	empty: string;
	owned: string;
	sellPrice: string;
	sell: string;
	discard: string;
	gold: string;
	tradeFailed: string;
}

/** 面板 props：資料與文案全由外部注入，讓道具箱可脫離商店單獨使用 / Panel props: data and copy are injected so the panel works without a shop */
export interface IInventoryPanelProps
{
	/** 售出單價解析器 / Unit sell-price resolver */
	sellPriceOf: (no: number) => number;
	/** 幣值標籤 / Currency label */
	currencyLabel: string;
	/** 圖示 URL 解析器 / Icon URL resolver */
	iconUrlOf: (no: number) => string | undefined;
	/** 文案 / Copy */
	labels: IInventoryPanelLabels;
	/** 錯誤訊息解析，省略時顯示通用失敗文案 / Error label resolver */
	errorLabelOf?: (error?: EnumTradeError) => string | undefined;
}

/** 道具箱面板 / Inventory panel */
export const InventoryPanel: React.FC<IInventoryPanelProps> = ({
	sellPriceOf,
	currencyLabel,
	iconUrlOf,
	labels,
	errorLabelOf,
}) =>
{
	const { snapshot, catalog, apply } = useInventory();
	const [error, setError] = useState<EnumTradeError | undefined>(undefined);

	const entries = useMemo(() => listOwned(snapshot.inventory).map(({ no, quantity }) => ({
		no,
		quantity,
		item: catalog.getItem(no),
	})), [snapshot.inventory, catalog]);

	/** 售出與拋棄共用同一套結果處理：不成立時保留狀態並顯示原因 */
	const commit = (result: ICommandResult) =>
	{
		const succeeded = apply(result);
		setError(succeeded ? undefined : result.reason);
	};

	const handleSell = (no: number) =>
	{
		commit(buildSell(snapshot, no, 1, catalog, (item) => sellPriceOf(item.no)));
	};

	const handleDiscard = (no: number) =>
	{
		commit(buildDiscard(snapshot, no, 1, catalog));
	};

	const message = errorLabelOf?.(error) ?? (error ? labels.tradeFailed : undefined);

	return (
		<section className="inventory-panel">
			<header className="inventory-panel__header">
				<h3>{labels.title}</h3>
				<span className="inventory-panel__gold">{labels.gold} {snapshot.wallet.gold}{currencyLabel}</span>
			</header>

			{message && <p className="inventory-panel__error" role="status">{message}</p>}

			{entries.length === 0
				? <p className="inventory-panel__empty">{labels.empty}</p>
				: (
					<ul className="inventory-panel__list">
						{entries.map((entry) => (
							<InventoryRow
								key={entry.no}
								entry={entry}
								iconUrl={iconUrlOf(entry.no)}
								sellPrice={sellPriceOf(entry.no)}
								currencyLabel={currencyLabel}
								labels={{
									owned: labels.owned,
									sellPrice: labels.sellPrice,
									sell: labels.sell,
									discard: labels.discard,
								}}
								onSell={() => handleSell(entry.no)}
								onDiscard={() => handleDiscard(entry.no)}
							/>
						))}
					</ul>
				)}
		</section>
	);
};
