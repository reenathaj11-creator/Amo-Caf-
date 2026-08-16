import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn } from 'lucide-react';
import { supabase } from '@/services/supabase/client';

import loginBg from '@/assets/login-bg-dark.jpg';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Buscar o perfil do usuário para saber o cargo (admin ou pdv)
      let role = 'pdv'; // Default
      
      if (authData.user) {
         const { data: profileData } = await supabase
           .from('profiles')
           .select('role')
           .eq('id', authData.user.id)
           .single();
           
         if (profileData && profileData.role) {
           role = profileData.role;
         } else {
           // Se o perfil não existir ainda (ex: acabou de criar a conta no auth), 
           // cria um perfil padrão para ele
           const isPdvEmail = authData.user.email?.toLowerCase().includes('pdv');
           const initialRole = isPdvEmail ? 'pdv' : 'admin';
           
           await supabase.from('profiles').insert([
             { id: authData.user.id, email: authData.user.email, role: initialRole }
           ]);
           role = initialRole;
         }
      }

      localStorage.setItem('@amocafe:role', role);
      localStorage.setItem('@amocafe:user', email);

      if (role === 'pdv') {
        navigate('/pos');
      } else {
        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Erro no login:', error.message);
      setErrorMsg('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      
      {/* Background Decorativo com Ícones Flutuantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ícones espalhados */}
        <HeartIcon className="absolute top-[10%] left-[15%] w-8 h-8 text-brand-300/40 -rotate-12" />
        <CoffeeIcon className="absolute top-[20%] right-[20%] w-12 h-12 text-brand-300/40 rotate-12" />
        <HeartIcon className="absolute top-[40%] right-[10%] w-6 h-6 text-brand-300/30 rotate-45" />
        <CoffeeIcon className="absolute bottom-[25%] left-[10%] w-16 h-16 text-brand-300/30 -rotate-12" />
        <HeartIcon className="absolute bottom-[15%] right-[25%] w-10 h-10 text-brand-300/40 -rotate-45" />
        <HeartIcon className="absolute top-[60%] left-[5%] w-5 h-5 text-brand-300/30 rotate-12" />
        <CoffeeIcon className="absolute top-[5%] right-[5%] w-8 h-8 text-brand-300/20 -rotate-6" />
        
        {/* Pontilhados (Simulados com div) */}
        <div className="absolute top-[15%] right-[30%] w-1.5 h-1.5 rounded-full bg-brand-300/50" />
        <div className="absolute top-[30%] left-[25%] w-2 h-2 rounded-full bg-brand-300/40" />
        <div className="absolute bottom-[35%] right-[15%] w-1.5 h-1.5 rounded-full bg-brand-300/50" />
        <div className="absolute bottom-[10%] left-[30%] w-2 h-2 rounded-full bg-brand-300/40" />
      </div>

      {/* Conteúdo Central */}
      <div className="relative z-10 w-full max-w-[440px] px-6 flex flex-col items-center">
        
        {/* Logo */}
        <div className="w-28 h-28 rounded-full border border-brand-200 bg-white flex flex-col items-center justify-center mb-8 shadow-sm">
           <h1 className="text-xl font-semibold text-coffee-900">AMO<span className="text-brand-400">♥</span></h1>
           <p className="text-xs italic text-brand-400 font-medium">cafe+</p>
        </div>

        {/* Card do Formulário */}
        <div className="w-full bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-50/50">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-coffee-950">Bem-vindo!</h2>
            <p className="text-coffee-500 mt-1.5 font-medium text-sm">Acesse sua conta para continuar.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-coffee-800 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-brand-400" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: pdv@amocafe.com" 
                  className="h-12 pl-12 border-slate-200 focus-visible:ring-brand-400 rounded-2xl bg-slate-50/50 font-medium text-coffee-900 placeholder:text-slate-400 text-sm transition-colors hover:bg-white" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-coffee-800">Senha</label>
                <button className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors">
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-brand-400" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-12 pl-12 border-slate-200 focus-visible:ring-brand-400 rounded-2xl bg-slate-50/50 font-medium text-coffee-900 placeholder:text-slate-400 tracking-widest text-sm transition-colors hover:bg-white" 
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
            
            <div className="pt-2">
              {errorMsg && (
                <p className="text-red-500 text-sm text-center mb-4 font-semibold bg-red-50 py-3 rounded-xl border border-red-100">{errorMsg}</p>
              )}
              <Button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-14 text-lg font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shadow-[0_4px_20px_0_rgba(201,91,100,0.3)] transition-all hover:-translate-y-0.5 group disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes de Ícones para o Background Decorativo
function HeartIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function CoffeeIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
  );
}
