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
import { useAuth } from "../../contexts/AuthContext";
import "./LoginPage.css";

// Images
import doctorsImage from "../../assets/images/doctors_image.png";
import logo from "../../assets/images/logo.svg";
import leftBgPattern from "../../assets/images/left-bg.png";
import { login } from "../../DAL/auth";

const Logo = () => (
  <Box className="logo-container">
    <img src={logo} alt="Holistic Care Logo" className="logo-image" />
  </Box>
);

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
      setLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email, password });
      if (result?.status === "success") {
        enqueueSnackbar("Login successful", { variant: "success" });
        localStorage.setItem("token", result.data.token);
        navigate("/dashboard");
      } else {
        enqueueSnackbar(result?.message || "Login failed", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar(error?.message || "Login failed", { variant: "error" });
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
                  onClick={() => setShowPassword((s) => !s)}
                  edge="end"
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

          <Link href="#" className="forgot-password" underline="none">
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

const LoginPage = () => {
  const theme = useTheme();

  return (
    <Box className="login-page">
      <Grid container className="login-container">
        {/* Left panel */}
        <Grid
          item
          xs={12}
          md={5}
          className="left-column"
          sx={{
            width: {
              xs: "100%", // mobile
              sm: "40%", // small
            },
          }}
        >
          <img src={leftBgPattern} alt="pattern" className="left-bg-pattern" />
          <Box className="doctors-container">
            <img src={doctorsImage} alt="Doctors" className="doctors-image" />
          </Box>

          <Typography variant="h3" className="welcome-title">
            Welcome to
            <br />
            Holistic Care CRM
          </Typography>

          <Typography variant="body1" className="welcome-description">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s.
          </Typography>
        </Grid>

        {/* Right panel */}
        <Grid
          item
          xs={12}
          md={7}
          className="right-column"
          sx={{
            width: {
              xs: "100%", // mobile
              sm: "60%", // small
            },
          }}
        >
          <Box className="medical-cross" aria-hidden>
            <svg width="220" height="220" viewBox="0 0 120 120" fill="none">
              <path
                d="M60 20V100M20 60H100"
                stroke="rgba(0,0,0,0.05)"
                strokeWidth="8"
                strokeLinecap="round"
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
