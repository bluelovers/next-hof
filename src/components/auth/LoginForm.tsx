/**
 * LoginForm 登入表單元件
 * LoginForm component
 *
 * Hall of Rumor 風格的登入表單
 * Hall of Rumor styled login form
 */
import React, { useState } from 'react';
import './LoginForm.css';
import { buildAppUrl } from '#/components/config/AppConfig';

/** LoginForm 屬性 / LoginForm props */
export interface ILoginFormProps {
  /** 登入回調 / Login callback */
  onLogin?: (id: string, password: string) => void;
  /** 新遊戲連結 / New game URL */
  newGameUrl?: string;
  /** 初始 ID 值 / Initial ID value */
  defaultId?: string;
  /** 初始 PASS 值 / Initial password value */
  defaultPass?: string;
}

/**
 * LoginForm 登入表單元件
 * LoginForm component
 */
export const LoginForm: React.FC<ILoginFormProps> = ({
  onLogin,
  newGameUrl = buildAppUrl('/game/newgame'),
  defaultId = '',
  defaultPass = '',
}) => {
  const [id, setId] = useState(defaultId);
  const [pass, setPass] = useState(defaultPass);

  /** 處理登入 / Handle login */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin?.(id, pass);
  };

   return (
     <div className="login-form-wrapper">
       <h4>Login</h4>
       <form className="login-form" onSubmit={handleLogin}>
         <table>
           <tbody>
             <tr>
               <td><div className="text-right">ID:</div></td>
               <td>
                 <input
                   type="text"
                   maxLength={16}
                   className="text-input"
                   value={id}
                   onChange={(e) => setId(e.target.value)}
                   style={{ width: 160 }}
                 />
               </td>
             </tr>
             <tr>
               <td><div className="text-right">PASS:</div></td>
               <td>
                 <input
                   type="password"
                   maxLength={16}
                   className="text-input"
                   value={pass}
                   onChange={(e) => setPass(e.target.value)}
                   style={{ width: 160 }}
                 />
               </td>
             </tr>
             <tr>
               <td></td>
               <td>
                 <input type="submit" className="btn-login" value="login" style={{ width: 80 }} />
                 <a href={newGameUrl} className="newgame-link">NewGame?</a>
               </td>
             </tr>
           </tbody>
         </table>
       </form>
     </div>
   );
};
