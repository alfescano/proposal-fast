import { useBrandKit } from "@/hooks/useBrandKit";

/**
 * Example of integrating brand kit into proposal workflow
 * 
 * Use the brand kit to:
 * - Apply logo to PDF/proposal
 * - Apply brand colors to templates
 * - Add company info (name, address, phone, email)
 * - Add signature block
 * - Use brand fonts
 */
export function ProposalWithBrandKit() {
  const { brandKit, loading } = useBrandKit();

  if (loading || !brandKit) {
    return null;
  }

  return {
    // Apply logo to proposal header
    getLogoUrl: () => brandKit.logo_url,

    // Get brand colors for styling
    getBrandColors: () => ({
      primary: brandKit.primary_color,
      secondary: brandKit.secondary_color,
      accent: brandKit.accent_color,
    }),

    // Get company info for contract footer
    getCompanyInfo: () => ({
      name: brandKit.company_name,
      email: brandKit.company_email,
      phone: brandKit.company_phone,
      website: brandKit.company_website,
      address: brandKit.company_address,
    }),

    // Get signature block for contract signature section
    getSignatureBlock: () => brandKit.signature_block,

    // Get font for PDF generation
    getFontFamily: () => brandKit.font_family,

    // Example: Apply to PDF header
    applyBrandToPDF: () => {
      return {
        logo: brandKit.logo_url,
        colors: {
          primary: brandKit.primary_color,
          accent: brandKit.accent_color,
        },
        company: {
          name: brandKit.company_name,
          address: brandKit.company_address,
        },
      };
    },

    // Example: Apply to HTML template
    applyBrandToHTML: () => {
      return `
        <div style="border-color: ${brandKit.primary_color}; font-family: ${brandKit.font_family}">
          ${brandKit.logo_url ? `<img src="${brandKit.logo_url}" alt="Logo" />` : ""}
          <h1>${brandKit.company_name}</h1>
          <p>${brandKit.company_address}</p>
          <p>${brandKit.company_email}</p>
        </div>
      `;
    },
  };
}

/**
 * Usage in components:
 * 
 * import { useBrandKit } from "@/hooks/useBrandKit";
 * 
 * function ProposalPage() {
 *   const { brandKit } = useBrandKit();
 * 
 *   return (
 *     <div style={{
 *       borderColor: brandKit?.primary_color,
 *       fontFamily: brandKit?.font_family
 *     }}>
 *       {brandKit?.logo_url && (
 *         <img src={brandKit.logo_url} alt="Logo" />
 *       )}
 *       <h1>{brandKit?.company_name}</h1>
 *       <p>{brandKit?.company_address}</p>
 *     </div>
 *   );
 * }
 */
