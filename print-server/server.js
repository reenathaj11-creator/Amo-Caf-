const express = require('express');
const cors = require('cors');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

const app = express();
app.use(cors());
app.use(express.json());

// Nome da impressora instalada no Windows (ou nome de compartilhamento)
// É possível passar pelo header ou fixar aqui
const PRINTER_INTERFACE = "BEMATECH";

const fs = require('fs');
const { exec } = require('child_process');

function getPrinter() {
  return new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://127.0.0.1:9090', // "Dummy" interface só para enganar a biblioteca. Não vai conectar aqui.
    characterSet: 'PC860_PORTUGUESE', // Necessário para a biblioteca não dar erro de undefined
    removeSpecialCharacters: false,
    lineCharacter: "-",
    width: 32, // Força a largura para 32 caracteres (evita quebra de linha em bobina de 58mm)
  });
}

// Função auxiliar para enviar direto pro Windows sem precisar de driver nativo do Node
function printBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const tempFile = 'receipt_temp.bin';
    fs.writeFileSync(tempFile, buffer);
    
    // Comando nativo do Windows para enviar um arquivo binário para a impressora compartilhada
    exec(`copy /B receipt_temp.bin \\\\localhost\\${PRINTER_INTERFACE}`, (error) => {
      if (error) {
        console.error("Erro no comando COPY:", error);
        return reject(error);
      }
      resolve();
    });
  });
}

