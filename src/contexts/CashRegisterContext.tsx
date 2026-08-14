import React, { createContext, useContext, useState } from 'react';

export type CashOperationType = 'ABERTURA' | 'FECHAMENTO' | 'SANGRIA' | 'SUPRIMENTO' | 'VENDA';

export interface CashOperation {
  id: string;
  type: CashOperationType;
  amount: number;
  description?: string;
  timestamp: Date;
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
  const [isOpen, setIsOpen] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [operations, setOperations] = useState<CashOperation[]>([]);

  const addOperation = (type: CashOperationType, amount: number, description?: string) => {
    const operation: CashOperation = {
      id: crypto.randomUUID(),
      type,
      amount,
      description,
      timestamp: new Date(),
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
    setOperations([]);
    setCurrentBalance(0); // Reseta antes de adicionar a abertura
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
