const request = require('supertest');
const app = require('../server');

describe('Backend API', () => {
  describe('GET /api/health', () => {
    it('should return status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/compile', () => {
    it('should return 400 if no latex content provided', async () => {
      const res = await request(app).post('/api/compile').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('No LaTeX content provided');
    });
  });

  describe('POST /api/download-latex', () => {
    it('should return 400 if no latex content provided', async () => {
      const res = await request(app).post('/api/download-latex').send({});
      expect(res.statusCode).toBe(400);
    });

    it('should return tex file when latex content provided', async () => {
      const latex = '\\documentclass{article}\\begin{document}Hello\\end{document}';
      const res = await request(app)
        .post('/api/download-latex')
        .send({ latex });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('application/x-tex');
      expect(res.text).toBe(latex);
    });
  });
});
