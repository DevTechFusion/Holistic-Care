import { useState, useEffect, useRef } from "react";
import {
  Box,
  Stack,
  Button,
  Typography,
  IconButton,
  Popover,
} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  AgentStatsCards,
  AgentAppointmentLeaderboard,
  DoctorsAvailabilityCard,
  WelcomeSection,
} from "../../../components/dashboard";
import { getAgentDashboard } from "../../../DAL/dashboard";
import { useTheme } from "@mui/material/styles";

const AgentDashboard = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [dateRangeAnchor, setDateRangeAnchor] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [incentive, setIncentive] = useState(0);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  // fetch dashboard data on filter change
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await getAgentDashboard(appliedStartDate, appliedEndDate);
        const incentiveValue = res?.data?.cards?.total_incentive ?? 0;
        setIncentive(incentiveValue);
      } catch (err) {
        console.error("Failed to fetch agent dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [appliedStartDate, appliedEndDate]);

  const handleDateRangeClick = (event) => {
    setDateRangeAnchor(event.currentTarget);
  };

  const handleDateRangeClose = () => {
    setDateRangeAnchor(null);
  };

  const handleDateRangeChange = (item) => {
    setDateRange([item.selection]);
    const start = item.selection.startDate;
    const end = item.selection.endDate;
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  const handleApplyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    handleDateRangeClose();
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'
      }
    ]);
    handleDateRangeClose();
  };

  const formatDateDisplay = (start, end) => {
    if (!start || !end) return "Select Date Range";
    return `${start} to ${end}`;
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "start" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <WelcomeSection />

        {/* Date Range Picker */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ 
            ml: { xs: 0, sm: 2 },
            mt: { xs: 2, sm: 0 },
            width: { xs: '100%', sm: 'auto' },
            flexWrap: 'wrap',
            '& > *': {
              my: 1
            }
          }}
        >
          <Button
            variant="outlined"
            startIcon={<CalendarTodayIcon />}
            onClick={handleDateRangeClick}
            sx={{
              minWidth: 200,
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderColor: 'divider',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
              '& .MuiButton-startIcon': {
                color: 'text.secondary',
              },
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            {appliedStartDate && appliedEndDate 
              ? formatDateDisplay(appliedStartDate, appliedEndDate)
              : 'Select Date Range'}
          </Button>

          <Popover
            open={Boolean(dateRangeAnchor)}
            anchorEl={dateRangeAnchor}
            onClose={handleDateRangeClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                borderRadius: 2,
                boxShadow: theme.shadows[8],
                '& .rdrDefinedRangesWrapper': {
                  borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                },
                '& .rdrDayToday .rdrDayNumber span:after': {
                  background: theme.palette.primary.main,
                },
                '& .rdrDayNumber span': {
                  color: theme.palette.text.primary,
                },
                '& .rdrDayPassive .rdrDayNumber span': {
                  color: theme.palette.text.disabled,
                },
                '& .rdrDay:not(.rdrDayPassive) .rdrInRange ~ .rdrDayNumber span': {
                  color: theme.palette.primary.contrastText,
                },
                '& .rdrDay:not(.rdrDayPassive) .rdrStartEdge ~ .rdrDayNumber span,': {
                  color: theme.palette.primary.contrastText,
                },
                '& .rdrDay:not(.rdrDayPassive) .rdrEndEdge ~ .rdrDayNumber span': {
                  color: theme.palette.primary.contrastText,
                },
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  Select Date Range
                </Typography>
                <IconButton size="small" onClick={handleDateRangeClose}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <DateRangePicker
                ranges={dateRange}
                onChange={handleDateRangeChange}
                moveRangeOnFirstSelection={false}
                months={2}
                direction="horizontal"
                showDateDisplay={false}
              />
              
              <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearFilters}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    px: 3,
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    px: 3,
                  }}
                >
                  Apply
                </Button>
              </Stack>
            </Box>
          </Popover>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {incentive !== undefined && (
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  color: 'primary.main',
                  whiteSpace: 'nowrap',
                  bgcolor: 'rgba(0, 183, 174, 0.1)',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {/* <MonetizationOnIcon fontSize="small" /> */}
                Total Incentive: Rs.{incentive.toFixed(2)}
              </Typography>
            )}
           
          </Box>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Box>
        <Stack
          direction="row"
          spacing={12}
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ mt: 4, mb: 4, flex: { xs: "1", lg: "0 0 auto" } }}>
            <Typography
              variant="h4"
              sx={{ mb: 3, fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2rem" } }}
            >
              Stat Cards
            </Typography>
            <AgentStatsCards startDate={appliedStartDate} endDate={appliedEndDate} />
          </Box>

          <Box sx={{ mb: 4, width: { xs: "100%", lg: "55%" } }}>
            <AgentAppointmentLeaderboard startDate={appliedStartDate} endDate={appliedEndDate} />
          </Box>
        </Stack>

        <Box sx={{ mt: 4, mb: 4, pl: { xs: 0, lg: 8 }, width: { xs: "100%", lg: "95%" } }}>
          <DoctorsAvailabilityCard startDate={appliedStartDate} endDate={appliedEndDate} />
        </Box>
      </Box>
    </Box>
  );  
};

export default AgentDashboard;
