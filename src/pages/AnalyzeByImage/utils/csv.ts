import { AnalysisResult } from '../types';

export function exportToCsv(results: Record<string, AnalysisResult | null>) {
  // Check if there are any successful results
  const successfulResults = Object.entries(results).filter(([_, result]) => result !== null);
  if (successfulResults.length === 0) {
    throw new Error('No successful analyses to export');
  }

  // Create CSV content
  const csvRows = [
    ['Filename', 'Title', 'Description', 'Keywords']
  ];

  successfulResults.forEach(([filename, result]) => {
    if (result) {
      // Process keywords: if it's a comma-separated string, keep as is
      // If it's an array, join with commas
      const keywords = Array.isArray(result.keywords) 
        ? result.keywords.join(', ')
        : result.keywords;

      csvRows.push([
        filename,
        result.title,
        result.description,
        keywords
      ]);
    }
  });

  // Convert to CSV string with proper escaping
  const csvContent = csvRows
    .map(row => 
      row.map(cell => {
        // Escape special characters and wrap in quotes
        const escaped = String(cell).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
    .join('\n');

  // Create and download file
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `image_analysis_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
