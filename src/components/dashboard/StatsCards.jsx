import { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { CalendarToday, Person, PersonOff, Update } from "@mui/icons-material";
import { getAdminDashboard } from "../../DAL/dashboard";

const AdminStatsCards = ({ filter }) => {
  const [cards, setCards] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await getAdminDashboard(filter);
      if (response?.status === "success") {
        setCards(response.data.cards);
        console.log("fetched admin dashboard:", response.data.cards);
      }
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filter]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!cards) {
    return (
      <Box p={2}>
        <Typography variant="body1" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  const stats = [
    {
      title: "Total Bookings",
      icon: CalendarToday,
      value: cards.total_bookings,
      color: "#23C7B7",
    },
    {
      title: "Arrived Today",
      icon: Person,
      value: cards.arrived,
      color: "#23C7B7",
    },
    {
      title: "Not Arrived",
      icon: PersonOff,
      value: cards.not_arrived,
      color: "#23C7B7",
    },
    {
      title: "Rescheduled",
      icon: Update,
      value: cards.rescheduled,
      color: "#23C7B7",
    },
  ];

  return (
    <Grid container maxWidth="md" spacing={4}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Grid key={index} size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: "100%",
                minHeight: 150,
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Icon */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <IconComponent sx={{ color: stat.color, fontSize: 36 }} />
                </Box>

                {/* Value */}
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: stat.color,
                    mb: 1,
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </Typography>

                {/* Title */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default AdminStatsCards;