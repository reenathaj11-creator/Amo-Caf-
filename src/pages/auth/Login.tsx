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
    <div className="min-h-screen bg-[#0a0a0a] flex font-sans">
      
      {/* Esquerda - Imagem Decorativa (Apenas Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 relative">
        <img 
          src={loginBg} 
          alt="Login Amo Café" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 xl:bottom-20 xl:left-20 text-white">
           <div className="w-16 h-16 rounded-full border border-white/40 flex flex-col items-center justify-center mb-4 bg-white/10 backdrop-blur-md shadow-inner">
             <h1 className="text-sm font-semibold text-white">AMO<span className="text-brand-400">♥</span></h1>
             <p className="text-[10px] italic text-brand-300">cafe+</p>
           </div>
           <h2 className="text-4xl xl:text-5xl font-bold tracking-tight mb-2">Amo Café Gestão</h2>
           <p className="text-lg xl:text-xl text-white/80 max-w-md">O sistema completo para gerenciar e escalar sua cafeteria com eficiência.</p>
        </div>
      </div>

      {/* Direita - Formulário de Login */}
      <div className="w-full lg:w-1/2 xl:w-5/12 flex items-center justify-center p-6 sm:p-12 relative">
        
        {/* Fundo escuro com leve blur para caso seja mobile (terá background diferente se quisermos, mas aqui mantemos clean) */}
        <div className="w-full max-w-[420px] mx-auto bg-white/5 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border border-white/10 lg:border-none p-8 sm:p-10 rounded-[2rem] lg:rounded-none shadow-2xl lg:shadow-none">
          
          <div className="text-center mb-8 lg:mb-10">
            <div className="lg:hidden w-16 h-16 rounded-full border border-white/40 flex flex-col items-center justify-center mx-auto mb-4 bg-white/5 backdrop-blur-sm shadow-inner">
               <h1 className="text-sm font-semibold text-white">AMO<span className="text-brand-400">♥</span></h1>
               <p className="text-[10px] italic text-brand-300">cafe+</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Bem-vindo de volta!</h2>
            <p className="text-white/60 mt-2 font-medium text-sm">Acesse sua conta para continuar.</p>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/90 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-brand-400" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: pdv@amocafe.com" 
                  className="h-12 pl-12 border-white/20 focus-visible:ring-brand-400 rounded-2xl bg-white/10 lg:bg-white/5 font-medium text-white placeholder:text-white/40 text-sm" 
                />
              </div>
              <p className="text-[11px] text-brand-400/80 font-medium pt-1 ml-1">*Dica: Use "pdv" no email para simular perfil de Caixa</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/90 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-brand-400" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="h-12 pl-12 border-white/20 focus-visible:ring-brand-400 rounded-2xl bg-white/10 lg:bg-white/5 font-medium text-white placeholder:text-white/40 tracking-widest text-sm" 
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
            
            <div className="pt-4">
              {errorMsg && (
                <p className="text-red-400 text-sm text-center mb-4 font-semibold bg-red-500/10 py-3 rounded-xl border border-red-500/20">{errorMsg}</p>
              )}
              <Button 
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-14 text-lg font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shadow-[0_4px_20px_0_rgba(201,91,100,0.4)] transition-all hover:-translate-y-0.5 group disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>
            </div>
            
            <div className="text-center pt-2">
              <button className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                Esqueceu sua senha?
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
