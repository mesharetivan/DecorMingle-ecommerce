import * as XLSX from "xlsx";

const exportToExcel = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(data);

      // Create workbook and add the worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sales");

      // Generate XLSX file and download
      XLSX.writeFile(wb, "sales.xlsx");

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export default exportToExcel;
