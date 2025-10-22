import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { BrandKit } from "@/lib/brandKitService";

export interface PDFOptions {
  filename: string;
  title?: string;
  content: string;
  brandKit?: BrandKit | null;
  clientName?: string;
  contractType?: string;
}

/**
 * Generate PDF with brand kit styling applied
 */
export async function generatePDFWithBrandKit(options: PDFOptions): Promise<void> {
  const {
    filename,
    title,
    content,
    brandKit,
    clientName,
    contractType,
  } = options;

  try {
    // Create container for PDF content
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "210mm";
    container.style.height = "297mm";
    container.style.background = brandKit?.secondary_color || "#ffffff";
    container.style.color = brandKit?.primary_color || "#000000";
    container.style.fontFamily = getFontStack(brandKit?.font_family);
    container.style.padding = "20mm";
    container.style.overflow = "hidden";

    // Header with logo and company info
    const header = document.createElement("div");
    header.style.marginBottom = "20px";
    header.style.borderBottom = `3px solid ${brandKit?.accent_color || "#3b82f6"}`;
    header.style.paddingBottom = "15px";

    // Logo
    if (brandKit?.logo_url) {
      const logo = document.createElement("img");
      logo.src = brandKit.logo_url;
      logo.style.maxHeight = "40mm";
      logo.style.maxWidth = "100%";
      logo.style.objectFit = "contain";
      logo.style.marginBottom = "10px";
      header.appendChild(logo);
    }

    // Company name and info
    if (brandKit?.company_name) {
      const companyName = document.createElement("h1");
      companyName.textContent = brandKit.company_name;
      companyName.style.margin = "0";
      companyName.style.color = brandKit.primary_color;
      companyName.style.fontSize = "24px";
      companyName.style.fontWeight = "bold";
      header.appendChild(companyName);

      const companyInfo = document.createElement("div");
      companyInfo.style.marginTop = "8px";
      companyInfo.style.fontSize = "10px";
      companyInfo.style.color = brandKit.primary_color;
      companyInfo.style.opacity = "0.7";

      const infoLines = [];
      if (brandKit.company_email) infoLines.push(brandKit.company_email);
      if (brandKit.company_phone) infoLines.push(brandKit.company_phone);
      if (brandKit.company_website) infoLines.push(brandKit.company_website);

      companyInfo.innerHTML = infoLines.join(" • ");
      header.appendChild(companyInfo);
    }

    container.appendChild(header);

    // Title section
    if (title || contractType) {
      const titleDiv = document.createElement("div");
      titleDiv.style.marginTop = "20px";
      titleDiv.style.marginBottom = "20px";

      const titleText = document.createElement("h2");
      titleText.textContent = title || `${contractType} Contract`;
      titleText.style.margin = "0";
      titleText.style.color = brandKit?.primary_color || "#000000";
      titleText.style.fontSize = "18px";
      titleText.style.fontWeight = "bold";
      titleDiv.appendChild(titleText);

      if (clientName) {
        const clientDiv = document.createElement("p");
        clientDiv.textContent = `Client: ${clientName}`;
        clientDiv.style.margin = "5px 0 0 0";
        clientDiv.style.color = brandKit?.primary_color || "#000000";
        clientDiv.style.fontSize = "12px";
        titleDiv.appendChild(clientDiv);
      }

      container.appendChild(titleDiv);
    }

    // Main content
    const contentDiv = document.createElement("div");
    contentDiv.style.fontSize = "11px";
    contentDiv.style.lineHeight = "1.6";
    contentDiv.style.whiteSpace = "pre-wrap";
    contentDiv.style.wordWrap = "break-word";
    contentDiv.textContent = content;
    container.appendChild(contentDiv);

    // Footer with signature block
    if (brandKit?.signature_block) {
      const footer = document.createElement("div");
      footer.style.marginTop = "30px";
      footer.style.paddingTop = "15px";
      footer.style.borderTop = `1px solid ${brandKit.accent_color || "#3b82f6"}`;
      footer.style.fontSize = "10px";
      footer.style.color = brandKit.primary_color;
      footer.style.whiteSpace = "pre-wrap";
      footer.textContent = brandKit.signature_block;
      container.appendChild(footer);
    }

    document.body.appendChild(container);

    // Convert to canvas and PDF
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: brandKit?.secondary_color || "#ffffff",
      useCORS: true,
      letterRendering: true,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 0;
    let remainingHeight = imgHeight;

    // Add image with pagination if needed
    while (remainingHeight > 0) {
      const maxHeight = pdfHeight - 20; // 10mm margins
      const heightToPrint = Math.min(remainingHeight, maxHeight);
      const sourceY = imgHeight - remainingHeight;

      // Calculate crop region
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = canvas.width;
      cropCanvas.height = (heightToPrint / imgWidth) * canvas.width;

      const ctx = cropCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          canvas,
          0,
          (sourceY / imgHeight) * canvas.height,
          canvas.width,
          cropCanvas.height,
          0,
          0,
          canvas.width,
          cropCanvas.height
        );

        const croppedData = cropCanvas.toDataURL("image/png");
        pdf.addImage(croppedData, "PNG", 10, 10, imgWidth, heightToPrint);
      }

      remainingHeight -= heightToPrint;
      if (remainingHeight > 0) {
        pdf.addPage();
      }
    }

    pdf.save(filename);
    document.body.removeChild(container);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

