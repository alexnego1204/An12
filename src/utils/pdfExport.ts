
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportToPdf = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    // Adiciona uma classe temporária para garantir que o estilo de impressão seja aplicado
    element.classList.add('pdf-printing');

    const scale = window.innerWidth > 768 ? 2 : 1.5;
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
      onclone: (clonedDoc) => {
        // Ajustes finos no clone para o PDF
        const el = clonedDoc.getElementById(elementId);
        if (el) el.style.padding = '20px';
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / scale, canvas.height / scale]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / scale, canvas.height / scale);
    pdf.save(`${filename}.pdf`);
    
    element.classList.remove('pdf-printing');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  }
};
