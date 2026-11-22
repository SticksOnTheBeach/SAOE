declare module 'excel-column-name' {
  export function intToExcelCol(column: number): string
  export function excelColToInt(name: string): number
}