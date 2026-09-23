/**
 * EncounterSelect 敵方編選區塊元件
 * Encounter select component
 *
 * radio 單選至少兩組 encounter（資料來自 seed 怪物，見 lib/showcase/encounters），
 * 每組顯示敵方隊伍名稱與怪物構成。
 * Radio single-select for at least two encounters (built from seed monsters, see
 * lib/showcase/encounters), each showing the enemy team name and composition.
 */
import React from 'react';
import { SHOWCASE_ENCOUNTERS } from '#/lib/showcase/encounters';
import type { IEncounter } from '#/lib/showcase/encounters';
import { SEED } from '#/lib/game/data/seed-data';
import { getMonSpriteUrl } from '#/lib/showcase/sprite-map';
import './EncounterSelect.css';
import '#/components/shared/SharedBase.css';

/** EncounterSelect 屬性 / EncounterSelect props */
export interface IEncounterSelectProps {
  /** 已選編選 id / Selected encounter id */
  selectedId: string;
  /** 編選變更回调（傳入 id）/ Encounter change callback (id) */
  onChange: (id: string) => void;
}

/**
 * 怪物名稱查詢（def no → seed 名稱，查無回傳編號字面）
 * Monster name lookup (def no → seed name; literal number when missing)
 */
const monName = (no: number): string => SEED.mons.find((m) => m.no === no)?.name ?? String(no);

/**
 * 單一編選選項（radio 卡片）
 * One encounter option (radio card)
 */
const EncounterCard: React.FC<{
  encounter: IEncounter;
  checked: boolean;
  onChange: (id: string) => void;
}> = ({ encounter, checked, onChange }) => (
  <label className={`encounter-card${checked ? ' is-checked' : ''}`}>
    <input
      type="radio"
      name="showcase-encounter"
      checked={checked}
      onChange={() => onChange(encounter.id)}
    />
    <span className="encounter-card-body">
      <span className="encounter-card-name">{encounter.name}</span>
      <span className="encounter-card-team">{encounter.teamName}</span>
      <span className="encounter-card-mons">
        {encounter.monNos.map((no, i) => (
          <span className="encounter-mon" key={`${no}-${i}`}>
            <span
              className="encounter-mon-sprite"
              style={{ backgroundImage: `url(${getMonSpriteUrl(no)})` }}
              aria-hidden="true"
            />
            <span className="encounter-mon-name">{monName(no)}</span>
          </span>
        ))}
      </span>
    </span>
  </label>
);

/**
 * EncounterSelect 敵方編選區塊元件
 * Encounter select component
 */
export const EncounterSelect: React.FC<IEncounterSelectProps> = ({
  selectedId,
  onChange,
}) => {
  return (
    <section className="encounter-select" aria-labelledby="encounter-select-heading">
      <h2 id="encounter-select-heading" className="encounter-select-heading">
        敵方編選 / Enemy Encounter
      </h2>

      <div className="encounter-select-list">
        {SHOWCASE_ENCOUNTERS.map((encounter) => (
          <EncounterCard
            key={encounter.id}
            encounter={encounter}
            checked={encounter.id === selectedId}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
};
