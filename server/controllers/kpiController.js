import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configDir = path.join(__dirname, '../config');
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure directories exist
[configDir, uploadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export const saveConfig = async (req, res) => {
  try {
    const config = req.body;
    
    // Validate required fields
    if (!config || !config.caseFileId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid configuration data: caseFileId is required'
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '');
    const filename = `K_${config.caseFileId}_${timestamp}.json`;
    const filepath = path.join(configDir, filename);

    // Log the configuration being saved
    console.log('Saving configuration:', {
      filename,
      configData: config
    });

    fs.writeFileSync(filepath, JSON.stringify(config, null, 2));

    return res.json({
      success: true,
      configId: filename,
      message: 'Configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving configuration:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save configuration'
    });
  }
};

export const loadConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const filepath = path.join(configDir, id);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        error: 'Configuration not found'
      });
    }

    const config = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error loading configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load configuration'
    });
  }
};

export const listConfigs = async (req, res) => {
  try {
    const files = fs.readdirSync(configDir);
    const configs = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(configDir, file);
        const stats = fs.statSync(filepath);
        return {
          id: file,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      });

    res.json({
      success: true,
      configs
    });
  } catch (error) {
    console.error('Error listing configurations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list configurations'
    });
  }
};

export const handleFileUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const headers = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0];

    res.json({
      success: true,
      fileId: req.file.filename,
      headers
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process uploaded file'
    });
  }
};