import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface BrandKit {
  id: string;
  user_id: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  font_url?: string;
  signature_block?: string;
  company_name?: string;
  company_website?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  created_at: string;
  updated_at: string;
}

export interface ContractTemplate {
  id: string;
  user_id: string;
  name: string;
  contract_type: string;
  content: string;
  variables?: Record<string, any>;
  is_default: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  content: string;
  version_number: number;
  change_notes?: string;
  created_at: string;
}

/**
 * Get or create user's brand kit
 */
export async function getBrandKit(userId: string): Promise<BrandKit | null> {
  try {
    let { data, error } = await supabase
      ?.from("brand_kits")
      .select("*")
      .eq("user_id", userId)
      .single();

    // If no brand kit exists, create default one
    if (error?.code === "PGRST116") {
      const { data: created } = await supabase?.from("brand_kits").insert({
        user_id: userId,
        primary_color: "#000000",
        secondary_color: "#ffffff",
        accent_color: "#3b82f6",
        font_family: "inter",
      });

      return created?.[0] || null;
    }

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch brand kit:", error);
    return null;
  }
}

/**
 * Update brand kit
 */
export async function updateBrandKit(
  userId: string,
  updates: Partial<BrandKit>
): Promise<BrandKit | null> {
  try {
    const { data, error } = await supabase
      ?.from("brand_kits")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    toast.success("Brand kit updated");
    return data;
  } catch (error) {
    console.error("Failed to update brand kit:", error);
    toast.error("Failed to update brand kit");
    return null;
  }
}

/**
 * Upload logo to Supabase storage
 */
export async function uploadLogo(
  userId: string,
  file: File
): Promise<string | null> {
  try {
    const filename = `${userId}-logo-${Date.now()}`;
    const { data, error } = await supabase?.storage
      .from("brand-assets")
      .upload(`logos/${filename}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase!.storage.from("brand-assets").getPublicUrl(`logos/${filename}`);

    // Update brand kit with logo URL
    await updateBrandKit(userId, { logo_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error("Failed to upload logo:", error);
    toast.error("Failed to upload logo");
    return null;
  }
}

/**
 * Create contract template
 */
export async function createTemplate(
  userId: string,
  template: Omit<ContractTemplate, "id" | "user_id" | "created_at" | "updated_at">
): Promise<ContractTemplate | null> {
  try {
    const { data, error } = await supabase
      ?.from("contract_templates")
      .insert({
        user_id: userId,
        ...template,
      })
      .select()
      .single();

    if (error) throw error;
    toast.success("Template created");
    return data;
  } catch (error) {
    console.error("Failed to create template:", error);
    toast.error("Failed to create template");
    return null;
  }
}

/**
 * Update contract template
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<ContractTemplate>,
  changeNotes?: string
): Promise<ContractTemplate | null> {
  try {
    // Get current template to create version
    const { data: current } = await supabase
      ?.from("contract_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (current) {
      // Create version before updating
      const { data: versions } = await supabase
        ?.from("template_versions")
        .select("version_number")
        .eq("template_id", templateId)
        .order("version_number", { ascending: false })
        .limit(1);

      const nextVersion = (versions?.[0]?.version_number || 0) + 1;

      await supabase?.from("template_versions").insert({
        template_id: templateId,
        content: current.content,
        version_number: nextVersion,
        change_notes: changeNotes,
      });
    }

    // Update template
    const { data, error } = await supabase
      ?.from("contract_templates")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", templateId)
      .select()
      .single();

    if (error) throw error;
    toast.success("Template updated");
    return data;
  } catch (error) {
    console.error("Failed to update template:", error);
    toast.error("Failed to update template");
    return null;
  }
}

/**
 * Get all templates for user
 */
export async function getTemplates(userId: string): Promise<ContractTemplate[]> {
  try {
    const { data, error } = await supabase
      ?.from("contract_templates")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return [];
  }
}

/**
 * Get template by ID
 */
export async function getTemplate(
  templateId: string
): Promise<ContractTemplate | null> {
  try {
    const { data, error } = await supabase
      ?.from("contract_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to fetch template:", error);
    return null;
  }
}

/**
 * Delete template
 */
export async function deleteTemplate(templateId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      ?.from("contract_templates")
      .delete()
      .eq("id", templateId);

    if (error) throw error;
    toast.success("Template deleted");
    return true;
  } catch (error) {
    console.error("Failed to delete template:", error);
    toast.error("Failed to delete template");
    return false;
  }
}

/**
 * Get template versions
 */
export async function getTemplateVersions(
  templateId: string
): Promise<TemplateVersion[]> {
  try {
    const { data, error } = await supabase
      ?.from("template_versions")
      .select("*")
      .eq("template_id", templateId)
      .order("version_number", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Failed to fetch template versions:", error);
    return [];
  }
}

/**
 * Restore template to specific version
 */
export async function restoreTemplateVersion(
  templateId: string,
  versionId: string
): Promise<boolean> {
  try {
    const { data: version } = await supabase
      ?.from("template_versions")
      .select("*")
      .eq("id", versionId)
      .single();

    if (!version) throw new Error("Version not found");

    // Update template with old content
    await updateTemplate(
      templateId,
      { content: version.content },
      `Restored from version ${version.version_number}`
    );

    return true;
  } catch (error) {
    console.error("Failed to restore version:", error);
    toast.error("Failed to restore version");
    return false;
  }
}

/**
 * Export brand kit as JSON
 */
export async function exportBrandKit(userId: string): Promise<any | null> {
  try {
    const brandKit = await getBrandKit(userId);
    const templates = await getTemplates(userId);

    return {
      brandKit,
      templates,
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to export brand kit:", error);
    return null;
  }
}

/**
 * Import brand kit from JSON
 */
export async function importBrandKit(
  userId: string,
  data: any
): Promise<boolean> {
  try {
    // Import brand kit
    if (data.brandKit) {
      await updateBrandKit(userId, data.brandKit);
    }

    // Import templates
    if (data.templates && Array.isArray(data.templates)) {
      for (const template of data.templates) {
        const existing = await supabase
          ?.from("contract_templates")
          .select("id")
          .eq("user_id", userId)
          .eq("name", template.name)
          .single();

        if (existing.data) {
          // Update existing
          await updateTemplate(existing.data.id, template);
        } else {
          // Create new
          await createTemplate(userId, template);
        }
      }
    }

    toast.success("Brand kit imported successfully");
    return true;
  } catch (error) {
    console.error("Failed to import brand kit:", error);
    toast.error("Failed to import brand kit");
    return false;
  }
}
