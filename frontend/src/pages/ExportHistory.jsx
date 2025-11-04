import React, { useEffect } from 'react';
import { Button, FormControl, Link, Typography, FormLabel} from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField } from '@mui/material';
import { Link as LinkRouter } from 'react-router';
import { Box } from '@mui/material';
import { BannerTop } from '../components/BannerTop';
import jsPDF from 'jspdf';
import { backendClient } from '../api/backendClient';
import dayjs from 'dayjs';


// Generar CSV
const generateCSV = (data) => {
    const headers = ["Date", "Time", "Food", "Quantity", "Unit", "Grams", "Calories", "Tags", "Notes"].join(",");
    const rows = data.map(row => [
        row.date,
        row.time,
        `"${row.food}"`,
        row.quantity,
        `"${row.unit}"`,
        row.grams,
        row.calories,
        `"${row.tags}"`,
        `"${row.notes}"`
    ].join(",")).join("\n");
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `food-consumption-history-${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// 🔹 Generar PDF en Front
const generatePDF = async (data) => {
    const doc = new jsPDF('landscape'); // Usar orientación horizontal para más espacio

    // Agregar marca de agua
    doc.setFontSize(60);
    doc.setTextColor(230, 230, 230); // Color gris muy claro
    // Para texto rotado en jsPDF usamos el parámetro de rotación en text()
    doc.text("KAL'O FIT", 150, 150, { angle: 45, align: 'center' });
    
    // Restaurar color para el contenido normal
    doc.setTextColor(0, 0, 0);

    // Configuración inicial
    doc.setFontSize(16);
    doc.text("Food History Export", 14, 15);

    doc.setFontSize(10);
    doc.text(`Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}`, 14, 25);

    // Configurar columnas con todos los campos del CSV
    const headers = ["Date", "Time", "Food", "Quantity", "Unit", "Grams", "Calories", "Tags", "Notes"];
    const colWidths = [20, 20, 40, 20, 20, 20, 20, 40, 40]; // Anchos de columna ajustados
    let y = 35;
    let x = 14;
    
    // Imprimir headers
    doc.setFont(undefined, 'bold');
    headers.forEach((header, i) => {
        doc.text(header, x, y);
        x += colWidths[i];
    });
    
    // Imprimir datos
    doc.setFont(undefined, 'normal');
    y += 8;
    
    data.forEach((item) => {
        if (y > 200) { // Nueva página si no hay espacio (ajustado para landscape)
            doc.addPage('landscape');
            y = 20;
            
            // Repetir headers en la nueva página
            x = 14;
            doc.setFont(undefined, 'bold');
            headers.forEach((header, i) => {
                doc.text(header, x, y);
                x += colWidths[i];
            });
            doc.setFont(undefined, 'normal');
            y += 8;
        }
        
        x = 14;
        // Imprimir cada campo respetando el ancho de columna
        doc.text(item.date || '', x, y); x += colWidths[0];
        doc.text(item.time || '', x, y); x += colWidths[1];
        doc.text((item.food || '').substring(0, 25), x, y); x += colWidths[2];
        doc.text(item.quantity?.toString() || '0', x, y); x += colWidths[3];
        doc.text((item.unit || '').substring(0, 10), x, y); x += colWidths[4];
        doc.text(item.grams?.toString() || '0', x, y); x += colWidths[5];
        doc.text(item.calories?.toString() || '0', x, y); x += colWidths[6];
        doc.text((item.tags || '').substring(0, 25), x, y); x += colWidths[7];
        doc.text((item.notes || '').substring(0, 25), x, y);
        
        y += 7;
    });

    doc.save(`food-consumption-history-${dayjs().format('YYYY-MM-DD')}.pdf`);
};



export default function ExportHistoryOptions() {
    const [selectedOption, setSelectedOption] = React.useState("last-7-days");
    const [exportFormat, setExportFormat] = React.useState("csv");
    const [fromDate, setFromDate] = React.useState(null);
    const [toDate, setToDate] = React.useState(null);

    // Efecto para ocultar/mostrar el menú inferior
    useEffect(() => {
        // Ocultar el menú al montar
        const bottomNav = document.querySelector('.MuiBottomNavigation-root')?.parentElement;
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }

        // Restaurar el menú al desmontar
        return () => {
            if (bottomNav) {
                bottomNav.style.display = 'block';
            }
        };
    }, []); // Solo se ejecuta al montar/desmontar

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };
    
    const handleExport = async () => {
        if (selectedOption === "custom" && (!fromDate || !toDate)) {
            alert("Select both dates!");
            return;
        }

        if (fromDate && toDate && fromDate > toDate) {
            alert("The 'From' date cannot be later than 'To' date!");
            return;
        }

        try {
            // Construir query params
            const params = {
                dateRange: selectedOption,
                format: exportFormat
            };

            if (selectedOption === 'custom') {
                params.fromDate = fromDate.toISOString();
                params.toDate = toDate.toISOString();
            }

            const { data, metadata } = await backendClient.get('api/export/history', params);

            // Generar archivo según formato seleccionado
            if (exportFormat === "csv") {
                generateCSV(data);
            } else if (exportFormat === "pdf") {
                generatePDF(data);
            }

        } catch (error) {
            console.error('Export error:', error);
            alert('Error generating export. Please try again.');
        }
    };
    
    return (
        <Box
            sx={{ 
                bgcolor: "background.default", 
                minHeight: "100vh",
                pb: 2, // padding bottom para espacio después del botón
                overflow: "auto", // hace el contenido scrolleable
            }}
        >
            {/* 🔹 Encabezado con botón de volver */}
                <BannerTop title="Export History" backTo="/profile" />
            {/* 🔹 Contenido principal */}
            
            {/* Date */}
            <Box>
                <Box
                    sx={{ 
                    p: 2,  
                    bgcolor: "boottonBarContainer.main",
                    mx: 2,
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexGrow: 1,
                    flexDirection: "column",
                }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        Date
                    </Typography>
                </Box>
                <Box
                    sx={{
                    mt: 2,
                    p: 2,  
                    bgcolor: "onPrimary.main",
                    mx: 2,
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "left",
                    alignItems: "center",
                    flexGrow: 1,
                    flexDirection: "column",
                }}
                >
                    <FormControl fullWidth>
                        <FormLabel></FormLabel>

                        <RadioGroup
                            value={selectedOption}
                            onChange={handleChange}
                            name="date-to-export"
                        >
                            <FormControlLabel value="last-7-days" control={<Radio />} label="Last 7 Days" />
                            <FormControlLabel value="last-30-days" control={<Radio />} label="Last 30 Days" />
                            <FormControlLabel value="all-history" control={<Radio />} label="All History" />
                            <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                        </RadioGroup>

                        {/* Mostrar fechas SOLO si custom está seleccionado */}
                        {selectedOption === "custom" && (
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Box
                                sx={{
                                mt: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: "boottonBarContainer.main", // fondo oscuro similar a tu UI
                                }}
                            >
                                <DatePicker
                                label="From"
                                value={fromDate}
                                onChange={(newValue) => setFromDate(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        variant: "filled",
                                    }
                                }}
                                />
                                <DatePicker
                                label="To"
                                value={toDate}
                                onChange={(newValue) => setToDate(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        variant: "filled",
                                    }
                                }}
                                />
                            </Box>
                            </LocalizationProvider>
                        )}
                        </FormControl>
                </Box>
                
            </Box>
            
            {/* Format */}
            <Box sx={{ mt: 4 }}>
                <Box
                    sx={{ 
                        p: 2,  
                        bgcolor: "boottonBarContainer.main",
                        mx: 2,
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexGrow: 1,
                        flexDirection: "column",
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">
                        Format
                    </Typography>
                </Box>

                <Box
                    sx={{
                        mt: 2,
                        p: 2,  
                        bgcolor: "onPrimary.main",
                        mx: 2,
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "center",
                        flexGrow: 1,
                        flexDirection: "column",
                    }}
                >
                    <FormControl fullWidth>
                        <RadioGroup
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            name="export-format"
                        >
                            <FormControlLabel value="csv" control={<Radio />} label="CSV" />
                            <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
                        </RadioGroup>
                    </FormControl>
                </Box>
            </Box>



            {/* Botones */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 2,
                    p: 2,
                    border: "none",
                    boxShadow: "none",
                }}>
                <Button
                    onClick={handleExport}
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    sx={{
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: "bold",
                    textTransform: "none",
                    }}
                >
                    Export
                </Button>

            </Box>
            
        </Box>
        
    );
}
