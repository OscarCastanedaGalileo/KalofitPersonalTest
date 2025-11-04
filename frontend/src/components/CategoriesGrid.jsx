import React, { useEffect, useState } from "react";
import { backendClient } from "../api/backendClient";
import {
	Box,
	Button,
	Paper,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	List,
	ListItem,
	ListItemText,
	ListItemSecondaryAction,
	Stack,
	Divider,
	TextField,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

/**
 * CategoriesGrid
 * - muestra las categorías del backend
 * - permite crear nuevas, editar nombre/isPublic y eliminar
 * - usa endpoints montados en /api/categories
 */
export default function CategoriesGrid() {
	const [rows, setRows] = useState([]);
	const [loading, setLoading] = useState(false);
	const [savingIds, setSavingIds] = useState(new Set());

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	// mobile-only helpers
	const [mobileNewName, setMobileNewName] = useState("");
	const [editingIndex, setEditingIndex] = useState(null);
	const [editingValue, setEditingValue] = useState("");

	useEffect(() => {
		loadCategories();
	}, []);

	async function loadCategories() {
		setLoading(true);
		try {
			const data = await backendClient.get("/api/categories");
			// Normalizar: aseguramos campos que usaremos
			const normalized = (data || []).map((c) => ({
				id: c.id,
				name: c.name ?? "",
				isPublic: !!c.isPublic,
				createdBy: c.createdBy,
				_original: c,
				_isNew: false,
			}));
			setRows(normalized);
		} catch (err) {
			console.error("Error loading categories", err);
			setRows([]);
		} finally {
			setLoading(false);
		}
	}

	function handleLocalChange(index, field, value) {
		setRows((prev) => {
			const copy = [...prev];
			copy[index] = { ...copy[index], [field]: value };
			return copy;
		});
	}

	// (desktop 'add row' removed in favor of a simpler add flow on mobile)

	async function saveRow(row, index) {
		// row: {id|null, name, isPublic}
		if (!row.name || String(row.name).trim().length === 0) {
			alert("El nombre es requerido");
			return;
		}
		try {
			setSavingIds((s) => new Set(s).add(index));
				if (row._isNew) {
						const payload = { name: row.name };
						const created = await backendClient.post("/api/categories", payload);
				// reemplazar la fila nueva por la creada
				setRows((prev) => prev.map((r) => (r._tempId && r._tempId === row._tempId ? { ...created, name: created.name, isPublic: !!created.isPublic, _isNew: false } : r)));
			} else {
						const payload = { name: row.name };
				const updated = await backendClient.put(`/api/categories/${row.id}`, payload);
				setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, name: updated.name, isPublic: !!updated.isPublic } : r)));
			}
		} catch (err) {
			console.error("Error saving category", err);
			alert(err?.message || "Error saving");
		} finally {
			setSavingIds((s) => {
				const copy = new Set(s);
				copy.delete(index);
				return copy;
			});
		}
	}

	async function deleteRow(row, index) {
		const confirm = window.confirm(`Eliminar categoría "${row.name}"?`);
		if (!confirm) return;
		try {
			if (row._isNew) {
				setRows((prev) => prev.filter((r, i) => i !== index));
				return;
			}
			await backendClient.delete(`/api/categories/${row.id}`);
			setRows((prev) => prev.filter((r) => r.id !== row.id));
		} catch (err) {
			console.error("Error deleting category", err);
			alert(err?.message || "Error deleting");
		}
	}

	return (
		<Box sx={{  }}>

			{/* Mobile layout */}
			{isMobile ? (
				<Box>
					<Stack direction="row" spacing={1} >
						<TextField
							value={mobileNewName}
							onChange={(e) => setMobileNewName(e.target.value)}
							size="small"
							placeholder="Nueva categoría"
							fullWidth
						/>
						<Button
							variant="contained"
							onClick={async () => {
								if (!mobileNewName.trim()) return;
								try {
									const created = await backendClient.post('/api/categories', { name: mobileNewName.trim() });
									setRows((r) => [created, ...r]);
									setMobileNewName('');
								} catch (err) {
									console.error('Error creating category', err);
									alert(err?.message || 'Error creando categoría');
								}
							}}
						>
							Agregar
						</Button>
					</Stack>

					<List disablePadding>
						{rows.map((row, index) => (
							<React.Fragment key={row.id ?? `new-${row._tempId || index}`}>
								<ListItem alignItems="flex-start" sx={{ py: 1 }}>
									{editingIndex === index ? (
										<Box sx={{ width: '100%' }}>
											<TextField
												value={editingValue}
												onChange={(e) => setEditingValue(e.target.value)}
												size="small"
												fullWidth
											/>
											<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
												<Button size="small" variant="contained" onClick={() => { saveRow({ ...row, name: editingValue }, index); setEditingIndex(null); }}>
												Guardar
												</Button>
												<Button size="small" onClick={() => setEditingIndex(null)}>Cancelar</Button>
											</Stack>
										</Box>
									) : (
										<>
											<ListItemText primary={row.name} secondary={row.creator?.name ? `Creador: ${row.creator.name}` : null} />
										</>
									)}
									{editingIndex !== index && (
										<ListItemSecondaryAction>
											<IconButton edge="end" aria-label="edit" onClick={() => { setEditingIndex(index); setEditingValue(row.name); }}>
												<EditIcon />
											</IconButton>
											<IconButton edge="end" aria-label="delete" onClick={() => deleteRow(row, index)} sx={{ ml: 1 }}>
												<DeleteIcon />
											</IconButton>
										</ListItemSecondaryAction>
									)}
								</ListItem>
								<Divider component="li" />
							</React.Fragment>
						))}
						{rows.length === 0 && (
							<ListItem>
								<ListItemText primary={loading ? 'Cargando...' : 'No hay categorías'} />
							</ListItem>
							)}
					</List>
				</Box>
			) : (
				/* Desktop layout (unchanged) */
				<TableContainer component={Paper}>
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell width={60}>#</TableCell>
								<TableCell>Nombre</TableCell>
								{/* <TableCell width={120}>Pública</TableCell> */}
								<TableCell width={220}>Acciones</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((row, index) => (
								<TableRow key={row.id ?? `new-${row._tempId || index}`}>
									<TableCell>{row.id ?? "-"}</TableCell>
									<TableCell>
										<TextField
											value={row.name}
											onChange={(e) => handleLocalChange(index, "name", e.target.value)}
											size="small"
											fullWidth
										/>
									</TableCell>
									<TableCell>
										<IconButton
											color="primary"
											onClick={() => saveRow(row, index)}
											disabled={savingIds.has(index)}
											title="Guardar"
										>
											<SaveIcon />
										</IconButton>
										<IconButton
											color="error"
											onClick={() => deleteRow(row, index)}
											title="Eliminar"
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							{rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={4} align="center">
										{loading ? "Cargando..." : "No hay categorías"}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</Box>
	);
}
