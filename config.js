/* ---- Power of 2 presentation config ----
   SHEET_ID: the Google Sheet the CG forms will feed (leave empty = SAMPLE data).
   The loader expects a tab called "Reports" with these columns:
     Timestamp | Date | CG | Report | Value
   where Report is one of: Tuesday FLOW, Meeting God Service, Friday FLOW, Saturday Outreach, Sunday Attendance
   and Value is Yes/No for FLOW & Meeting God, a number for Outreach (souls) and Sunday (people brought).
   Page 1 (stage counting) is typed by hand in data.js → window.STAGE. */
window.P2_CONFIG = { SHEET_ID: '', TAB: 'Reports' };
