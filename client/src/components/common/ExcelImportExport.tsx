import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface Props {
  entity: "leads" | "customers" | "inventory" | "quotations";
}

export default function ExcelImportExport({ entity }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

  const downloadTemplate = async () => {
    const res = await fetch(`/api/import/template/${entity}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entity}_template.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportData = async () => {
    const res = await fetch(`/api/export/${entity}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entity}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const res = await fetch(`/api/import/${entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Import failed");
      toast({ title: "Imported", description: `${json.created} record(s) added.` });
    } catch (err: any) {
      toast({ title: "Import error", description: String(err.message || err), variant: "destructive" });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Import/Export</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={downloadTemplate}>Download Excel Template</DropdownMenuItem>
          <DropdownMenuItem onClick={exportData}>Export Current Data</DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>Import From Excel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onFileChange} />
      {isImporting ? <span className="text-sm text-gray-500">Importing…</span> : null}
    </div>
  );
}


