import { createServer } from 'http';
import formidable from 'formidable';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// Simple test server to verify file uploads work
const server = createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/test-upload') {
    // Parse form data
    const form = new formidable.IncomingForm({
      multiples: true,
      uploadDir: join(process.cwd(), 'uploads'),
      keepExtensions: true,
    });

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Form parsing error', message: err.message }));
        return;
      }

      console.log('Received fields:', fields);
      console.log('Received files:', files);

      if (!files.file) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No file uploaded' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'File uploaded successfully',
        file: {
          name: files.file.originalFilename || files.file.newFilename,
          size: files.file.size,
          type: files.file.mimetype
        }
      }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Test upload server running on http://localhost:${PORT}/test-upload`);
  console.log('Use this endpoint to test if file uploads work independently');
});