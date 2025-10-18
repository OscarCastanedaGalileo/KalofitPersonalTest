import React from "react";
import {
	Box,
	TextField,
	InputAdornment,
	IconButton,
	Button,
	Paper,
	Typography,
	Divider,
} from "@mui/material";
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router";
import { BannerTop } from "../components/BannerTop";

export function ResetPassword() {
	const navigate = useNavigate();

	// store code as six individual digits for separate inputs
	const [codeDigits, setCodeDigits] = React.useState(() => Array(6).fill(""));
	const [values, setValues] = React.useState({ password: "", confirm: "" });
	const [errors, setErrors] = React.useState({ code: "", password: "", confirm: "" });
	const [showPassword, setShowPassword] = React.useState(false);
	const [showConfirm, setShowConfirm] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);
  const location = useLocation();
  const email = location.state?.email || "your email";
	const codeRefs = React.useRef([]);

		const handleChange = (field) => (e) => {
			const val = e.target.value;
			setValues((v) => ({ ...v, [field]: val }));
			setErrors((s) => ({ ...s, [field]: "" }));
		};

		const handleCodeChange = (index) => (e) => {
			const ch = e.target.value.replace(/\D/g, "").slice(-1); // last digit only
			setCodeDigits((prev) => {
				const next = [...prev];
				next[index] = ch;
				return next;
			});
			setErrors((s) => ({ ...s, code: "" }));
			if (ch && codeRefs.current[index + 1]) {
				codeRefs.current[index + 1].focus();
			}
		};

		const handleCodeKeyDown = (index) => (e) => {
			const key = e.key;
			if (key === "Backspace") {
				if (codeDigits[index]) {
					// clear current
					setCodeDigits((prev) => {
						const next = [...prev];
						next[index] = "";
						return next;
					});
				} else if (codeRefs.current[index - 1]) {
					codeRefs.current[index - 1].focus();
				}
			} else if (key === "ArrowLeft" && codeRefs.current[index - 1]) {
				codeRefs.current[index - 1].focus();
			} else if (key === "ArrowRight" && codeRefs.current[index + 1]) {
				codeRefs.current[index + 1].focus();
			}
		};

		const handleCodePaste = (e) => {
			e.preventDefault();
			const paste = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
			if (!paste) return;
			const digits = paste.slice(0, 6).split("");
			setCodeDigits((prev) => {
				const next = [...prev];
				for (let i = 0; i < digits.length; i++) next[i] = digits[i];
				return next;
			});
			// focus after last pasted digit
			const focusIndex = Math.min(digits.length, 6) - 1;
			if (codeRefs.current[focusIndex + 1]) codeRefs.current[focusIndex + 1].focus();
		};

	const validate = () => {
		const next = { code: "", password: "", confirm: "" };
		let ok = true;

			const joined = codeDigits.join("");
			if (!joined || joined.length !== 6) {
				next.code = "Enter the 6-digit code sent to your email";
				ok = false;
			}

		if (!values.password || values.password.length < 6) {
			next.password = "Password must be at least 6 characters";
			ok = false;
		}

		if (values.password !== values.confirm) {
			next.confirm = "Passwords do not match";
			ok = false;
		}

		setErrors(next);
		return ok;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (submitting) return;
		if (!validate()) return;

		setSubmitting(true);
		try {
			// Replace with your API call to verify code and update password
			const payload = { code: codeDigits.join(""), password: values.password };
			console.log("Resetting password with:", payload);
			// Simulate async call
			await new Promise((res) => setTimeout(res, 800));
			// Navigate to login or show success UI
			navigate("/reset-success");
		} catch (err) {
			console.error(err);
			// Handle server errors and show messages
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
			<BannerTop title="Reset password" backTo="/login" />

			<Box
				component="form"
				id="reset-form"
				onSubmit={handleSubmit}
				noValidate
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					px: 2,
					py: 3,
					minHeight: `calc(80vh - 96px)`,
					justifyContent: "center",
				}}
			>
				<Box sx={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 2 }}>
					<Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
						Please enter the password reset code that we have sent to your email, {email}.
					</Typography>


					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 8 }} onPaste={handleCodePaste}>
						<Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
							{codeDigits.map((digit, idx) => (
								<TextField
									key={idx}
									inputRef={(el) => (codeRefs.current[idx] = el)}
									value={digit}
									onChange={handleCodeChange(idx)}
									onKeyDown={handleCodeKeyDown(idx)}
									inputProps={{ inputMode: 'numeric', pattern: '\\d*', maxLength: 1, style: { textAlign: 'center', fontSize: '1.1rem' } }}
									sx={{ width: 64 }}
									variant="outlined"
									size="small"
								/>
							))}
						</Box>
						{errors.code ? (
							<Typography variant="caption" color="error" sx={{ textAlign: 'center' }}>
								{errors.code}
							</Typography>
						) : null}
					</Box>

					{/* <Divider sx={{ my: 1.5, opacity: 0.7 }} /> */}

					<TextField
						label="New password"
						type={showPassword ? "text" : "password"}
						value={values.password}
						onChange={handleChange("password")}
						fullWidth
						required
						error={!!errors.password}
						helperText={errors.password}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Lock />
								</InputAdornment>
							),
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label={showPassword ? "Hide password" : "Show password"}
										onClick={() => setShowPassword((s) => !s)}
										edge="end"
									>
										{showPassword ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>

					<TextField
						label="Confirm password"
						type={showConfirm ? "text" : "password"}
						value={values.confirm}
						onChange={handleChange("confirm")}
						fullWidth
						required
						error={!!errors.confirm}
						helperText={errors.confirm}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<Lock />
								</InputAdornment>
							),
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label={showConfirm ? "Hide password" : "Show password"}
										onClick={() => setShowConfirm((s) => !s)}
										edge="end"
									>
										{showConfirm ? <VisibilityOff /> : <Visibility />}
									</IconButton>
								</InputAdornment>
							),
						}}
					/>
				</Box>
			</Box>

			<Paper
				elevation={6}
				sx={{
					position: "fixed",
					left: 0,
					right: 0,
					bottom: 0,
					border: "none",
					boxShadow: "none",
					borderTopLeftRadius: 16,
					borderTopRightRadius: 16,
					p: 2,
					pb: `calc(16px + env(safe-area-inset-bottom))`,
					bgcolor: "background.paper",
				}}
			>
				<Button
					variant="contained"
					size="large"
					type="submit"
					form="reset-form"
					fullWidth
					disabled={submitting}
					sx={{ borderRadius: 2, py: 1.4, textTransform: "none", fontWeight: 600 }}
				>
					{submitting ? "Updating…" : "Reset"}
				</Button>
			</Paper>

			<Box sx={{ height: 96 }} />
		</Box>
	);
}
