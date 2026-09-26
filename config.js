/* ---- Power of 2 presentation config ----
   SHEET_ID: the Google Sheet the CG forms will feed (leave empty = SAMPLE data).
   The loader expects a tab called "Reports" with these columns:
     Timestamp | Date | CG | Report | Value
   where Report is one of: Tuesday FLOW, Meeting God Service, Friday FLOW, Saturday Outreach, Sunday Attendance
   and Value is "CH1:Y;CH2:N" (each person answered for) for FLOW & Meeting God, a number for Outreach (souls) and Sunday (people brought).
   The sheet is created by CreateForms.gs → setup(); share it "Anyone with the link: Viewer".
   Page 1 (stage counting) is typed by hand in data.js → window.STAGE. */
window.P2_CONFIG = { SHEET_ID: '', TAB: 'Reports' };
