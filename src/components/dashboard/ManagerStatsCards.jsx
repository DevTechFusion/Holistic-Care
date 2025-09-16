import { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import { CalendarToday, Person, Update } from "@mui/icons-material";
import { getManagerDashboard } from "../../DAL/dashboard";

const StatsCards = ({ filter }) => {
  const [cards, setCards] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getManagerDashboard(filter);
        if (response?.status === "success") {
         
          setCards(response.data.cards);
          console.log("fetched manager dashboard:", response.data.cards);
        }
      } catch (error) {
        console.error("Error fetching manager dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [filter]);

  if (loading) return <p>Loading...</p>;
  if (!cards) return <p>No data available</p>;

  const stats = [
    {
      title: "Total Mistakes",
      icon: CalendarToday,
      value: cards.total_mistakes,
      color: "#23C7B7",
    },
    {
      title: "Frequent Mistake Type",
      icon: Person,
      value: cards.most_frequent_type?.complaint_type?.name || "N/A",
      color: "#23C7B7",
    },
    {
      title: "Top Agent By Mistake Type",
      icon: Person,
      value: cards.top_agent?.agent?.name || "N/A",
      color: "#23C7B7",
    },
    {
      title: "New Clients",
      icon: Update,
      value: cards.new_clients,
      color: "#23C7B7",
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: "150px",
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  transition: "all 0.3s ease",
                },
              }}
            >
              <CardContent sx={{ p: 2, position: "relative" }}>
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
                    fontWeight: "medium",
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

export default StatsCards;