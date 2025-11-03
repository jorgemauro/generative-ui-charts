'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileParser, FileParserError } from '@/lib/file-parser';
import { FileData } from '@/lib/llm-service';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileLoaded: (fileData: FileData) => void;
  onFileClear: () => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileLoaded,
  onFileClear,
  disabled = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setFile(selectedFile);

    try {
      const parsedData = await FileParser.parseFile(selectedFile);
      
      // Validar dados
      const validation = FileParser.validateChartData(parsedData);
      if (!validation.valid) {
        throw new FileParserError(validation.message || 'Dados inválidos');
      }

      setFileData(parsedData);
      onFileLoaded(parsedData);
    } catch (err) {
      const errorMessage = err instanceof FileParserError 
        ? err.message 
        : 'Erro ao processar arquivo';
      setError(errorMessage);
      setFile(null);
      setFileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setFileData(null);
    setError(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileClear();
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json,.xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isLoading}
      />

      {!file && !error && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={disabled || isLoading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isLoading ? 'Processando...' : 'Carregar Arquivo (CSV, JSON, Excel)'}
        </Button>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={handleClear}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {file && fileData && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-green-500/50 bg-green-500/5">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium truncate">{file.name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{fileData.data.length} linhas</span>
                      <span>•</span>
                      <span>{fileData.columns.length} colunas</span>
                    </div>
                    
                    {showPreview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t"
                      >
                        <p className="text-xs font-medium mb-2">Colunas:</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {fileData.columns.map((col, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                        
                        <p className="text-xs font-medium mb-2">Prévia (primeiras linhas):</p>
                        <div className="max-h-48 overflow-auto rounded border bg-background/50 p-2">
                          <pre className="text-xs">
                            {JSON.stringify(
                              FileParser.generatePreview(fileData, 3).data,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      className="h-7 text-xs"
                    >
                      {showPreview ? 'Ocultar' : 'Ver'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleClear}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

