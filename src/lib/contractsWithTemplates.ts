import { getTemplates, getTemplate, type ContractTemplate } from "@/lib/brandKitService";

/**
 * Replace template variables with actual values
 * Supports: {clientName}, {amount}, {date}, {freelancerName}, {projectScope}
 */
export function replaceTemplateVariables(
  content: string,
  variables: Record<string, any>
): string {
  let result = content;

  // Replace all placeholder variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, "g");
    result = result.replace(regex, value || "");
  });

  return result;
}

/**
 * Get all user templates grouped by type
 */
export async function getTemplatesByType(userId: string): Promise<Record<string, ContractTemplate[]>> {
  try {
    const templates = await getTemplates(userId);
    const grouped: Record<string, ContractTemplate[]> = {};

    templates.forEach((template) => {
      if (!grouped[template.contract_type]) {
        grouped[template.contract_type] = [];
      }
      grouped[template.contract_type].push(template);
    });

    return grouped;
  } catch (error) {
    console.error("Error grouping templates:", error);
    return {};
  }
}

/**
 * Apply template to contract with variable substitution
 */
export async function applyTemplate(
  templateId: string,
  variables: {
    clientName?: string;
    freelancerName?: string;
    projectScope?: string;
    budget?: string;
    timeline?: string;
    date?: string;
    [key: string]: any;
  }
): Promise<string | null> {
  try {
    const template = await getTemplate(templateId);
    if (!template) return null;

    // Prepare variables with defaults
    const vars = {
      clientName: variables.clientName || "[Client Name]",
      freelancerName: variables.freelancerName || "[Freelancer Name]",
      projectScope: variables.projectScope || "[Project Scope]",
      budget: variables.budget || "[Budget]",
      timeline: variables.timeline || "[Timeline]",
      date: variables.date || new Date().toLocaleDateString(),
      ...variables,
    };

    return replaceTemplateVariables(template.content, vars);
  } catch (error) {
    console.error("Error applying template:", error);
    return null;
  }
}

/**
 * Get available template variables from content
 */
export function extractTemplateVariables(content: string): string[] {
  const regex = /{([^}]+)}/g;
  const matches = content.match(regex) || [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

/**
 * Merge contract text with template header and footer
 */
export function mergeWithTemplate(
  contractContent: string,
  templateHeader?: string,
  templateFooter?: string
): string {
  let result = contractContent;

  if (templateHeader) {
    result = templateHeader + "\n\n" + result;
  }

  if (templateFooter) {
    result = result + "\n\n" + templateFooter;
  }

  return result;
}

/**
 * Validate template variables are provided
 */
export function validateTemplateVariables(
  content: string,
  variables: Record<string, any>
): { valid: boolean; missing: string[] } {
  const required = extractTemplateVariables(content);
  const missing = required.filter((v) => !variables[v]);

  return {
    valid: missing.length === 0,
    missing,
  };
}