/**
 * Get font stack for HTML based on font_family setting
 */
function getFontStack(fontFamily?: string): string {
  const stacks: Record<string, string> = {
    inter: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    sistema: "'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', sans-serif",
    courier: "'Courier New', 'Courier', monospace",
    georgia: "'Georgia', serif",
    times: "'Times New Roman', 'Times', serif",
  };

  return stacks[fontFamily || "inter"] || stacks.inter;
}

/**
 * Apply brand kit styles to HTML element for preview
 */
export function applyBrandKitToElement(
  element: HTMLElement,
  brandKit: BrandKit | null
): void {
  if (!brandKit) return;

  element.style.backgroundColor = brandKit.secondary_color;
  element.style.color = brandKit.primary_color;
  element.style.fontFamily = getFontStack(brandKit.font_family);
  element.style.borderColor = brandKit.accent_color;
}

/**
 * Create branded header HTML
 */
export function createBrandedHeader(brandKit: BrandKit | null): string {
  if (!brandKit) return "";

  let header = `<div style="border-bottom: 3px solid ${brandKit.accent_color}; padding-bottom: 15px; margin-bottom: 20px;">`;

  if (brandKit.logo_url) {
    header += `<img src="${brandKit.logo_url}" alt="Logo" style="max-height: 40px; margin-bottom: 10px;" />`;
  }

  if (brandKit.company_name) {
    header += `<h1 style="color: ${brandKit.primary_color}; margin: 0 0 8px 0; font-size: 24px;">${brandKit.company_name}</h1>`;

    const info = [];
    if (brandKit.company_email) info.push(brandKit.company_email);
    if (brandKit.company_phone) info.push(brandKit.company_phone);
    if (brandKit.company_website) info.push(brandKit.company_website);

    if (info.length > 0) {
      header += `<div style="color: ${brandKit.primary_color}; opacity: 0.7; font-size: 12px;">${info.join(" • ")}</div>`;
    }
  }

  header += "</div>";
  return header;
}

/**
 * Create branded footer HTML
 */
export function createBrandedFooter(brandKit: BrandKit | null): string {
  if (!brandKit || !brandKit.signature_block) return "";

  return `
    <div style="border-top: 1px solid ${brandKit.accent_color}; padding-top: 15px; margin-top: 30px; font-size: 10px; color: ${brandKit.primary_color}; white-space: pre-wrap;">
      ${brandKit.signature_block}
    </div>
  `;
}
