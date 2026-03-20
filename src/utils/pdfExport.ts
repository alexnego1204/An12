
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Exporta um elemento HTML para PDF com suporte a múltiplas páginas.
 * @param elementId O ID do elemento a ser exportado
 * @param filename O nome do arquivo PDF (sem extensão)
 */
export const exportToPdf = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento com ID "${elementId}" não encontrado.`);
    alert(`Erro: Não foi possível encontrar o conteúdo do relatório para exportar.`);
    return;
  }

  try {
    // Adiciona uma classe temporária para garantir que o estilo de impressão seja aplicado
    element.classList.add('pdf-printing');
    
    // Força o scroll para o topo para evitar problemas de captura
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    // Aguarda um momento para garantir que o DOM esteja pronto e animações terminadas
    await new Promise(resolve => setTimeout(resolve, 800));

    // Captura o elemento como uma imagem JPEG de alta qualidade
    const dataUrl = await htmlToImage.toJpeg(element, {
      quality: 0.95,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
      pixelRatio: 2, // Alta resolução
      style: {
        padding: '20px',
        overflow: 'visible',
      },
      // Filtra elementos que não devem aparecer no PDF
      filter: (node) => {
        if (node instanceof HTMLElement) {
          // Esconde botões e elementos com a classe no-print
          return !node.classList.contains('no-print') && node.tagName !== 'BUTTON';
        }
        return true;
      }
    });

    // Remove a classe temporária e restaura o scroll
    element.classList.remove('pdf-printing');
    window.scrollTo(0, originalScrollY);

    // Cria o PDF com suporte a múltiplas páginas (A4)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    // Primeira página
    pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    // Páginas subsequentes (se o conteúdo for longo)
    while (heightLeft >= 0) {
      position = heightLeft - pageHeight; // Ajuste na posição para a próxima página
      pdf.addPage();
      pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
    console.log(`PDF "${filename}.pdf" gerado com sucesso.`);
  } catch (error: any) {
    element.classList.remove('pdf-printing');
    console.error('Erro ao gerar PDF:', error);
    alert(`Erro ao gerar o relatório PDF: ${error.message || 'Erro desconhecido'}. Por favor, tente novamente.`);
  }
};