// 1. Rota para imprimir o recibo (2 Vias)
app.post('/print', async (req, res) => {
  try {
    const data = req.body;
    let printer = getPrinter();

    // Extrair apenas os números do orderId e pegar os primeiros 4 dígitos
    let numbersOnly = data.orderId.replace(/\D/g, '');
    if (numbersOnly.length < 4) numbersOnly = (numbersOnly + "0000");
    const senha = numbersOnly.substring(0, 4);

    // ==========================================
    // VIA DO BALCÃO
    // ==========================================
    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println("VIA DO BALCAO");
    printer.bold(false);
    printer.setTextNormal();
    printer.drawLine();

    printer.alignLeft();
    printer.setTextSize(1, 1);
    printer.println(`SENHA: ${senha}`);
    printer.setTextNormal();
    printer.println(`Caixa: ${data.cashierName}`);
    printer.println(`Data: ${new Date().toLocaleString('pt-BR')}`);
    printer.drawLine();

    printer.bold(true);
    printer.println("ITENS PARA PREPARO:");
    
    data.items.forEach(item => {
      printer.setTextSize(1, 1); // Texto maior
      printer.bold(true); // Negrito
      printer.println(`${item.quantity}x ${item.name}`);
      
      printer.setTextNormal(); // Volta ao tamanho normal para os modificadores
      printer.bold(false);
      
      if (item.modifiers && item.modifiers.length > 0) {
        item.modifiers.forEach(mod => {
          printer.println(`   + ${mod}`);
        });
      }
    });
    
    printer.drawLine();
    printer.println("");
    printer.cut();

    // ==========================================
    // VIA DO CLIENTE
    // ==========================================
    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println("AMO CAFE +");
    printer.bold(false);
    printer.setTextNormal();
    printer.println("Rua Santos Dumont, 888 - Niteroi");
    printer.drawLine();

    printer.alignCenter();
    printer.setTextSize(1, 1);
    printer.println(`SENHA PARA RETIRADA:`);
    printer.bold(true);
    printer.setTextSize(2, 2);
    printer.println(`${senha}`);
    printer.bold(false);
    printer.setTextNormal();
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Data: ${new Date().toLocaleString('pt-BR')}`);
    printer.drawLine();

    printer.tableCustom([
      { text: "Qtd", align: "LEFT", width: 0.1 },
      { text: "Item", align: "LEFT", width: 0.6 },
      { text: "Total", align: "RIGHT", width: 0.25 }
    ]);
    
    data.items.forEach(item => {
      printer.tableCustom([
        { text: item.quantity.toString(), align: "LEFT", width: 0.1 },
        { text: item.name.substring(0, 20), align: "LEFT", width: 0.6 },
        { text: `R$ ${item.subtotal.toFixed(2)}`, align: "RIGHT", width: 0.25 }
      ]);
      if (item.modifiers && item.modifiers.length > 0) {
        item.modifiers.forEach(mod => {
          printer.println(`   + ${mod}`);
        });
      }
    });
    
    printer.drawLine();

    printer.alignRight();
    printer.println(`Subtotal: R$ ${data.subtotal.toFixed(2)}`);
    if (data.discount > 0) {
      printer.println(`Desconto: R$ ${data.discount.toFixed(2)}`);
    }
    printer.bold(true);
    printer.println(`TOTAL: R$ ${data.total.toFixed(2)}`);
    printer.bold(false);
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Forma de Pagamento: ${data.paymentMethod}`);
    if (data.cashReceived !== undefined && data.change !== undefined) {
      printer.println(`Valor Recebido: R$ ${data.cashReceived.toFixed(2)}`);
      printer.println(`Troco: R$ ${data.change.toFixed(2)}`);
    }

    printer.drawLine();
    printer.alignCenter();
    printer.println("Aguarde ser chamado pela senha!");
    printer.println("Obrigado pela preferencia!");

    printer.cut();

    if (data.paymentMethod === 'Dinheiro') {
      printer.openCashDrawer();
    }

    // Pega o buffer cru de comandos e envia direto pelo Windows
    let buffer = printer.getBuffer();
    await printBuffer(buffer);
    
    return res.json({ success: true, message: "Impresso com sucesso (2 Vias)." });

  } catch (error) {
    console.error("Erro na impressão:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. Rota para ABRIR GAVETA avulsa (ex: sangria)
app.post('/drawer', async (req, res) => {
  try {
    let printer = getPrinter();
    printer.openCashDrawer();
    
    let buffer = printer.getBuffer();
    await printBuffer(buffer);

    return res.json({ success: true, message: "Gaveta aberta." });
  } catch (error) {
    console.error("Erro ao abrir gaveta:", error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;

// 3. Rota para imprimir RELATORIO DE FECHAMENTO
app.post('/print-report', async (req, res) => {
  try {
    const data = req.body;
    let printer = getPrinter();

    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println("AMO CAFE +");
    printer.setTextNormal();
    printer.println("RELATORIO DE FECHAMENTO DE CAIXA");
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Data: ${new Date().toLocaleString('pt-BR')}`);
    if (data.cashierName) printer.println(`Caixa: ${data.cashierName}`);
    printer.drawLine();

    printer.bold(true);
    printer.println("RESUMO DE VENDAS");
    printer.bold(false);
    printer.tableCustom([
      { text: "Dinheiro:", align: "LEFT", width: 0.5 },
      { text: `R$ ${data.dinheiro.toFixed(2)}`, align: "RIGHT", width: 0.5 }
    ]);
    printer.tableCustom([
      { text: "PIX:", align: "LEFT", width: 0.5 },
      { text: `R$ ${data.pix.toFixed(2)}`, align: "RIGHT", width: 0.5 }
    ]);
    printer.tableCustom([
      { text: "Cartoes:", align: "LEFT", width: 0.5 },
      { text: `R$ ${data.cartoes.toFixed(2)}`, align: "RIGHT", width: 0.5 }
    ]);
    if (data.naConta > 0) {
      printer.tableCustom([
        { text: "Na Conta (Fiado):", align: "LEFT", width: 0.5 },
        { text: `R$ ${data.naConta.toFixed(2)}`, align: "RIGHT", width: 0.5 }
      ]);
    }
    printer.drawLine();
    printer.bold(true);
    printer.tableCustom([
      { text: "TOTAL DE VENDAS:", align: "LEFT", width: 0.5 },
      { text: `R$ ${data.totalVendas.toFixed(2)}`, align: "RIGHT", width: 0.5 }
    ]);
    printer.bold(false);
    printer.drawLine();

    printer.bold(true);
    printer.println("MOVIMENTACAO DE GAVETA");
    printer.bold(false);
    printer.tableCustom([
      { text: "Abertura:", align: "LEFT", width: 0.6 },
      { text: `R$ ${data.abertura.toFixed(2)}`, align: "RIGHT", width: 0.4 }
    ]);
    printer.tableCustom([
      { text: "Suprimento (+):", align: "LEFT", width: 0.6 },
      { text: `R$ ${data.suprimentos.toFixed(2)}`, align: "RIGHT", width: 0.4 }
    ]);
    printer.tableCustom([
      { text: "Sangria (-):", align: "LEFT", width: 0.6 },
      { text: `R$ ${data.sangrias.toFixed(2)}`, align: "RIGHT", width: 0.4 }
    ]);
    printer.drawLine();
    
    printer.bold(true);
    printer.tableCustom([
      { text: "SALDO ESPERADO GAVETA:", align: "LEFT", width: 0.6 },
      { text: `R$ ${data.saldoEsperado.toFixed(2)}`, align: "RIGHT", width: 0.4 }
    ]);
    printer.tableCustom([
      { text: "SALDO INFORMADO GAVETA:", align: "LEFT", width: 0.6 },
      { text: `R$ ${data.saldoInformado.toFixed(2)}`, align: "RIGHT", width: 0.4 }
    ]);
    printer.bold(false);

    let diferenca = data.saldoInformado - data.saldoEsperado;
    if (diferenca !== 0) {
       printer.drawLine();
       printer.tableCustom([
         { text: "DIFERENCA:", align: "LEFT", width: 0.5 },
         { text: `R$ ${diferenca.toFixed(2)}`, align: "RIGHT", width: 0.5 }
       ]);
    }

    printer.drawLine();
    printer.println("");
    printer.cut();

    let buffer = printer.getBuffer();
    await printBuffer(buffer);
    
    return res.json({ success: true, message: "Relatorio impresso com sucesso." });

  } catch (error) {
    console.error("Erro na impressão do relatorio:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`=====================================`);
  console.log(`🖨️ AMO CAFE + (Versão Atualizada!)`);
  console.log(`Porta: ${PORT}`);
  console.log(`Aguardando conexões do PDV Web...`);
  console.log(`=====================================`);
});
