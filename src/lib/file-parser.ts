import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FileData } from './llm-service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class FileParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileParserError';
  }
}

export class FileParser {
  /**
   * Valida o tamanho do arquivo
   */
  static validateFileSize(file: File): void {
    if (file.size > MAX_FILE_SIZE) {
      throw new FileParserError(
        `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }
  }

  /**
   * Valida a extensão do arquivo
   */
  static validateFileType(file: File): void {
    const validExtensions = ['.csv', '.json', '.xlsx', '.xls'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(extension)) {
      throw new FileParserError(
        `Tipo de arquivo não suportado. Use: ${validExtensions.join(', ')}`
      );
    }
  }

  /**
   * Parse de arquivo CSV
   */
  static async parseCSV(file: File): Promise<FileData> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new FileParserError(`Erro ao processar CSV: ${results.errors[0].message}`));
            return;
          }

          const data = results.data as Array<Record<string, any>>;
          const columns = results.meta.fields || [];

          if (data.length === 0) {
            reject(new FileParserError('Arquivo CSV vazio'));
            return;
          }

          resolve({
            filename: file.name,
            data,
            columns,
          });
        },
        error: (error) => {
          reject(new FileParserError(`Erro ao ler CSV: ${error.message}`));
        },
      });
    });
  }

  /**
   * Parse de arquivo JSON
   */
  static async parseJSON(file: File): Promise<FileData> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      let data: Array<Record<string, any>>;

      // Se for um array, usa diretamente
      if (Array.isArray(parsed)) {
        data = parsed;
      } 
      // Se for um objeto com uma propriedade que é um array, tenta usar
      else if (typeof parsed === 'object' && parsed !== null) {
        const arrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
        if (arrayKey) {
          data = parsed[arrayKey];
        } else {
          // Se não encontrar array, converte o objeto em um array de um item
          data = [parsed];
        }
      } else {
        throw new FileParserError('Formato JSON inválido. Esperado um array ou objeto.');
      }

      if (data.length === 0) {
        throw new FileParserError('Arquivo JSON vazio');
      }

      // Extrai as colunas do primeiro item
      const columns = Object.keys(data[0] || {});

      return {
        filename: file.name,
        data,
        columns,
      };
    } catch (error) {
      if (error instanceof FileParserError) {
        throw error;
      }
      throw new FileParserError(`Erro ao processar JSON: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Parse de arquivo Excel
   */
  static async parseExcel(file: File): Promise<FileData> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      // Pega a primeira planilha
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new FileParserError('Arquivo Excel sem planilhas');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      
      // Converte para JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false,
        defval: null 
      }) as Array<Record<string, any>>;

      if (data.length === 0) {
        throw new FileParserError('Planilha Excel vazia');
      }

      const columns = Object.keys(data[0] || {});

      return {
        filename: file.name,
        data,
        columns,
      };
    } catch (error) {
      if (error instanceof FileParserError) {
        throw error;
      }
      throw new FileParserError(`Erro ao processar Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Função principal que detecta o tipo e faz o parse apropriado
   */
  static async parseFile(file: File): Promise<FileData> {
    // Validações
    this.validateFileSize(file);
    this.validateFileType(file);

    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    switch (extension) {
      case '.csv':
        return this.parseCSV(file);
      case '.json':
        return this.parseJSON(file);
      case '.xlsx':
      case '.xls':
        return this.parseExcel(file);
      default:
        throw new FileParserError(`Extensão não suportada: ${extension}`);
    }
  }

  /**
   * Gera uma prévia dos dados (primeiras 5 linhas)
   */
  static generatePreview(fileData: FileData, maxRows: number = 5): FileData {
    return {
      ...fileData,
      data: fileData.data.slice(0, maxRows),
    };
  }

  /**
   * Valida se os dados têm estrutura adequada para gráficos
   */
  static validateChartData(fileData: FileData): { valid: boolean; message?: string } {
    if (fileData.data.length === 0) {
      return { valid: false, message: 'Nenhum dado encontrado' };
    }

    if (fileData.columns.length === 0) {
      return { valid: false, message: 'Nenhuma coluna encontrada' };
    }

    // Verifica se há pelo menos uma coluna numérica
    const firstRow = fileData.data[0];
    const hasNumericColumn = fileData.columns.some(col => {
      const value = firstRow[col];
      return typeof value === 'number' || !isNaN(Number(value));
    });

    if (!hasNumericColumn) {
      return { valid: false, message: 'Nenhuma coluna numérica encontrada para visualização' };
    }

    return { valid: true };
  }

  /**
   * Converte os dados para formato string para envio ao LLM
   */
  static dataToString(fileData: FileData, maxRows: number = 20): string {
    const preview = this.generatePreview(fileData, maxRows);
    
    let result = `Arquivo: ${preview.filename}\n`;
    result += `Colunas: ${preview.columns.join(', ')}\n`;
    result += `Total de linhas: ${fileData.data.length}\n\n`;
    result += 'Dados (primeiras linhas):\n';
    result += JSON.stringify(preview.data, null, 2);

    if (fileData.data.length > maxRows) {
      result += `\n\n... e mais ${fileData.data.length - maxRows} linhas`;
    }

    return result;
  }
}

