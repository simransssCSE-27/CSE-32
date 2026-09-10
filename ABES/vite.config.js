import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==================================================
   SUBJECT NOTES MANIFEST
================================================== */

function subjectNotesManifest() {
  const root = path.resolve(
    __dirname,
    "resources",
    "subject-notes"
  );

  const virtualId = "virtual:subject-notes";
  const resolvedId = `\0${virtualId}`;

  function collect(directory, subject, folder, files) {
    if (!fs.existsSync(directory)) return;

    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true,
    })) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        const nextFolder = folder
          ? `${folder}/${entry.name}`
          : entry.name;

        collect(
          fullPath,
          subject,
          nextFolder,
          files
        );
      } else if (
        path.extname(entry.name).toLowerCase() === ".pdf"
      ) {
        const relativePath = folder
          ? `${subject}/${folder}/${entry.name}`
          : `${subject}/${entry.name}`;

        files.push({
          subject,
          folder,
          file: entry.name,
          relativePath,
        });
      }
    }
  }

  return {
    name: "subject-notes-manifest",

    resolveId(id) {
      if (id === virtualId) {
        return resolvedId;
      }

      return undefined;
    },

    load(id) {
      if (id !== resolvedId) {
        return undefined;
      }

      const files = [];

      if (fs.existsSync(root)) {
        for (const entry of fs.readdirSync(root, {
          withFileTypes: true,
        })) {
          const fullPath = path.join(
            root,
            entry.name
          );

          if (entry.isDirectory()) {
            collect(
              fullPath,
              entry.name,
              "",
              files
            );
          }
        }
      }

      return `export default ${JSON.stringify(files)};`;
    },
  };
}

/* ==================================================
   QUESTION PAPERS MANIFEST
================================================== */

function questionPaperManifest() {
  const root = path.resolve(
    __dirname,
    "resources",
    "question-papers"
  );

  const virtualId = "virtual:question-papers";
  const resolvedId = `\0${virtualId}`;

  function collect(
    directory,
    relativeDirectory,
    files
  ) {
    if (!fs.existsSync(directory)) return;

    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true,
    })) {
      const fullPath = path.join(
        directory,
        entry.name
      );

      const relativePath = relativeDirectory
        ? `${relativeDirectory}/${entry.name}`
        : entry.name;

      if (entry.isDirectory()) {
        collect(
          fullPath,
          relativePath,
          files
        );
      } else if (
        path.extname(entry.name).toLowerCase() === ".pdf"
      ) {
        files.push({
          file: entry.name,
          relativePath,
        });
      }
    }
  }

  return {
    name: "question-papers-manifest",

    resolveId(id) {
      if (id === virtualId) {
        return resolvedId;
      }

      return undefined;
    },

    load(id) {
      if (id !== resolvedId) {
        return undefined;
      }

      const files = [];

      if (fs.existsSync(root)) {
        collect(
          root,
          "",
          files
        );
      }

      return `export default ${JSON.stringify(files)};`;
    },
  };
}

/* ==================================================
   SERVE RESOURCES DURING DEVELOPMENT
================================================== */

function serveResources() {
  const resourcesRoot = path.resolve(
    __dirname,
    "resources"
  );

  return {
    name: "serve-resources",

    configureServer(server) {
      server.middlewares.use(
        "/resources",
        (req, res, next) => {
          try {
            const requestUrl = req.url || "";

            const cleanUrl =
              requestUrl.split("?")[0];

            const decodedUrl =
              decodeURIComponent(cleanUrl);

            const relativePath =
              decodedUrl.replace(
                /^\/+/,
                ""
              );

            const filePath =
              path.resolve(
                resourcesRoot,
                relativePath
              );

            /* Security check */
            if (
              !filePath.startsWith(resourcesRoot)
            ) {
              return next();
            }

            if (
              !fs.existsSync(filePath) ||
              !fs.statSync(filePath).isFile()
            ) {
              return next();
            }

            const extension =
              path
                .extname(filePath)
                .toLowerCase();

            const mimeTypes = {
              ".pdf": "application/pdf",
              ".png": "image/png",
              ".jpg": "image/jpeg",
              ".jpeg": "image/jpeg",
              ".webp": "image/webp",
              ".svg": "image/svg+xml",
              ".txt": "text/plain",
            };

            res.statusCode = 200;

            res.setHeader(
              "Content-Type",
              mimeTypes[extension] ||
                "application/octet-stream"
            );

            /* Show PDFs inside iframe/browser */
            res.setHeader(
              "Content-Disposition",
              "inline"
            );

            fs.createReadStream(
              filePath
            ).pipe(res);

            return;
          } catch (error) {
            console.error(
              "Resource error:",
              error
            );

            return next();
          }
        }
      );
    },
  };
}

/* ==================================================
   COPY RESOURCES DURING BUILD
================================================== */

function staticResources() {
  const resourcesRoot = path.resolve(
    __dirname,
    "resources"
  );

  return {
    name: "static-resources",

    generateBundle() {
      if (!fs.existsSync(resourcesRoot)) {
        return;
      }

      function addDirectory(
        directory,
        relativeDirectory
      ) {
        for (const entry of fs.readdirSync(
          directory,
          {
            withFileTypes: true,
          }
        )) {
          const fullPath = path.join(
            directory,
            entry.name
          );

          if (entry.isDirectory()) {
            addDirectory(
              fullPath,
              path.join(
                relativeDirectory,
                entry.name
              )
            );
          } else if (
            !entry.name.endsWith(".zip")
          ) {
            const fileName =
              path
                .join(
                  relativeDirectory,
                  entry.name
                )
                .replace(/\\/g, "/");

            this.emitFile({
              type: "asset",
              fileName,
              source:
                fs.readFileSync(
                  fullPath
                ),
            });
          }
        }
      }

      addDirectory(
        resourcesRoot,
        "resources"
      );
    },
  };
}

/* ==================================================
   VITE CONFIG
================================================== */

export default defineConfig({
  plugins: [
    subjectNotesManifest(),
    questionPaperManifest(),
    serveResources(),
    staticResources(),
    react(),
  ],

  publicDir: "public",

  build: {
    outDir: "dist",
  },
});