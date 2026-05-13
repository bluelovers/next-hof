/**
 * MessageBoard 留言板元件
 * MessageBoard component
 *
 * 広場（廣場）的留言板，包含文字輸入與送出按鈕
 * Plaza message board with text input and post button
 */
import React, { useState } from 'react';
import './MessageBoard.css';

/** MessageBoard 屬性 / MessageBoard props */
export interface IMessageBoardProps {
  /** 標題 / Title */
  title?: string;
  /** 留言輸入框 placeholder / Input placeholder */
  placeholder?: string;
  /** 按鈕文字 / Button text */
  buttonText?: string;
  /** 送出回調 / Post callback */
  onPost?: (message: string) => void;
  /** 歷史留言 / Historical messages */
  messages?: string[];
}

/**
 * MessageBoard 留言板元件
 * MessageBoard component
 */
export const MessageBoard: React.FC<IMessageBoardProps> = ({
  title = '広場',
  placeholder = '',
  buttonText = 'post',
  onPost,
  messages = [],
}) => {
  const [input, setInput] = useState('');

  /** 處理送出 / Handle post */
  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onPost?.(input);
      setInput('');
    }
  };

  return (
    <div className="town-message-board">
      <h4 className="town-message-board-title">{title}</h4>
      <div className="town-message-board-content">
        {/* 歷史留言 / Historical messages */}
        {messages.length > 0 && (
          <div className="town-messages">
            {messages.map((msg, i) => (
              <div key={i} className="town-message-item">
                {msg}
              </div>
            ))}
          </div>
        )}

        {/* 輸入表單 / Input form */}
        <form className="town-message-form" onSubmit={handlePost}>
          <input
            type="text"
            className="town-message-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            maxLength={200}
          />
          <button type="submit" className="town-message-button">
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};
