import React, { createContext, useContext, useState, useEffect } from 'react';

export type CashOperationType = 'ABERTURA' | 'FECHAMENTO' | 'SANGRIA' | 'SUPRIMENTO' | 'VENDA';

export interface CashOperation {
  id: string;
  type: CashOperationType;
  amount: number;
  description?: string;
  timestamp: Date;
  user_email?: string;
}

interface CashRegisterContextType {
  isOpen: boolean;
  currentBalance: number;
  operations: CashOperation[];
  openRegister: (initialAmount: number) => void;
  closeRegister: (closingAmount: number) => void;
  addOperation: (type: CashOperationType, amount: number, description?: string) => void;
}

const CashRegisterContext = createContext<CashRegisterContextType | undefined>(undefined);

export function CashRegisterProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('@amocafe:cashRegister_isOpen');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [currentBalance, setCurrentBalance] = useState(() => {
    const saved = localStorage.getItem('@amocafe:cashRegister_balance');
    return saved ? JSON.parse(saved) : 0;
  });
  
  const [operations, setOperations] = useState<CashOperation[]>(() => {
    const saved = localStorage.getItem('@amocafe:cashRegister_operations');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((op: any) => ({ ...op, timestamp: new Date(op.timestamp) }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('@amocafe:cashRegister_isOpen', JSON.stringify(isOpen));
    localStorage.setItem('@amocafe:cashRegister_balance', JSON.stringify(currentBalance));
    localStorage.setItem('@amocafe:cashRegister_operations', JSON.stringify(operations));
  }, [isOpen, currentBalance, operations]);

  const addOperation = (type: CashOperationType, amount: number, description?: string) => {
    const user_email = localStorage.getItem('@amocafe:user') || 'Usuário Local';
    const operation: CashOperation = {
      id: crypto.randomUUID(),
      type,
      amount,
      description,
      timestamp: new Date(),
      user_email,
    };
    
    setOperations(prev => [...prev, operation]);
    
    if (type === 'SANGRIA' || type === 'FECHAMENTO') {
      setCurrentBalance(prev => prev - amount);
    } else {
      setCurrentBalance(prev => prev + amount);
    }
  };

  const openRegister = (initialAmount: number) => {
    setIsOpen(true);
    // Não limpa mais as operações (setOperations([])) para mantermos o histórico de várias sessões!
    setCurrentBalance(0); // Reseta o saldo local antes de adicionar a abertura
    addOperation('ABERTURA', initialAmount, 'Abertura de Caixa');
  };

  const closeRegister = (closingAmount: number) => {
    addOperation('FECHAMENTO', currentBalance, `Fechamento de Caixa. Informado: R$ ${closingAmount}`);
    setIsOpen(false);
  };

  return (
    <CashRegisterContext.Provider
      value={{
        isOpen,
        currentBalance,
        operations,
        openRegister,
        closeRegister,
        addOperation,
      }}
    >
      {children}
    </CashRegisterContext.Provider>
  );
}

export function useCashRegister() {
  const context = useContext(CashRegisterContext);
  if (context === undefined) {
    throw new Error('useCashRegister must be used within a CashRegisterProvider');
  }
  return context;
}
