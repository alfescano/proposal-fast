import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader,
  Palette,
  Upload,
  Copy,
  Download,
  Trash2,
  Plus,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBrandKit,
  getTemplates,
  uploadLogo,
  updateBrandKit,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateVersions,
  exportBrandKit,
  importBrandKit,
  type BrandKit,
  type ContractTemplate,
  type TemplateVersion,
} from "@/lib/brandKitService";

export default function BrandKitSettings() {
  const { userId } = useAuth();
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Brand kit state
  const [colors, setColors] = useState({
    primary: "#000000",
    secondary: "#ffffff",
    accent: "#3b82f6",
  });
  const [fontFamily, setFontFamily] = useState("inter");
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    website: "",
    email: "",
    phone: "",
    address: "",
  });
  const [signatureBlock, setSignatureBlock] = useState("");

  // Template state
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    contract_type: "service",
    content: "",
    tags: [] as string[],
  });
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [templateVersions, setTemplateVersions] = useState<TemplateVersion[]>([]);

  useEffect(() => {
    if (!userId) return;
    loadBrandKit();
  }, [userId]);

  const loadBrandKit = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const kit = await getBrandKit(userId);
      if (kit) {
        setBrandKit(kit);
        setColors({
          primary: kit.primary_color,
          secondary: kit.secondary_color,
          accent: kit.accent_color,
        });
        setFontFamily(kit.font_family);
        setCompanyInfo({
          name: kit.company_name || "",
          website: kit.company_website || "",
          email: kit.company_email || "",
          phone: kit.company_phone || "",
          address: kit.company_address || "",
        });
        setSignatureBlock(kit.signature_block || "");
      }

      const templ = await getTemplates(userId);
      setTemplates(templ);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setSaving(true);
    const logoUrl = await uploadLogo(userId, file);
    if (logoUrl) {
      setBrandKit(prev => prev ? { ...prev, logo_url: logoUrl } : null);
    }
    setSaving(false);
  };

  const handleSaveBrandKit = async () => {
    if (!userId) return;
    setSaving(true);

    const updated = await updateBrandKit(userId, {
      primary_color: colors.primary,
      secondary_color: colors.secondary,
      accent_color: colors.accent,
      font_family: fontFamily,
      company_name: companyInfo.name,
      company_website: companyInfo.website,
      company_email: companyInfo.email,
      company_phone: companyInfo.phone,
      company_address: companyInfo.address,
      signature_block: signatureBlock,
    });

    if (updated) {
      setBrandKit(updated);
    }
    setSaving(false);
  };

  const handleCreateTemplate = async () => {
    if (!userId || !newTemplate.name || !newTemplate.content) {
      toast.error("Please fill in all fields");
      return;
    }

    setSaving(true);
    const template = await createTemplate(userId, newTemplate);
    if (template) {
      setTemplates([template, ...templates]);
      setNewTemplate({ name: "", contract_type: "service", content: "", tags: [] });
      setShowNewTemplate(false);
    }
    setSaving(false);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    setSaving(true);
    const updated = await updateTemplate(
      editingTemplate.id,
      editingTemplate,
      "Updated template content"
    );
    if (updated) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? updated : t));
      setEditingTemplate(null);
    }
    setSaving(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Delete this template?")) return;

    setSaving(true);
    if (await deleteTemplate(templateId)) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
    setSaving(false);
  };

  const handleViewVersions = async (template: ContractTemplate) => {
    setSelectedTemplate(template);
    const versions = await getTemplateVersions(template.id);
    setTemplateVersions(versions);
  };

  const handleExport = async () => {
    if (!userId) return;
    const data = await exportBrandKit(userId);
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brand-kit-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const text = await file.text();
    const data = JSON.parse(text);
    if (await importBrandKit(userId, data)) {
      await loadBrandKit();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="w-8 h-8" />
            Brand Kit & Templates
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your branding, colors, templates, and signature blocks
          </p>
        </div>

        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="company">Company Info</TabsTrigger>
            <TabsTrigger value="export">Backup</TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logo & Colors</CardTitle>
                <CardDescription>Upload your logo and define brand colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  {brandKit?.logo_url && (
                    <div className="mb-3 p-3 border rounded-lg bg-muted flex items-center gap-3">
                      <img src={brandKit.logo_url} alt="Logo" className="h-16 object-contain" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Logo
                      </Button>
                    </div>
                  )}
                  {!brandKit?.logo_url && (
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary">Primary Color</Label>
                    <div className="flex gap-2">
                      <input
                        id="primary"
                        type="color"
                        value={colors.primary}
                        onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        name="primary-color"
                        value={colors.primary}
                        onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary">Secondary Color</Label>
                    <div className="flex gap-2">
                      <input
                        id="secondary"
                        type="color"
                        value={colors.secondary}
                        onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        name="secondary-color"
                        value={colors.secondary}
                        onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent">Accent Color</Label>
                    <div className="flex gap-2">
                      <input
                        id="accent"
                        type="color"
                        value={colors.accent}
                        onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <Input
                        name="accent-color"
                        value={colors.accent}
                        onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                  <Label htmlFor="font">Font Family</Label>
                  <select
                    id="font"
                    value={fontFamily || "inter"}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="inter">Inter</option>
                    <option value="sistema">Sistema</option>
                    <option value="courier">Courier</option>
                    <option value="georgia">Georgia</option>
                    <option value="times">Times New Roman</option>
                  </select>
                </div>

                <Button onClick={handleSaveBrandKit} disabled={saving} size="lg">
                  {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Brand Colors
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            {showNewTemplate ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-template-name">Template Name</Label>
                    <Input
                      id="new-template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="e.g. Web Design - Standard"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contract Type</Label>
                    <select
                      value={newTemplate.contract_type || "service"}
                      onChange={(e) =>
                        setNewTemplate({ ...newTemplate, contract_type: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="service">Service</option>
                      <option value="nda">NDA</option>
                      <option value="development">Development</option>
                      <option value="design">Design</option>
                      <option value="content">Content</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Template Content</Label>
                    <Textarea
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      placeholder="Enter contract template..."
                      rows={10}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateTemplate} disabled={saving}>
                      {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Create Template
                    </Button>
                    <Button
                      onClick={() => setShowNewTemplate(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button onClick={() => setShowNewTemplate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            )}

            {editingTemplate ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-template-name">Template Name</Label>
                    <Input
                      id="edit-template-name"
                      value={editingTemplate.name}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Template Content</Label>
                    <Textarea
                      value={editingTemplate.content}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, content: e.target.value })
                      }
                      rows={10}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleUpdateTemplate} disabled={saving}>
                      {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setEditingTemplate(null)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-3">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="pt-6 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{template.name}</h3>
                        {template.is_default && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        Type: {template.contract_type}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewVersions(template)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTemplate(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Company Info Tab */}
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Used in contracts and signature blocks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyInfo.name}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, name: e.target.value })
                    }
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-website">Website</Label>
                  <Input
                    id="company-website"
                    value={companyInfo.website}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, website: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    value={companyInfo.email}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, email: e.target.value })
                    }
                    placeholder="info@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input
                    id="company-phone"
                    value={companyInfo.phone}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={companyInfo.address}
                    onChange={(e) =>
                      setCompanyInfo({ ...companyInfo, address: e.target.value })
                    }
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Signature Block</Label>
                  <Textarea
                    value={signatureBlock}
                    onChange={(e) => setSignatureBlock(e.target.value)}
                    placeholder="Professional signature text..."
                    rows={5}
                  />
                </div>

                <Button onClick={handleSaveBrandKit} disabled={saving} size="lg">
                  {saving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Company Info
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup/Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>Export and import your brand kit and templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Export your brand kit and templates as a JSON file to backup or share.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Brand Kit
                  </Button>

                  <Button variant="outline" onClick={() => importFileRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Brand Kit
                  </Button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}