/** 道具箱單列：呈現持有數並觸發售出、拋棄，所有文案與圖示由外部注入。 */
import React from 'react';
import { ItemIcon } from '#/src/features/shared/components/ItemIcon/ItemIcon';
import type { IInventoryEntry } from '#/src/features/inventory/domain/types';
import './InventoryRow.css';

/** 單列文案 / Row copy */
export interface IInventoryRowLabels
{
	owned: string;
	sellPrice: string;
	sell: string;
	discard: string;
}

/** 單列 props / Row props */
export interface IInventoryRowProps
{
	/** 該列資料 / Row data */
	entry: IInventoryEntry;
	/** 圖示 URL / Icon URL */
	iconUrl?: string;
	/** 售出單價 / Unit sell price */
	sellPrice: number;
	/** 幣值標籤 / Currency label */
	currencyLabel: string;
	/** 文案 / Copy */
	labels: IInventoryRowLabels;
	/** 售出回呼 / Sell callback */
	onSell(): void;
	/** 拋棄回呼 / Discard callback */
	onDiscard(): void;
}

/** 道具箱單列 / Inventory row */
export const InventoryRow: React.FC<IInventoryRowProps> = ({
	entry,
	iconUrl,
	sellPrice,
	currencyLabel,
	labels,
	onSell,
	onDiscard,
}) =>
{
	/** 目錄查無定義時以編號代替名稱，讓列仍能操作 */
	const name = entry.item?.name ?? `#${entry.no}`;

	return (
		<li className="inventory-row">
			<ItemIcon url={iconUrl} name={name} />
			<span className="inventory-row__name">{name}</span>
			<span className="inventory-row__qty">{labels.owned} ×{entry.quantity}</span>
			<span className="inventory-row__price">{labels.sellPrice} {sellPrice}{currencyLabel}</span>
			<span className="inventory-row__actions">
				<button type="button" className="inventory-row__btn" onClick={onSell}>{labels.sell}</button>
				<button type="button" className="inventory-row__btn" onClick={onDiscard}>{labels.discard}</button>
			</span>
		</li>
	);
};
