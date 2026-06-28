const { defineConfig } = require("cypress");
const fs = require("fs");
const path = require("path");

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      on("task", {
        writeFile({ filePath, content }) {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, content, "utf8");
          return null;
        },
        appendPartnerToExpectedContent({ filePath, partner }) {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          let existing = { PARTNERS: [] };
          if (fs.existsSync(filePath)) {
            existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
            if (!Array.isArray(existing.PARTNERS)) existing.PARTNERS = [];
          }
          const idx = existing.PARTNERS.findIndex((p) => p.uuid === partner.uuid);
          if (idx !== -1) {
            existing.PARTNERS[idx] = partner;
          } else {
            existing.PARTNERS.push(partner);
          }
          fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), "utf8");
          return null;
        },
      });
    },
  },
});
