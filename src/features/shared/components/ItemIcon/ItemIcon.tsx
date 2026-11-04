/** 通用道具圖示：接受 URL，缺圖時以名稱首字佔位，不依賴任何資料來源。 */
import React from 'react';
import type { IStyleProps } from '#/components/shared/types';
import './ItemIcon.css';

/** 圖示元件 props / Icon props */
export interface IItemIconProps extends IStyleProps
{
	/** 圖示 URL，缺省時顯示佔位 / Icon URL; a placeholder is shown when absent */
	url?: string;
	/** 道具名稱，用於 alt 與佔位文字 / Item name for alt text and placeholder */
	name: string;
	/** 邊長（px）/ Edge length in px */
	size?: number;
}

/** 道具圖示 / Item icon */
export const ItemIcon: React.FC<IItemIconProps> = ({ url, name, size = 32, className = '', style }) =>
{
	const dimension = { width: size, height: size };

	if (url)
	{
		return <img className={`item-icon ${className}`} src={url} alt={name} style={{ ...dimension, ...style }} />;
	}

	/** 缺圖時保留固定尺寸與底色，避免圖片載入失敗造成版面跳動 */
	return (
		<span
			className={`item-icon item-icon--placeholder ${className}`}
			style={{ ...dimension, ...style }}
			aria-label={name}
		>
			{name.charAt(0)}
		</span>
	);
};
