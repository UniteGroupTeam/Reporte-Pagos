function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Hoja 1");
  const expensesSheet = ss.getSheetByName("Gastos");
  
  // 1. Obtener Vecinos
  // Asumimos fila 1 headers. Datos comienzan en fila 2.
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  // Eliminamos headers para enviar JSON limpio, o los dejamos y el front los ignora.
  // Vamos a enviar todo y que el front decida (más seguro para índices).
  
  // 2. Obtener Total Gastos (Columna C = índice 2)
  let totalExpenses = 0;
  if (expensesSheet) {
    const expensesData = expensesSheet.getDataRange().getValues();
    // Empezamos en 1 para saltar header
    for (let i = 1; i < expensesData.length; i++) {
        const monto = parseFloat(expensesData[i][2]); // Col C
        if (!isNaN(monto)) {
            totalExpenses += monto;
        }
    }
  }
  
  const response = {
    neighbors: values,
    totalExpenses: totalExpenses
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Hoja 1"); // Vecinos
  let expensesSheet = ss.getSheetByName("Gastos");
  
  // Crear hoja de gastos si no existe
  if (!expensesSheet) {
    expensesSheet = ss.insertSheet("Gastos");
    expensesSheet.appendRow(["Fecha", "Concepto", "Monto"]);
  }
  
  // Parsear datos
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  let result = { status: "success" };
  
  try {
    if (action === "PAYMENT") {
      // data: { rowIndex, colIndex, value }
      // rowIndex viene del array (0-based) pero Sheets usa 1-based.
      // OJO: El front debe enviar el índice REAL de la hoja.
      // Si el front manda el index del array (donde 0 es row 1), entonces row = index + 1
      
      const userId = data.rowIndex; 
      const monthCol = data.colIndex; 
      
      sheet.getRange(userId, monthCol).setValue(data.value);
      result.message = "Pago registrado";
      
    } else if (action === "WITHDRAW") {
      // data: { concept, amount }
      const date = new Date();
      expensesSheet.appendRow([date, data.concept, data.amount]);
      result.message = "Retiro registrado";
      
    } else if (action === "RESET") {
      // 1. Borrar PAGOS (Cols 5-16 en Hoja 1)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 5, lastRow - 1, 12).clearContent();
      }
      
      // 2. Borrar GASTOS (Todas las filas menos header)
      if (expensesSheet) {
        const lastExpRow = expensesSheet.getLastRow();
        if (lastExpRow > 1) {
          // Limpiar desde fila 2, columnas A, B, C
          expensesSheet.getRange(2, 1, lastExpRow - 1, 3).clearContent();
        }
      }
      
      result.message = "Caja y Gastos reiniciados";
    }
    
  } catch (error) {
    result.status = "error";
    result.error = error.toString();
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Función para ejecutar manualmente desde el editor (Run > manualReset)
function manualReset() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Hoja 1");
  const expensesSheet = ss.getSheetByName("Gastos");

  // 1. Borrar Pagos
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 5, sheet.getLastRow() - 1, 12).clearContent();
  }

  // 2. Borrar Gastos
  if (expensesSheet && expensesSheet.getLastRow() > 1) {
    expensesSheet.getRange(2, 1, expensesSheet.getLastRow() - 1, 3).clearContent();
  }
  
  Logger.log("¡Base de datos y gastos reiniciados a 0!");
}
