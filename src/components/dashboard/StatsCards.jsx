import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  CalendarToday,
  Person,
  Update,
} from "@mui/icons-material";

const StatsCards = () => {
  const stats = [
    {
      title: "Total Bookings",
      icon: CalendarToday,
      value: "50",
      change: "+13.3%",
      isPositive: true,
      color: "#23C7B7",
    },
    {
      title: "Arrived Today",
      icon: Person,
      value: "16",
      change: "-13.3%",
      isPositive: false,
      color: "#F56565",
    },
    {
      title: "Not Arrived",
      icon: Person,
      value: "32",
      change: "+13.3%",
      isPositive: true,
      color: "#23C7B7",
    },
    {
      title: "Rescheduled",
      icon: Update,
      value: "25",
      change: "+13.3%",
      isPositive: true,
      color: "#23C7B7",
    },
  ];

  return (
    <Grid container spacing={6}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon; // store the icon to render
        return (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "150px",
                width: "250px",
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                },
              }}
            >
              <CardContent sx={{ p:2, position: "relative" }}>
                {/* Icon */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <IconComponent sx={{ color: stat.color, fontSize: 32 }} />
                </Box>

                {/* Value */}
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: "bold",
                    color: stat.color,
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>

                {/* Title */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  {stat.title}
                </Typography>

                {/* Change */}
                <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, position: "absolute", top: 16, right: 16 }}>
                  {stat.isPositive ? (
                    <TrendingUp sx={{ color: "#23C7B7", fontSize: 20 }} />
                  ) : (
                    <TrendingDown sx={{ color: "#F56565", fontSize: 20 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: stat.isPositive ? "#23C7B7" : "#F56565",
                      fontWeight: 600,
                    }}
                  >
                    {stat.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default StatsCards;
