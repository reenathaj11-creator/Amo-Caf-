export interface PrintReceiptParams {
  orderId: string;
  items: { name: string; quantity: number; subtotal: number; modifiers?: string[] }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cashReceived?: number;
  change?: number;
  cashierName: string;
  isToGo?: boolean;
  isPreCheckout?: boolean;
}

export interface PrintReportParams {
  cashierName: string;
  dinheiro: number;
  pix: number;
  cartoes: number;
  naConta: number;
  totalVendas: number;
  abertura: number;
  suprimentos: number;
  sangrias: number;
  saldoEsperado: number;
  saldoInformado: number;
}

const PRINT_SERVER_URL = "http://localhost:3001";

class PrinterService {
  async printReceipt(params: PrintReceiptParams): Promise<boolean> {
    try {
      const response = await fetch(`${PRINT_SERVER_URL}/print`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error("Servidor de impressão retornou erro.");
      }
      return true;
    } catch {
      console.warn("⚠️ Servidor de impressão não encontrado. Mostrando cupom no console para simulação:");
      this.simulateConsolePrint(params);
      return false; // Retorna false para indicar que não imprimiu na vida real, mas a venda não trava
    }
  }

  async openCashDrawer(): Promise<boolean> {
    try {
      const response = await fetch(`${PRINT_SERVER_URL}/drawer`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error("Erro ao abrir gaveta via servidor.");
      }
      return true;
    } catch {
      console.warn("⚠️ Servidor não encontrado. Simulando abertura de gaveta.");
      return false;
    }
  }

  async printClosingReport(params: PrintReportParams): Promise<boolean> {
    try {
      const response = await fetch(`${PRINT_SERVER_URL}/print-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) {
        throw new Error("Erro no servidor de impressão.");
      }
      return true;
    } catch {
      console.warn("⚠️ Servidor de impressão não encontrado. Simulando relatório.");
      return false;
    }
  }

  private simulateConsolePrint(params: PrintReceiptParams) {
    console.log("=====================================");
    console.log("            AMO CAFÉ");
    console.log("=====================================");
    console.log(`Pedido #${params.orderId}`);
    console.log(`Caixa: ${params.cashierName}`);
    console.log(`Data: ${new Date().toLocaleString()}`);
    console.log("-------------------------------------");
    params.items.forEach(item => {
      console.log(`${item.quantity}x ${item.name.padEnd(20)} R$ ${item.subtotal.toFixed(2)}`);
      if (item.modifiers && item.modifiers.length > 0) {
        item.modifiers.forEach(mod => console.log(`   + ${mod}`));
      }
    });
    console.log("-------------------------------------");
    console.log(`Subtotal: R$ ${params.subtotal.toFixed(2)}`);
    if (params.discount > 0) {
      console.log(`Desconto: R$ ${params.discount.toFixed(2)}`);
    }
    console.log(`Total:    R$ ${params.total.toFixed(2)}`);
    console.log("-------------------------------------");
    console.log(`Pago em:  ${params.paymentMethod}`);
    if (params.cashReceived !== undefined && params.change !== undefined) {
      console.log(`Recebido: R$ ${params.cashReceived.toFixed(2)}`);
      console.log(`Troco:    R$ ${params.change.toFixed(2)}`);
    }
    console.log("=====================================");
  }
}

export const printerService = new PrinterService();
