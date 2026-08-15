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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-2 sm:p-6 font-sans">
      
      {/* Contêiner que abraça exatamente o tamanho da imagem, garantindo que NUNCA haja corte */}
      <div className="relative inline-block max-w-full max-h-[95vh] rounded-[2rem] overflow-hidden shadow-2xl">
        
        {/* A imagem define o tamanho real do contêiner */}
        <img 
          src={loginBg} 
          alt="Login Amo Café" 
          className="block w-auto max-w-full h-auto max-h-[95vh] object-contain"
        />

        {/* Camada do Formulário Absoluta alinhada perfeitamente na imagem */}
        <div className="absolute inset-y-0 right-0 w-[45%] flex flex-col justify-center px-4 sm:px-8 lg:px-12 xl:px-16 pb-8">
          
          <div className="w-full max-w-[400px] mx-auto bg-white/10 backdrop-blur-xl border border-white/10 p-6 sm:p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/40 flex flex-col items-center justify-center mx-auto mb-3 bg-white/5 backdrop-blur-sm shadow-inner">
                 <h1 className="text-sm sm:text-lg font-semibold text-white">AMO<span className="text-brand-400">♥</span></h1>
                 <p className="text-[10px] sm:text-xs italic text-brand-300">cafe+</p>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Bem-vindo de volta!</h2>
              <p className="text-brand-300 mt-1 font-medium text-xs sm:text-sm">Acesse sua conta para continuar.</p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-white/90 ml-1 drop-shadow-sm">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-brand-400" />
                  <Input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: pdv@amocafe.com" 
                    className="h-11 sm:h-12 pl-10 sm:pl-12 border-white/20 focus-visible:ring-brand-400 rounded-2xl bg-white/20 backdrop-blur-sm font-medium text-white placeholder:text-white/60 shadow-inner text-sm" 
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] text-brand-300 font-medium pt-1 ml-1 drop-shadow-sm">*Dica: Use "pdv" no email para simular perfil de Caixa</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-white/90 ml-1 drop-shadow-sm">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-brand-400" />
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="h-11 sm:h-12 pl-10 sm:pl-12 border-white/20 focus-visible:ring-brand-400 rounded-2xl bg-white/20 backdrop-blur-sm font-medium text-white placeholder:text-white/60 tracking-widest shadow-inner text-sm" 
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>
              
              <div className="pt-2 sm:pt-4">
                {errorMsg && (
                  <p className="text-red-400 text-sm text-center mb-3 font-semibold bg-red-500/10 py-2 rounded-lg border border-red-500/20">{errorMsg}</p>
                )}
                <Button 
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shadow-[0_4px_14px_0_rgba(201,91,100,0.39)] transition-all hover:-translate-y-0.5 group border border-brand-400/50 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  {loading ? 'Entrando...' : 'Entrar no Sistema'}
                </Button>
              </div>
              
              <div className="text-center pt-1 sm:pt-2">
                <button className="text-xs sm:text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Esqueceu sua senha?
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
