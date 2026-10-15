import React, { useState, useEffect, useRef } from 'react';

/** @type { import('@storybook/nextjs-vite').Preview } */
const preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: "todo",
		},

		docs: {
			codePanel: true,
		},

		layout: 'centered',
	},

	initialGlobals: {
		// 👇 Set the initial background color
		backgrounds: {
			value: 'dark',
			grid: true,
		},
	},

  globalTypes: {
    rulerMode: {
      description: '選擇尺標與參考線模式',
      defaultValue: 'off',
      toolbar: {
        title: 'Ruler & Guides',
        icon: 'beaker',
        items: [
          { value: 'off', title: '📴 關閉所有輔助功能' },
          { value: 'window', title: '🖥️ 尺標：貼齊視窗' },
          { value: 'component', title: '📦 尺標：貼齊元件' },
          { value: 'crosshair-follow', title: '➕ 參考線：隨滑鼠移動' },
          { value: 'crosshair-click', title: '📍 參考線：點擊固定位置' },
        ],
        dynamicTitle: true,
      },
    },
  },

  // 2. 全域裝飾器
  decorators: [
    (Story, context) => {
      const mode = context.globals.rulerMode || 'off';

      // 狀態管理：滑鼠位置與固定參考線陣列
      const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
      const [fixedGuides, setFixedGuides] = useState([]);
      const containerRef = useRef(null);

      const showRuler = mode === 'window' || mode === 'component';
      const isWindowMode = mode === 'window';
      const isFollowMode = mode === 'crosshair-follow';
      const isClickMode = mode === 'crosshair-click';
      const showCrosshairs = isFollowMode || isClickMode;

      // 監聽滑鼠移動
      useEffect(() => {
        if (!showCrosshairs) return;

        const handleMouseMove = (e) => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
              x: Math.round(e.clientX - rect.left),
              y: Math.round(e.clientY - rect.top),
            });
          }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
      }, [showCrosshairs]);

      // 點擊新增固定線
      const handleContainerClick = (e => {
        if (!isClickMode || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);

        setFixedGuides((prev) => [...prev, { x, y }]);
      });

      // 清除所有固定線
      const clearFixedGuides = (e) => {
        e.stopPropagation();
        setFixedGuides([]);
      };

      return (
        <div
          ref={containerRef}
          className="sb-ruler-container"
          onClick={handleContainerClick}
          style={{
            position: 'relative',
            minHeight: '100vh',
            cursor: isClickMode ? 'crosshair' : 'default',
            paddingTop: mode === 'component' ? '30px' : '0',
            paddingLeft: mode === 'component' ? '30px' : '0'
          }}
        >
          {/* ────── 1. 尺標 ────── */}
          {showRuler && (
            <>
              <style>{`
                .sb-cv-ruler-h, .sb-cv-ruler-v, .sb-cv-ruler-corner {
                  z-index: 999999;
                  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                  font-size: 9px;
                  color: #71717a;
                  user-select: none;
                  background-color: #f4f4f5;
                }
                .sb-cv-ruler-h {
                  border-bottom: 1px solid #d4d4d8;
                  background-image: linear-gradient(90deg, #e4e4e7 1px, transparent 1px), linear-gradient(90deg, #a1a1aa 1px, transparent 1px);
                  background-size: 10px 8px, 100px 15px; background-position: 0 bottom; background-repeat: repeat-x;
                }
                .sb-cv-ruler-h::before {
                  content: '100......200......300......400......500......600......700......800......900......1000....1100....1200....1400....1600....1800....2000';
                  position: absolute; left: 100px; bottom: 12px; white-space: nowrap; letter-spacing: 2.2px;
                }
                .sb-cv-ruler-v {
                  border-right: 1px solid #d4d4d8;
                  background-image: linear-gradient(180deg, #e4e4e7 1px, transparent 1px), linear-gradient(180deg, #a1a1aa 1px, transparent 1px);
                  background-size: 8px 10px, 15px 100px; background-position: right 0; background-repeat: repeat-y;
                }
                .sb-cv-ruler-v::before {
                  content: '100 200 300 400 500 600 700 800 900 1000 1100 1200 1300 1400 1500';
                  position: absolute; top: 100px; right: 12px; width: 10px; word-break: break-all; line-height: 100px; text-align: right;
                }
                .sb-cv-ruler-corner { background-color: #e4e4e7; border-right: 1px solid #d4d4d8; border-bottom: 1px solid #d4d4d8; }

                ${isWindowMode ? `
                  html, body { margin: 0 !important; padding: 0 !important; }
                  #storybook-root { margin-top: 30px !important; margin-left: 30px !important; }
                  .sb-cv-ruler-corner { position: fixed; top: 0; left: 0; width: 30px; height: 30px; z-index: 1000000; }
                  .sb-cv-ruler-h { position: fixed; top: 0; left: 30px; right: 0; height: 30px; }
                  .sb-cv-ruler-v { position: fixed; top: 30px; left: 0; bottom: 0; width: 30px; }
                ` : `
                  .sb-cv-ruler-corner { position: absolute; top: 0; left: 0; width: 30px; height: 30px; }
                  .sb-cv-ruler-h { position: absolute; top: 0; left: 30px; right: 0; height: 30px; }
                  .sb-cv-ruler-v { position: absolute; top: 30px; left: 0; bottom: 0; width: 30px; }
                `}
              `}</style>
              <div className="sb-cv-ruler-corner" />
              <div className="sb-cv-ruler-h" />
              <div className="sb-cv-ruler-v" />
            </>
          )}

          {/* ────── 2. 隨滑鼠移動的十字線 ────── */}
          {isFollowMode && (
            <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999998 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: mousePos.y, height: '1px', borderTop: '1px dashed #ef4444' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: mousePos.x, width: '1px', borderLeft: '1px dashed #ef4444' }} />
              <div style={{
                position: 'absolute',
                left: mousePos.x + 10,
                top: mousePos.y + 10,
                background: 'rgba(239, 68, 68, 0.9)',
                color: '#fff',
                fontSize: '10px',
                fontFamily: 'monospace',
                padding: '2px 6px',
                borderRadius: '3px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {mousePos.x}px, {mousePos.y}px
              </div>
            </div>
          )}

          {/* ────── 3. 點擊固定的參考線 ────── */}
          {isClickMode && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999997, pointerEvents: 'none' }}>
              {fixedGuides.map((guide, index) => (
                <React.Fragment key={index}>
                  <div style={{ position: 'absolute', left: 0, right: 0, top: guide.y, height: '1px', borderTop: '1px solid #3b82f6' }}>
                    <span style={{ position: 'absolute', right: '10px', top: '-12px', fontSize: '9px', color: '#3b82f6', fontFamily: 'monospace' }}>Y: {guide.y}px</span>
                  </div>
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: guide.x, width: '1px', borderLeft: '1px solid #3b82f6' }}>
                    <span style={{ position: 'absolute', left: '4px', bottom: '10px', fontSize: '9px', color: '#3b82f6', fontFamily: 'monospace' }}>X: {guide.x}px</span>
                  </div>
                </React.Fragment>
              ))}

              {fixedGuides.length > 0 && (
                <button
                  onClick={clearFixedGuides}
                  style={{
                    position: 'fixed', bottom: '20px', right: '20px',
                    background: '#27272a', color: '#fff', border: 'none',
                    padding: '6px 12px', borderRadius: '4px', fontSize: '12px',
                    cursor: 'pointer', pointerEvents: 'auto', zIndex: 1000001,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                >
                  🧹 清除所有參考線 ({fixedGuides.length})
                </button>
              )}

              <div style={{ position: 'fixed', bottom: '20px', left: '20px', background: 'rgba(212, 212, 216, 0.8)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: '#3f3f46' }}>
                💡 在畫面上任意點擊即可固定十字輔助線
              </div>
            </div>
          )}

          <Story />
        </div>
      );
    },
  ],
};

export default preview;