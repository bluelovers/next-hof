/**
 * GameDescription 遊戲簡介元件
 * GameDescription component
 *
 * Hall of Rumor 風格的遊戲簡介區域
 * Hall of Rumor styled game description section
 */
import React from 'react';
import './GameDescription.css';

/**
 * GameDescription 遊戲簡介元件
 * GameDescription component
 */
export const GameDescription: React.FC = () => {
   return (
     <div className="game-description-wrapper">
       {/* Hall of Fame 裝飾圖 / Decoration */}
       <div className="hof-decoration">
         HOF
       </div>

       <div className="game-description">
        <div className="section-title">これってどんなゲーム?</div>
        <ul>
          <li>
            ゲームの目的はランキング1位になり、
            <br />
            1位を守る事です。
          </li>
          <li>
            冒険要素はないですが、
            <br />
            ちょっと深い戦闘システムが売りです。
          </li>
        </ul>

        <div className="section-title">戦闘はどんな感じ?</div>
        <ul>
          <li>5人のキャラクターでパーティーを編成。</li>
          <li>
            各キャラが行動パターンを持ち、
            <br />
            戦闘の状況に応じて技を使い分けます。
          </li>
          <li>
            <a href="http://127.0.0.1:8085/log" className="battle-link">
              こちら
            </a>
            で戦闘ログが回覧できます。
          </li>
        </ul>
      </div>
    </div>
  );
};
