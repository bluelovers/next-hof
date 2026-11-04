/** 商品工具列：搜尋、排序與分類篩選，選項與文案皆來自注入的設定。 */
'use client';

import React from 'react';
import { useShop, useShopConfig } from '#/features/shop/state/useShop';
import { CATEGORY_ALL, EnumShopSortKey } from '#/features/shop/domain/types';
import './CatalogToolbar.css';

/** 商品工具列 / Catalog toolbar */
export const CatalogToolbar: React.FC = () =>
{
	const { query, setQuery } = useShop();
	const { labels, sortOptions, categories } = useShopConfig();

	return (
		<div className="catalog-toolbar">
			<input
				className="catalog-toolbar__search"
				type="search"
				value={query.search}
				placeholder={labels.searchPlaceholder}
				aria-label={labels.searchPlaceholder}
				onChange={(event) => setQuery({ ...query, search: event.target.value })}
			/>

			<label className="catalog-toolbar__field">
				<span>{labels.sortLabel}</span>
				<select
					value={query.sort}
					onChange={(event) => setQuery({ ...query, sort: event.target.value as EnumShopSortKey })}
				>
					{sortOptions.map((option) => (
						<option key={option.key} value={option.key}>{option.label}</option>
					))}
				</select>
			</label>

			<label className="catalog-toolbar__field">
				<span>{labels.categoryLabel}</span>
				<select
					value={query.categoryId}
					onChange={(event) => setQuery({ ...query, categoryId: event.target.value })}
				>
					<option value={CATEGORY_ALL}>{labels.categoryAll}</option>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>{category.label}</option>
					))}
				</select>
			</label>
		</div>
	);
};
