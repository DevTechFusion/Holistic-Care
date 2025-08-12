import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Box,
  InputAdornment,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useSnackbar } from "notistack";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext";
import "./LoginPage.css";

// Import images from assets
import doctorsImage from "../assets/images/doctors_image.png";
import logoImage from "../assets/images/logo.svg";
import leftBgImage from "../assets/images/left-bg.png";
import { login } from "../DAL/auth";

// Logo component with actual logo image
const Logo = () => {
  const theme = useTheme();

  return (
    <Box className="logo-container">
      <img src={logoImage} alt="Holistic Care Logo" className="logo-image" />
    </Box>
  );
};

// Login form component
const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { setLoading } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    if (!email.trim() || !password.trim()) {
      enqueueSnackbar("Please fill in all fields", { variant: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email, password });
      if (result.status === "success") {
        enqueueSnackbar("Login successful", { variant: "success" });
        navigate("/dashboard");
        localStorage.setItem("token", result.data.token);
      }
    } catch (error) {
      enqueueSnackbar(error.message || "Login failed", { variant: "error" });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <Box className="login-form-container">
      <Logo />

      <Typography variant="h4" className="login-title">
        LOGIN
      </Typography>

      <Typography variant="body1" className="login-subtitle">
        Enter your details to access the dashboard.
      </Typography>

      <Box className="form-fields">
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-field"
          required
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-field"
          required
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box className="form-options">
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="remember-checkbox"
                disabled={isLoading}
              />
            }
            label="Remember me"
            className="remember-label"
          />

          <Link href="#" className="forgot-password">
            Forgot Password?
          </Link>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </Box>
    </Box>
  );
};

// Main login page component
const LoginPage = () => {
  const theme = useTheme();

  return (
    <Box className="login-page">
      <Grid container className="login-container">
        {/* Left Column - Background Image with Overlay */}
        <Grid item xs={12} md={6} className="left-column">
          {/* Background image with overlay */}
          <Box className="left-bg-overlay">
            <img
              src={leftBgImage}
              alt="Background Pattern"
              className="left-bg-image"
            />
          </Box>

          {/* Doctors image */}
          <Box className="doctors-container">
            <img src={doctorsImage} alt="Doctors" className="doctors-image" />
          </Box>

          {/* Welcome text */}
          <Typography variant="h3" className="welcome-title" align="flex-start">
            Welcome to
            <br />
            Holistic Care CRM
          </Typography>

          <Typography variant="body1" className="welcome-description">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </Typography>
        </Grid>

        {/* Right Column - White Background */}
        <Grid item xs={12} md={6} className="right-column">
          {/* Background medical cross */}
          <Box className="medical-cross">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <path
                d="M60 20V100M20 60H100"
                stroke="rgba(0,0,0,0.03)"
                strokeWidth="8"
              />
            </svg>
          </Box>

          <LoginForm />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginPage;
