const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const summary = JSON.parse(
  fs.readFileSync(path.join(root, "coverage/coverage-summary.json"), "utf8"),
);
const results = JSON.parse(
  fs.readFileSync(path.join(root, "reports/test-results.json"), "utf8"),
);
const metrics = (source) =>
  Object.fromEntries(
    ["statements", "branches", "functions", "lines"].map((key) => [
      key,
      source[key].pct,
    ]),
  );
const files = Object.entries(summary)
  .filter(([name]) => name !== "total")
  .map(([name, data]) => ({
    name: path.relative(root, name),
    ...metrics(data),
  }));
const report = {
  generatedAt: new Date().toISOString(),
  suites: results.numTotalTestSuites,
  tests: results.numTotalTests,
  passed: results.numPassedTests,
  coverage: metrics(summary.total),
  files,
};
fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(
  path.join(root, "src/data/testReport.json"),
  JSON.stringify(report, null, 2) + "\n",
);
fs.writeFileSync(
  path.join(root, "reports/coverage-summary.json"),
  JSON.stringify({ total: metrics(summary.total), files }, null, 2) + "\n",
);
const rows = files
  .map(
    (file) =>
      `| ${file.name} | ${file.statements}% | ${file.branches}% | ${file.functions}% | ${file.lines}% |`,
  )
  .join("\n");
fs.writeFileSync(
  path.join(root, "reports/TEST-RESULTS.md"),
  `# Recorded Jest results\n\nGenerated: ${report.generatedAt}\n\n${report.passed}/${report.tests} tests passed across ${report.suites} suites.\n\n| Source file | Statements | Branches | Functions | Lines |\n| --- | --- | --- | --- | --- |\n${rows}\n| **Total** | **${report.coverage.statements}%** | **${report.coverage.branches}%** | **${report.coverage.functions}%** | **${report.coverage.lines}%** |\n\nRun \`npm run test:report\` to regenerate this snapshot and the in-app report. The complete HTML coverage report is generated locally at \`coverage/index.html\`.\n`,
);
console.log(
  `Saved results: ${report.passed}/${report.tests} tests passing, ${report.coverage.lines}% line coverage.`,
);
