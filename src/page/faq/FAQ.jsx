import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Alert, Box, Chip, Paper, Stack } from "@mui/material";

import Header from "../../components/Header";

const sections = [
  {
    id: "login",
    title: "How do I access the platform?",
    summary: "Use your username and password on the login page.",
    content:
      "Accounts are created by an admin. Once your account exists, sign in from the login page and you will land on the dashboard. The sidebar will show your own name and current access level.",
  },
  {
    id: "team",
    title: "What is the difference between User and Admin?",
    summary: "Admins can create accounts, users can work with the application.",
    content:
      "A User can browse the app, consult modules, select rows, and analyse KPI-related data. An Admin has the same access plus the ability to create new User or Admin accounts from Profile Form and review the full team list in Manage Team.",
  },
  {
    id: "import",
    title: "How do I load incidents, requests, and changes?",
    summary: "Use Import Excel to upload your source files.",
    content:
      "The Import Excel page is used to push operational data into the platform. After the upload, the Incidents, Requests, and Changes pages will use the latest imported rows for filtering, selection, and KPI analysis.",
  },
  {
    id: "kpi",
    title: "How does the KPI workflow work?",
    summary: "Define a KPI, open it, then analyse rows from its linked module.",
    content:
      "Create KPI definitions from Define KPI, review them in My KPIs, and open any KPI to see its details. From the KPI details page, use the direct shortcut to open the related module, select the rows that matter, and click Analyse to generate the KPI-focused dashboard.",
  },
  {
    id: "dashboards",
    title: "How do dashboards get generated?",
    summary: "Dashboards are built from the rows you select.",
    content:
      "The dashboard is not static. It is created from the exact rows you choose in Incidents, Requests, or Changes. This lets you build focused KPI dashboards for a specific scope without changing the source data itself.",
  },
  {
    id: "team-view",
    title: "What do I find in Manage Team and Profile Form?",
    summary: "Manage Team is for visibility, Profile Form is for account creation.",
    content:
      "Manage Team displays the list of existing application accounts and their access levels. Profile Form is where an admin creates new users or new admins so they can sign in and access the platform.",
  },
];

const FAQ = () => {
  const [expanded, setExpanded] = React.useState("login");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box>
      <Header title="FAQ & HELP" subTitle="Quick guidance for using the ITSM KPI platform" />

      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", md: "center" }}>
          <Chip label="Internal Guide" color="primary" variant="outlined" />
          <Typography variant="body2" color="text.secondary">
            This page explains the real workflow of the app: access, imports, KPI setup, team roles, and dashboard analysis.
          </Typography>
        </Stack>
      </Paper>

      <Alert severity="info" sx={{ mb: 3 }}>
        Best practice: import your operational data first, then define or open a KPI, select the matching rows, and launch the analysis dashboard.
      </Alert>

      <Stack direction="column" gap={2}>
        {sections.map((section) => (
          <Accordion
            key={section.id}
            expanded={expanded === section.id}
            onChange={handleChange(section.id)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${section.id}-content`}
              id={`${section.id}-header`}
            >
              <Typography sx={{ width: { xs: "100%", md: "38%" }, flexShrink: 0, fontWeight: 700 }}>
                {section.title}
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                {section.summary}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ lineHeight: 1.8 }}>
                {section.content}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Box>
  );
};

export default FAQ;
