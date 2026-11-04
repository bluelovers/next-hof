/**
 * 商店路由的組裝點：Server Component 讀取 YAML 資源後交給 client 頁面。
 * __RESOURCE_YAML 與 loadItemYaml 只在此出現，商店系統本身不依賴檔案系統或路徑常數。
 */
/** 資源根目錄直接取自 src/：test/lib/data-paths 會連帶引入 root-paths 的 import.meta.url，turbopack 無法解析 */
import { __RESOURCE_YAML } from '#/src/paths-for-ssr';
import { loadItemYaml } from '#/src/lib/game/data/yaml-load';
import { SHOP_ITEM_IDS } from '#/src/features/shop/domain/shop-item-ids';
import { loadShopCatalog } from '#/src/features/shop/adapters/yaml/load-shop-catalog';
import { ShopPageView } from '#/src/features/shop/components/ShopPageView/ShopPageView';

/** 商店頁面 / Shop page */
export default function ShopPage()
{
	const items = loadShopCatalog({
		loadItem: loadItemYaml,
		root: __RESOURCE_YAML,
		ids: SHOP_ITEM_IDS,
	});

	return <ShopPageView items={items} />;
}
