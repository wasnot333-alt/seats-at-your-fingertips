import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ImportRow {
  code: string;
  participant_name?: string;
  expires_at?: string;
  max_usage?: number;
  isValid: boolean;
  error?: string;
}

interface BulkImportCodesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCodes: string[];
  onImportComplete: () => void;
}

export default function BulkImportCodes({
  open,
  onOpenChange,
  existingCodes,
  onImportComplete,
}: BulkImportCodesProps) {
  const [parsedData, setParsedData] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setParsedData([]);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const parseDate = (value: unknown): string | null => {
    if (!value) return null;
    
    // If it's a number (Excel date serial number)
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) {
        return new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0).toISOString();
      }
    }
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
    
    return null;
  };

  const validateRow = (row: Partial<ImportRow>, existingInFile: Set<string>): ImportRow => {
    const code = (row.code || '').toString().trim().toUpperCase();
    
    if (!code) {
      return { ...row, code: '', isValid: false, error: 'Code is required' } as ImportRow;
    }

    // Check for duplicates in existing database
    if (existingCodes.includes(code)) {
      return { ...row, code, isValid: false, error: 'Code already exists in database' } as ImportRow;
    }

    // Check for duplicates within the file
    if (existingInFile.has(code)) {
      return { ...row, code, isValid: false, error: 'Duplicate code in file' } as ImportRow;
    }

    existingInFile.add(code);

    return {
      code,
      participant_name: row.participant_name?.toString().trim() || undefined,
      expires_at: row.expires_at || undefined,
      max_usage: row.max_usage || 1,
      isValid: true,
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: '' });

        const existingInFile = new Set<string>();
        const parsed: ImportRow[] = jsonData.map((row: Record<string, unknown>) => {
          // Normalize column names (case-insensitive)
          const normalizedRow: Partial<ImportRow> = {};
          
          Object.entries(row).forEach(([key, value]) => {
            const lowerKey = key.toLowerCase().trim();
            if (lowerKey === 'code') {
              normalizedRow.code = value as string;
            } else if (lowerKey === 'participant_name' || lowerKey === 'participantname' || lowerKey === 'name') {
              normalizedRow.participant_name = value as string;
            } else if (lowerKey === 'expires_at' || lowerKey === 'expiresat' || lowerKey === 'expires') {
              normalizedRow.expires_at = parseDate(value) || undefined;
            } else if (lowerKey === 'max_usage' || lowerKey === 'maxusage' || lowerKey === 'max') {
              const numVal = parseInt(value as string, 10);
              normalizedRow.max_usage = isNaN(numVal) ? 1 : numVal;
            }
          });

          return validateRow(normalizedRow, existingInFile);
        });

        setParsedData(parsed);
        
        const validCount = parsed.filter(r => r.isValid).length;
        const invalidCount = parsed.filter(r => !r.isValid).length;
        
        if (invalidCount > 0) {
          toast.warning(`${validCount} valid, ${invalidCount} invalid codes found`);
        } else {
          toast.success(`${validCount} codes ready to import`);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Failed to parse file. Please check the format.');
        resetState();
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      resetState();
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    const validRows = parsedData.filter(row => row.isValid);
    
    if (validRows.length === 0) {
      toast.error('No valid codes to import');
      return;
    }

    setImporting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const insertData = validRows.map(row => ({
        code: row.code,
        participant_name: row.participant_name || null,
        expires_at: row.expires_at || null,
        max_usage: row.max_usage || 1,
        status: 'active' as const,
        created_by: user?.id || null,
      }));

      const { error } = await supabase
        .from('invitation_codes')
        .insert(insertData);

      if (error) {
        console.error('Error importing codes:', error);
        toast.error(`Import failed: ${error.message}`);
        return;
      }

      toast.success(`Successfully imported ${validRows.length} invitation codes`);
      onImportComplete();
      handleClose();
    } catch (error) {
      console.error('Error importing codes:', error);
      toast.error('An error occurred during import');
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.filter(r => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Import Invitation Codes
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* File Upload Section */}
          {parsedData.length === 0 ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all"
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">
                  Click to upload CSV or Excel file
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports .csv, .xlsx, .xls files
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-2">
                  Required columns:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <code className="text-primary">code</code> - Invitation code (required)</li>
                  <li>• <code className="text-primary">participant_name</code> - Participant name (optional)</li>
                  <li>• <code className="text-primary">expires_at</code> - Expiry date (optional)</li>
                  <li>• <code className="text-primary">max_usage</code> - Max usage count (default: 1)</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="flex items-center justify-between mb-4 p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    File: <span className="text-foreground font-medium">{fileName}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-seat-available">
                      <CheckCircle2 className="w-4 h-4" />
                      {validCount} valid
                    </span>
                    {invalidCount > 0 && (
                      <span className="flex items-center gap-1 text-sm text-red-500">
                        <XCircle className="w-4 h-4" />
                        {invalidCount} invalid
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetState}
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              </div>

              {/* Preview Table */}
              <div className="flex-1 overflow-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Code</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Participant</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Max Usage</th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, index) => (
                      <tr
                        key={index}
                        className={`border-t border-border/50 ${
                          !row.isValid ? 'bg-red-500/10' : 'hover:bg-secondary/20'
                        }`}
                      >
                        <td className="px-4 py-3">
                          {row.isValid ? (
                            <CheckCircle2 className="w-5 h-5 text-seat-available" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              <span className="text-xs text-red-500">{row.error}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs px-2 py-1 rounded bg-primary/10 text-primary font-bold">
                            {row.code || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.participant_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.max_usage || 1}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {row.expires_at
                            ? new Date(row.expires_at).toLocaleDateString()
                            : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {parsedData.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="flex items-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import {validCount} Codes
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
